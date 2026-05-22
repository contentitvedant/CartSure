import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  
  featuredProducts$!: Observable<Product[]>;
  categories$!: Observable<string[]>;

  ngOnInit() {
    this.featuredProducts$ = this.productService.getFeaturedProducts();
    this.categories$ = this.productService.getCategories();
  }
}
