const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const Razorpay = require("razorpay");

admin.initializeApp();

// NOTE: In a production app, use Firebase Secrets to store these securely
// firebase functions:secrets:set RAZORPAY_KEY_ID=...
// firebase functions:secrets:set RAZORPAY_KEY_SECRET=...
const razorpay = new Razorpay({
  key_id: "rzp_test_Spvxd0aXv1knrF",
  key_secret: "NKP6VfjKKbAdBZ1wQy4zAx66",
});

/**
 * Creates a Razorpay Order
 */
exports.createRazorpayOrder = onCall({ cors: true }, async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const amount = request.data.amount; // amount in INR
  const currency = "INR";

  if (!amount || amount <= 0) {
    throw new HttpsError("invalid-argument", "Amount must be greater than 0.");
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    // Log the order creation in Firestore for audit
    await admin.firestore().collection("payment_logs").add({
      userId: request.auth.uid,
      razorpayOrderId: order.id,
      amount: amount,
      status: "order_created",
      timestamp: FieldValue.serverTimestamp(),
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    throw new HttpsError("internal", error.message || "Failed to create Razorpay order.");
  }
});

/**
 * Verifies Razorpay Payment Signature (Optional but recommended)
 */
exports.verifyRazorpayPayment = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.data;

  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", "NKP6VfjKKbAdBZ1wQy4zAx66");
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === razorpay_signature) {
    // Signature verified
    await admin.firestore().collection("payment_logs").add({
      userId: request.auth.uid,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "verified",
      timestamp: FieldValue.serverTimestamp(),
    });
    return { status: "success" };
  } else {
    throw new HttpsError("invalid-argument", "Invalid signature. Payment verification failed.");
  }
});
