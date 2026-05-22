const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: "*", // In production, replace with your frontend URL
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Load Razorpay keys from environment variables or use test keys as fallback
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// Root endpoint to verify server status
app.get("/", (req, res) => {
  res.json({
    status: "active",
    message: "Maple E-commerce Razorpay Backend is running!",
    mode: keyId.startsWith("rzp_test") ? "test" : "live"
  });
});

/**
 * Creates a Razorpay Order
 * Expects { amount } in the request body (amount in INR)
 */
app.post("/api/create-order", async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0." });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({
      error: error.message || "Failed to create Razorpay order."
    });
  }
});

/**
 * Verifies Razorpay Payment Signature
 * Expects { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing required signature verification parameters." });
  }

  try {
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      res.json({ status: "success", verified: true });
    } else {
      res.status(400).json({ status: "failed", error: "Invalid signature. Verification failed." });
    }
  } catch (error) {
    console.error("Signature Verification Error:", error);
    res.status(500).json({ error: "Internal server error during signature verification." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Razorpay Mode: ${keyId.startsWith("rzp_test") ? "TEST" : "LIVE"}`);
});
