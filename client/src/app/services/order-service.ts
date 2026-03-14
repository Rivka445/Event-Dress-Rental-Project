import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { NewOrderModel } from '../models/new-order.model';
import { Observable } from 'rxjs';
import { OrderModel } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:44362/api/Orders'; 
  addOrder(newOrder: NewOrderModel): Observable<OrderModel> {
    return this.http.post<OrderModel>(this.apiUrl, newOrder);
  }
  
  getOrdersByUserId(userId: number): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(`${this.apiUrl}/user/${userId}`);
  }
  getAllOrders(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(this.apiUrl);
  }

  updateOrderStatus(order: OrderModel, statusId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${order.id}/status/${statusId}`, null);
  }

  getUnpackedOrdersUntilDate(date: string): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(`${this.apiUrl}/unpacked?date=${date}`);
  }
}