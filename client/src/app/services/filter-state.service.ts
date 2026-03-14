import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  searchTextSubject = new BehaviorSubject<string>('');
  searchText$ = this.searchTextSubject.asObservable();
  selectedCategoriesSubject = new BehaviorSubject<number[]>([]);
  selectedCategories$ = this.selectedCategoriesSubject.asObservable();
  selectedColorsSubject = new BehaviorSubject<string[]>([]);
  colors$ = this.selectedColorsSubject.asObservable();
  priceRangeSubject = new BehaviorSubject<{ min: number; max: number }>({ min: 0, max: 1000 });
  priceRange$ = this.priceRangeSubject.asObservable();

  setSearchText(searchText: string) {
    this.searchTextSubject.next(searchText);
  }
  
  setSelectedCategories(categories: number[]) {
    this.selectedCategoriesSubject.next(categories);
  }

  setSelectedColors(colors: string[]) {
    this.selectedColorsSubject.next(colors);
  }

  setPriceRange(range: { min: number; max: number }) {
    this.priceRangeSubject.next(range);
  }

  getSelectedCategories(): number[] {
    return this.selectedCategoriesSubject.value;
  }

  getSearchText(): string {
    return this.searchTextSubject.value;
  }
}