import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, updateDoc, doc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaymentLog {
  id?: string;
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'attempted' | 'success' | 'failed';
  responsePayload?: any;
  timestamp: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private firestore = inject(Firestore);

  constructor() {}

  /**
   * Logs a payment attempt
   */
  logPaymentAttempt(data: Omit<PaymentLog, 'timestamp' | 'status'>): Observable<string> {
    const logsRef = collection(this.firestore, 'payment_logs');
    const log: Omit<PaymentLog, 'id'> = {
      ...data,
      status: 'attempted',
      timestamp: serverTimestamp()
    };
    return from(addDoc(logsRef, log)).pipe(
      // @ts-ignore
      map(docRef => docRef.id)
    );
  }

  /**
   * Updates an existing payment log with success/failure data
   */
  updatePaymentStatus(logId: string, status: 'success' | 'failed', payload: any): Observable<void> {
    const logRef = doc(this.firestore, `payment_logs/${logId}`);
    return from(updateDoc(logRef, {
      status,
      responsePayload: payload,
      updatedAt: serverTimestamp()
    }));
  }
}
