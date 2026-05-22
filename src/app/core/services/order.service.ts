import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import { collection, addDoc, query, where, orderBy, doc } from 'firebase/firestore';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CartItem } from './cart.service';

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    zip: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(Injector);

  constructor() {}

  createOrder(orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status'>): Observable<string> {
    const user = this.authService.currentUserValue;
    if (!user) return from(Promise.reject('User must be logged in to place an order'));

    const ordersRef = collection(this.firestore, 'orders');
    const newOrder: Omit<Order, 'id'> = {
      ...orderData,
      userId: user.id,
      status: 'processing',
      createdAt: new Date()
    };

    return from(addDoc(ordersRef, newOrder)).pipe(
      switchMap(docRef => of(docRef.id))
    );
  }

  getUserOrders(): Observable<Order[]> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        const ordersRef = collection(this.firestore, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        return runInInjectionContext(this.injector, () => collectionData(q, { idField: 'id' })) as Observable<Order[]>;
      })
    );
  }

  getOrderById(orderId: string): Observable<Order | undefined> {
    const orderRef = doc(this.firestore, `orders/${orderId}`);
    return runInInjectionContext(this.injector, () => docData(orderRef, { idField: 'id' })) as Observable<Order | undefined>;
  }
}
