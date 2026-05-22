import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../../core/services/order.service';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  
  order$!: Observable<Order | undefined>;

  ngOnInit() {
    this.order$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.orderService.getOrderById(id!);
      })
    );
  }

  printInvoice() {
    window.print();
  }
}
