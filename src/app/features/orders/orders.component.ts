import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Observable } from 'rxjs';
import { Order } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent {
  private orderService = inject(OrderService);
  orders$: Observable<Order[]> = this.orderService.getUserOrders();
}
