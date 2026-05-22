import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { RazorpayService } from '../../core/services/razorpay.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  public cartService = inject(CartService);
  private router = inject(Router);
  private razorpayService = inject(RazorpayService);
  private paymentService = inject(PaymentService);

  activeStep = 1;
  isProcessing = false;
  isSuccess = false;
  orderId: string = '';

  checkoutForm: FormGroup;

  cartItems$ = this.cartService.cartItems$;
  cartTotal$ = this.cartService.cartTotal$;

  constructor() {
    this.checkoutForm = this.fb.group({
      address: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        street: ['', Validators.required],
        city: ['', Validators.required],
        zip: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      }),
      payment: this.fb.group({
        method: ['razorpay', Validators.required]
      })
    });
  }

  nextStep() {
    if (this.activeStep === 1 && this.checkoutForm.get('address')?.invalid) {
      this.checkoutForm.get('address')?.markAllAsTouched();
      return;
    }
    if (this.activeStep === 2 && this.checkoutForm.get('payment')?.invalid) {
      this.checkoutForm.get('payment')?.markAllAsTouched();
      return;
    }
    this.activeStep++;
  }

  prevStep() {
    if (this.activeStep > 1) {
      this.activeStep--;
    }
  }

  private toastService = inject(ToastService);

  removeItem(cartItemId: string) {
    this.cartService.removeFromCart(cartItemId);
    this.toastService.show('Item removed from cart', 'info');
  }

  async processPayment() {
    if (this.checkoutForm.invalid) return;

    this.isProcessing = true;

    try {
      const address = this.checkoutForm.get('address')?.value;
      const cartItems: any = await new Promise(resolve => this.cartItems$.subscribe(items => resolve(items)));
      const total: any = await new Promise(resolve => this.cartTotal$.subscribe(t => resolve(t)));

      // 1. Load Razorpay Script
      this.razorpayService.lazyLoadRazorpay().subscribe({
        next: (loaded) => {
          if (loaded) {
            // 2. Create Order securely via Backend (Cloud Functions)
            this.razorpayService.createOrder(total).subscribe({
              next: (orderResponse: any) => {
                const orderData = orderResponse.data;

                // 3. Open Razorpay Checkout
                const options = {
                  description: 'Maple E-commerce Purchase',
                  image: 'https://razorpay.com/assets/razorpay-glyph.svg',
                  currency: orderData.currency,
                  amount: orderData.amount,
                  order_id: orderData.orderId, // This is the Razorpay Order ID from backend
                  name: 'Maple Store',
                  prefill: {
                    name: `${address.firstName} ${address.lastName}`,
                    email: 'customer@example.com',
                    contact: '9999999999'
                  },
                  theme: {
                    color: '#000000'
                  },
                  handler: (response: any) => {
                    this.paymentService.logPaymentAttempt({
                      amount: total,
                      currency: 'INR',
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpayOrderId: response.razorpay_order_id,
                      razorpaySignature: response.razorpay_signature
                    }).subscribe({
                      next: (logId) => {
                        this.paymentService.updatePaymentStatus(logId, 'success', response).subscribe({
                          error: (err) => console.warn('Failed to update payment status log in Firestore:', err)
                        });
                      },
                      error: (err) => {
                        console.warn('Payment logging to Firestore skipped (check rules):', err);
                      }
                    });
                    
                    this.finalizeOrder(cartItems, total, address, response.razorpay_payment_id);
                  },
                  modal: {
                    ondismiss: () => {
                      this.isProcessing = false;
                      this.toastService.show('Payment cancelled', 'info');
                      
                      this.paymentService.logPaymentAttempt({
                        amount: total,
                        currency: 'INR',
                        razorpayOrderId: orderData.orderId
                      }).subscribe({
                        next: (logId) => {
                          this.paymentService.updatePaymentStatus(logId, 'failed', { reason: 'User dismissed modal' }).subscribe({
                            error: (err) => console.warn('Failed to update payment status log in Firestore:', err)
                          });
                        },
                        error: (err) => {
                          console.warn('Payment logging to Firestore skipped (check rules):', err);
                        }
                      });
                    }
                  }
                };

                this.razorpayService.openCheckout(options);
              },
              error: (err) => {
                console.error('Secure order creation failed:', err);
                this.isProcessing = false;
                this.toastService.show('Failed to initiate secure payment. Please try again.', 'error');
              }
            });
          }
        },
        error: (err) => {
          this.isProcessing = false;
          this.toastService.show('Failed to load payment gateway', 'error');
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      this.isProcessing = false;
    }
  }

  private finalizeOrder(cartItems: any, total: number, address: any, paymentId: string) {
    this.orderService.createOrder({
      items: cartItems,
      total: total,
      shippingAddress: address
    }).subscribe({
      next: (id) => {
        this.orderId = id;
        this.isProcessing = false;
        this.isSuccess = true;
        this.cartService.clearCart();
        this.toastService.show(`Payment successful! Order ID: ${id}`, 'success');
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.isProcessing = false;
        alert('Payment was successful, but we failed to save your order. Please contact support with Payment ID: ' + paymentId);
      }
    });
  }
}
