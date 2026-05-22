import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isAdded = false;

  get isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated) {
      alert('Please login to add items to your wishlist! 🔒');
      this.router.navigate(['/auth']);
      return;
    }
    this.wishlistService.toggleWishlist(this.product);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated) {
      alert('Please login to add items to your cart! 🔒');
      this.router.navigate(['/auth']);
      return;
    }
    const color = (this.product.colors && this.product.colors.length) ? this.product.colors[0] : undefined;
    const spec = (this.product.specs && this.product.specs.length) ? this.product.specs[0] : undefined;
    this.cartService.addToCart(this.product, 1, color, spec);
    
    // Visual feedback
    this.isAdded = true;
    this.toastService.show(`${this.product.name} added to bag! 🛍️`);
    
    setTimeout(() => {
      this.isAdded = false;
    }, 2000);
  }
}
