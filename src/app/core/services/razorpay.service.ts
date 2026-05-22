import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  private rzpKeyId = 'rzp_test_Spvxd0aXv1knrF'; // Your test Key ID
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Dynamically loads the Razorpay checkout script
   */
  lazyLoadRazorpay(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      if ((window as any).Razorpay) {
        observer.next(true);
        observer.complete();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        observer.next(true);
        observer.complete();
      };
      script.onerror = () => {
        observer.error('Razorpay SDK failed to load');
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Creates a Razorpay Order via Express API backend
   */
  createOrder(amount: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/create-order`, { amount }).pipe(
      map(response => ({ data: response }))
    );
  }

  /**
   * Opens the Razorpay checkout modal
   * @param options Razorpay checkout options
   */
  openCheckout(options: any): void {
    const rzp = new (window as any).Razorpay({
      ...options,
      key: this.rzpKeyId,
    });
    rzp.open();
  }
}

