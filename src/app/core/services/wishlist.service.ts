import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from './product.service';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private wishlistItemsSubject = new BehaviorSubject<Product[]>([]);
  public wishlistItems$ = this.wishlistItemsSubject.asObservable();

  public wishlistCount$ = this.wishlistItems$.pipe(
    map(items => items.length)
  );

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadWishlistFromFirestore(user.id);
      } else {
        this.wishlistItemsSubject.next([]);
      }
    });
  }

  private loadWishlistFromFirestore(userId: string) {
    const wishlistRef = doc(this.firestore, `wishlists/${userId}`);
    onSnapshot(wishlistRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        this.wishlistItemsSubject.next(data['items'] || []);
      }
    });
  }

  private async syncToFirestore() {
    const user = this.authService.currentUserValue;
    if (user) {
      const wishlistRef = doc(this.firestore, `wishlists/${user.id}`);
      await setDoc(wishlistRef, { items: this.wishlistItemsSubject.value });
    }
  }

  toggleWishlist(product: Product) {
    const currentItems = this.wishlistItemsSubject.value;
    const exists = currentItems.some(item => item.id === product.id);

    if (exists) {
      this.wishlistItemsSubject.next(currentItems.filter(item => item.id !== product.id));
    } else {
      this.wishlistItemsSubject.next([...currentItems, product]);
    }
    this.syncToFirestore();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItemsSubject.value.some(item => item.id === productId);
  }

  clearWishlist() {
    this.wishlistItemsSubject.next([]);
    this.syncToFirestore();
  }
}
