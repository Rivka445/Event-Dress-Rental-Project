import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface StatusOption {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:44362/api/Statuses';

  getStatuses(): Observable<StatusOption[]> {
    return this.http.get<StatusOption[]>(this.apiUrl);
  }
}
