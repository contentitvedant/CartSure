import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from './product.service';
import { Firestore, doc, setDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSpec?: string;
  cartItemId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  public cartTotal$ = this.cartItems$.pipe(
    map(items => items.reduce((total, item) => total + (item.product.price * item.quantity), 0))
  );

  public cartCount$ = this.cartItems$.pipe(
    map(items => items.reduce((count, item) => count + item.quantity, 0))
  );

  constructor() {
    // Sync with Firestore when user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCartFromFirestore(user.id);
      } else {
        this.cartItemsSubject.next([]); // Clear cart on logout
      }
    });
  }

  private async loadCartFromFirestore(userId: string) {
    const cartRef = doc(this.firestore, `carts/${userId}`);
    onSnapshot(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        this.cartItemsSubject.next(data['items'] || []);
      }
    });
  }

  private async syncToFirestore() {
    const user = this.authService.currentUserValue;
    if (user) {
      const cartRef = doc(this.firestore, `carts/${user.id}`);
      await setDoc(cartRef, { items: this.cartItemsSubject.value });
    }
  }

  addToCart(product: Product, quantity = 1, selectedColor?: string, selectedSpec?: string) {
    const currentItems = this.cartItemsSubject.value;
    const cartItemId = `${product.id}-${selectedColor || 'none'}-${selectedSpec || 'none'}`;
    
    const existingItem = currentItems.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
      existingItem.quantity += quantity;
      this.cartItemsSubject.next([...currentItems]);
    } else {
      const newItem: CartItem = { product, quantity, selectedColor, selectedSpec, cartItemId };
      this.cartItemsSubject.next([...currentItems, newItem]);
    }
    this.syncToFirestore();
  }

  removeFromCart(cartItemId: string) {
    const updatedItems = this.cartItemsSubject.value.filter(item => item.cartItemId !== cartItemId);
    this.cartItemsSubject.next(updatedItems);
    this.syncToFirestore();
  }

  updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(cartItemId);
      return;
    }
    const updatedItems = this.cartItemsSubject.value.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity };
      }
      return item;
    });
    this.cartItemsSubject.next(updatedItems);
    this.syncToFirestore();
  }

  clearCart() {
    this.cartItemsSubject.next([]);
    this.syncToFirestore();
  }
}
