import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinalModelModel } from '../models/final-model.model';
import { ModelModel } from '../models/model.model';
import { NewModelModel } from '../models/new-model.model';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:44362/api/models';

  getModels(description?: string, minPrice?: number, maxPrice?: number, 
            categoriesId?: number[], colors?: string[], position: number = 1, skip: number = 8): Observable<FinalModelModel> {
    let params = new HttpParams()
      .set('position', position.toString())
      .set('skip', skip.toString());

    if (description) params = params.set('description', description);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    if (categoriesId && categoriesId.length > 0) {
      categoriesId.forEach(id => {
        params = params.append('categoriesId', id.toString());
      });
    }
    if (colors && colors.length > 0) {
      colors.forEach(color => {
        params = params.append('colors', color);
      });
    }

    return this.http.get<FinalModelModel>(this.apiUrl, { params });  
  }

  getModelById(id: number): Observable<ModelModel> {
    return this.http.get<ModelModel>(`${this.apiUrl}/${id}`);
  }
 addModel(model: NewModelModel): Observable<ModelModel> {
    return this.http.post<ModelModel>(this.apiUrl, model);
  }

  updateModel(id: number, model: NewModelModel): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, model);
  }

  deleteModel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}