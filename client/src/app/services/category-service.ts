import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ModelModel } from '../models/model.model';
import { map, Observable } from 'rxjs';
import { CategoryModel } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
    private http = inject(HttpClient);
  private apiUrl = 'https://localhost:44362/api/categories';

  getCategories(): Observable<CategoryModel[]> {
    return this.http.get<CategoryModel[]>(this.apiUrl);
  }
}