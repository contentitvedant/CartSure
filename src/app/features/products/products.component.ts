import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SidebarComponent, FilterState } from './components/sidebar/sidebar.component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, SidebarComponent, ReactiveFormsModule],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  
  categories$!: Observable<string[]>;
  searchControl = new FormControl('');
  
  private allProductsSubject = new BehaviorSubject<Product[]>([]);
  private filterStateSubject = new BehaviorSubject<FilterState>({
    categories: [], minPrice: null, maxPrice: null, sortBy: 'popularity'
  });

  filteredProducts$!: Observable<Product[]>;
  isLoading = true;

  ngOnInit() {
    this.categories$ = this.productService.getCategories();
    
    this.productService.getAllProducts().subscribe(products => {
      this.allProductsSubject.next(products);
      this.isLoading = false;
    });

    const search$ = this.searchControl.valueChanges.pipe(startWith(''));
    const filters$ = this.filterStateSubject.asObservable();
    const products$ = this.allProductsSubject.asObservable();

    this.filteredProducts$ = combineLatest([products$, filters$, search$]).pipe(
      map(([products, filters, searchTerm]) => {
        let result = [...products];

        // Search Filter
        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          result = result.filter(p => p.name.toLowerCase().includes(lowerSearch) || p.description.toLowerCase().includes(lowerSearch));
        }

        // Category Filter
        if (filters.categories && filters.categories.length > 0) {
          result = result.filter(p => filters.categories.includes(p.category));
        }

        // Price Filter
        if (filters.minPrice !== null && filters.minPrice !== undefined) {
          result = result.filter(p => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
          result = result.filter(p => p.price <= filters.maxPrice!);
        }

        // Sorting
        if (filters.sortBy === 'price_asc') {
          result.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'price_desc') {
          result.sort((a, b) => b.price - a.price);
        } else if (filters.sortBy === 'popularity') {
          result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        }

        return result;
      })
    );
  }

  onFilterChange(newState: FilterState) {
    this.filterStateSubject.next(newState);
  }
}
