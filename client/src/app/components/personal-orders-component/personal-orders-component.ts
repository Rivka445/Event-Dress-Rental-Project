import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { OrderService } from '../../services/order-service';
import { DressService } from '../../services/dress-service';
import { UserService } from '../../services/user-service';
import { Observable, filter, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-personal-orders-component',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule, DialogModule], 
  templateUrl: './personal-orders-component.html',
  styleUrl: './personal-orders-component.scss',
})
export class PersonalOrdersComponent implements OnInit, OnDestroy { 
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private dressService = inject(DressService);
  private userService = inject(UserService);
  private routerSubscription?: Subscription;

  orders = signal<any[]>([]);
  loading = signal<boolean>(true);
  selectedOrder = signal<any>(null);
  showDialog = signal<boolean>(false);
  userId?: number;

  ngOnInit() {
    this.loadOrders();
    
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url.includes('/personal-orders')) {
        this.loadOrders();
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  loadOrders() {
    const userIdRaw = this.route.snapshot.paramMap.get('id');
    const currentUser = this.userService.currentUser();
    const resolvedUserId = userIdRaw ? Number(userIdRaw) : currentUser?.id;

    if (!resolvedUserId) {
      this.orders.set([]);
      this.loading.set(false);
      return;
    }

    this.userId = resolvedUserId;
    this.loading.set(true);

    this.orderService.getOrdersByUserId(this.userId).pipe(
      map((data) => Array.isArray(data) ? data : []),
      catchError((err) => {
        console.error('שגיאה בטעינת הזמנות', err);
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe((data) => {
      this.orders.set(data);
    });
  }

  viewOrderDetails(order: any) {
    const initialItems = (order.orderItems || []).map((item: any) => ({
      ...item,
      modelImgUrl: item.modelImgUrl || null,
      imageLoading: true
    }));

    this.selectedOrder.set({ ...order, orderItems: initialItems });
    this.showDialog.set(true);

    if (!order.orderItems || order.orderItems.length === 0) {
      return;
    }

    const imageRequests: Observable<{ dressId: number; modelImgUrl: string | null }>[] = order.orderItems.map((item: any) =>
      this.dressService.getDressById(item.dressId).pipe(
        map(dress => ({ dressId: item.dressId as number, modelImgUrl: dress.modelImgUrl ?? null })),
        catchError(() => of({ dressId: item.dressId as number, modelImgUrl: null }))
      )
    );

    forkJoin(imageRequests).subscribe((results: Array<{ dressId: number; modelImgUrl: string | null }>) => {
      const updatedItems = initialItems.map((item: any) => {
        const match = results.find((res: { dressId: number; modelImgUrl: string | null }) => res.dressId === item.dressId);
        return {
          ...item,
          modelImgUrl: match?.modelImgUrl || null,
          imageLoading: false
        };
      });

      this.selectedOrder.set({ ...order, orderItems: updatedItems });
    });
  }

  onOrderImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/placeholder-dress.png';
  }

getSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
  switch (status) {
    case 'delivered': return 'success';
    case 'pending': return 'warn';   
    case 'cancelled': return 'danger';
    default: return 'info';
  }
}
}