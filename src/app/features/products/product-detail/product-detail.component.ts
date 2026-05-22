import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  product: Product | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  activeImageIndex = 0;
  selectedColor = '';
  selectedSpec = '';

  isAddingToCart = false;

  get isInWishlist(): boolean {
    return this.product ? this.wishlistService.isInWishlist(this.product.id) : false;
  }

  get currentPrice(): number {
    if (!this.product) return 0;
    if (!this.product.specs || this.product.specs.length <= 1) return this.product.price;
    
    const index = this.product.specs.indexOf(this.selectedSpec);
    if (index <= 0) return this.product.price;
    
    // Storage-based pricing for main devices
    const storageCategories = ['iPhone', 'iPad', 'Mac'];
    if (storageCategories.includes(this.product.category)) {
      return this.product.price + (index * 20000);
    }
    
    // Specific pricing for accessories
    if (this.product.name.includes('Keyboard') && this.selectedSpec !== 'Standard') {
      return this.product.price + (index * 3000);
    }
    
    return this.product.price;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isLoading = true;
        this.productService.getProductById(id).subscribe({
          next: (p) => {
            this.product = p;
            if (p.colors && p.colors.length > 0) this.selectedColor = p.colors[0];
            if (p.specs && p.specs.length > 0) this.selectedSpec = p.specs[0];
            this.activeImageIndex = 0;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err.message;
            this.isLoading = false;
          }
        });
      }
    });
  }

  setActiveImage(index: number) {
    this.activeImageIndex = index;
  }

  addToCart() {
    if (!this.authService.isAuthenticated) {
      alert('Please login to add items to your cart! 🔒');
      this.router.navigate(['/auth']);
      return;
    }
    
    this.isAddingToCart = true;
    setTimeout(() => {
      this.isAddingToCart = false;
      if (this.product) {
        // Create a copy of the product with the updated price for the cart
        const productWithAdjustedPrice = { ...this.product, price: this.currentPrice };
        this.cartService.addToCart(productWithAdjustedPrice, 1, this.selectedColor, this.selectedSpec);
        this.toastService.show(`${this.product.name} added to bag! 🛍️`);
      }
    }, 600);
  }

  addToWishlist() {
    if (!this.authService.isAuthenticated) {
      alert('Please login to add items to your wishlist! 🔒');
      this.router.navigate(['/auth']);
      return;
    }
    
    if (this.product) {
      this.wishlistService.toggleWishlist(this.product);
    }
  }
}
