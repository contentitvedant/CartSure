import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Observable } from 'rxjs';
import { Product } from '../../core/services/product.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './wishlist.component.html'
})
export class WishlistComponent {
  private wishlistService = inject(WishlistService);
  
  wishlistItems$: Observable<Product[]> = this.wishlistService.wishlistItems$;
}
