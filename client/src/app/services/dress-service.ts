import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { DressModel } from '../models/dress.model';
import { NewDressModel } from '../models/new-dress.model';

@Injectable({
  providedIn: 'root',
})
export class DressService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:44362/api/dresses';

  GetSizesByModelId(modelId: number): Observable<string[]> {
   return this.http.get<string[]>(`${this.apiUrl}/sizes?modelId=${modelId}`);
  }

 GetCountByModelIdAndSizeForDate(
  modelId: number,
  size: string,
  date: string
): Observable<number> {

  const dateOnly = date.split('T')[0];
  const selected = new Date(dateOnly);
  selected.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) {
    return throwError(() => new Error('INVALID_DATE'));
  }

  return this.http.get<number>(
    `${this.apiUrl}/count?modelId=${modelId}&size=${size}&date=${dateOnly}`
  );
}
   getDressByModelIdAndSize(modelId: number, size: string): Observable<DressModel> {
    const params = new HttpParams()
      .set('modelId', modelId.toString())
      .set('size', size);

    return this.http.get<DressModel>(`${this.apiUrl}/id`, { params });
  }

  getDressById(id: number): Observable<DressModel> {
    return this.http.get<DressModel>(`${this.apiUrl}/${id}`);
  }
  getDressesByModelId(modelId: number): Observable<DressModel[]> {
    return this.http.get<DressModel[]>(`${this.apiUrl}/model/${modelId}`);
  }
  addDress(dress: NewDressModel): Observable<DressModel> {
    return this.http.post<DressModel>(this.apiUrl, dress);
  }

  updateDress(id: number, dress: NewDressModel): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dress);
  }

  deleteDress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}