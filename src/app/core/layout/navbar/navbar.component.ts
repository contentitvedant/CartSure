import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  
  cartBump = signal(false);
  
  cartCount$: Observable<number> = this.cartService.cartCount$;
  wishlistCount$: Observable<number> = this.wishlistService.wishlistCount$;
  currentUser$ = this.authService.currentUser$;
  hasOrders$: Observable<boolean> = this.orderService.getUserOrders().pipe(
    map(orders => orders.length > 0)
  );

  constructor() {
    // Trigger bump animation on cart count change
    this.cartCount$.subscribe(() => {
      this.cartBump.set(true);
      setTimeout(() => this.cartBump.set(false), 300);
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
