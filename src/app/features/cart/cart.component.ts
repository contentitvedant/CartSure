import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  cartService = inject(CartService);
  
  cartItems$ = this.cartService.cartItems$;
  cartTotal$ = this.cartService.cartTotal$;

  updateQuantity(cartItemId: string, newQuantity: number) {
    this.cartService.updateQuantity(cartItemId, newQuantity);
  }

  remove(cartItemId: string) {
    this.cartService.removeFromCart(cartItemId);
  }
}
