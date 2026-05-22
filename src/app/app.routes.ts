import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
  { path: 'products/:id', loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent) },
  { path: 'orders/:id', canActivate: [authGuard], loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
  { path: 'wishlist', loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent) },
  { path: 'auth', canActivate: [guestGuard], loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: '**', redirectTo: '' }
];
