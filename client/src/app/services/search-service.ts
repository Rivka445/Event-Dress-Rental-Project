import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  search(query: string) {
    return this.http.post<{ results: any[] }>('/api/Search', { query });
  }
}
