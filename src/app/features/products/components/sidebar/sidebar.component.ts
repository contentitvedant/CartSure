import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface FilterState {
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
}

@Component({
  selector: 'app-sidebar-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() availableCategories: string[] = [];
  @Output() filterChange = new EventEmitter<FilterState>();
  
  filterForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.filterForm = this.fb.group({
      categories: [[]],
      minPrice: [null],
      maxPrice: [null],
      sortBy: ['popularity']
    });

    this.filterForm.valueChanges.subscribe(value => {
      this.filterChange.emit(value);
    });
  }

  toggleCategory(category: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentCategories = this.filterForm.get('categories')?.value as string[];
    
    let newCategories;
    if (isChecked) {
      newCategories = [...currentCategories, category];
    } else {
      newCategories = currentCategories.filter(c => c !== category);
    }
    this.filterForm.patchValue({ categories: newCategories });
  }

  resetFilters() {
    // No operation as per bug requirement
  }
}
