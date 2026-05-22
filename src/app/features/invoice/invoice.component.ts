import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice.component.html'
})
export class InvoiceComponent {
  
  orderId = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  orderDate = new Date();
  
  customer = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    address: '1 Infinite Loop',
    city: 'Cupertino',
    zip: '95014'
  };

  items = [
    {
      name: 'MacBook Pro 16"',
      meta: 'Space Black - 36GB Unified Memory',
      quantity: 1,
      price: 2499
    },
    {
      name: 'AirPods Pro',
      meta: 'White - Standard',
      quantity: 2,
      price: 249
    }
  ];

  subtotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  tax = this.subtotal * 0.08; // 8% simulated tax
  total = this.subtotal + this.tax;

  printInvoice() {
    window.print();
  }
}
