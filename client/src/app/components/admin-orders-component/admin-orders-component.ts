import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { OrderService } from '../../services/order-service';
import { UserService } from '../../services/user-service';
import { AlertService } from '../../services/alert-service';
import { OrderModel } from '../../models/order.model';
import { DressService } from '../../services/dress-service';
import { DressModel } from '../../models/dress.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, CardModule],
  templateUrl: './admin-orders-component.html',
  styleUrls: ['./admin-orders-component.scss']
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private dressService = inject(DressService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private alertService = inject(AlertService);

  orders: OrderModel[] = [];
  loading: boolean = true;
  dressCache: { [id: number]: DressModel } = {};
  loadingDressIds: Set<number> = new Set<number>();
  expandedOrderIds: Set<number> = new Set<number>();
  filterDate: string = '';
  filterUserId: number | null = null;
  isFiltered: boolean = false;
  // status options and local selection state
  statuses: { id: number; name: string }[] = [
    { id: 1, name: 'נקלטה' },
    { id: 2, name: 'נארזה' },
    { id: 3, name: 'הושלמה' },
    { id: 4, name: 'בוטלה' }
  ];
  // holds the currently selected status per order (orderId -> statusId)
  selectedStatus: { [orderId: number]: number } = {};
  // track which orders are currently updating (to disable UI while request in flight)
  updatingOrderIds: Set<number> = new Set<number>();

  ngOnInit(): void {
    const user = this.userService.currentUser();
    if (!user) {
      this.alertService.show('יש להתחבר למערכת לפני ההמשך', 'error');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.userService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('שגיאה בטעינת הזמנות:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  toggleDetails(order: OrderModel): void {
    if (this.expandedOrderIds.has(order.id)) {
      this.expandedOrderIds.delete(order.id);
      return;
    }
    this.expandedOrderIds.add(order.id);
    this.selectedStatus[order.id] = order.statusId;
    this.loadDressDetailsForOrder(order);
  }

  isExpanded(order: OrderModel): boolean {
    return this.expandedOrderIds.has(order.id);
  }

  updateStatus(order: OrderModel): void {
    const newStatus = this.selectedStatus[order.id];
    if (!newStatus || newStatus === order.statusId) return;
    this.updatingOrderIds.add(order.id);
    this.orderService.updateOrderStatus(order, newStatus).subscribe({
      next: () => {
        // update local model for immediate UI feedback
        order.statusId = newStatus;
        order.statusName = this.getStatusName(newStatus);
        this.updatingOrderIds.delete(order.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update order status', err);
        this.updatingOrderIds.delete(order.id);
        this.cdr.detectChanges();
      }
    });
  }

  getStatusName(id: number): string {
    const s = this.statuses.find(st => st.id === id);
    return s ? s.name : '';
  }

  getAvailableStatuses(currentStatusId: number): { id: number; name: string }[] {
    // אם ההזמנה בוטלה או הוחזרה, לא ניתן לשנות
    if (currentStatusId === 3 || currentStatusId === 4) {
      return this.statuses.filter(s => s.id === currentStatusId);
    }
    
    // אפשר רק להתקדם לשלב הבא או לבטל
    return this.statuses.filter(s => 
      s.id === currentStatusId || // הסטטוס הנוכחי
      s.id === currentStatusId + 1 || // השלב הבא
      s.id === 4 // ביטול תמיד אפשרי
    );
  }

  filterByDate(): void {
    if (!this.filterDate) return;
    this.loading = true;
    this.orderService.getUnpackedOrdersUntilDate(this.filterDate).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isFiltered = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('שגיאה בסינון הזמנות:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearFilter(): void {
    this.filterDate = '';
    this.filterUserId = null;
    this.isFiltered = false;
    this.loadOrders();
  }

  filterByUserId(): void {
    if (!this.filterUserId) return;
    this.loading = true;
    this.orderService.getOrdersByUserId(this.filterUserId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isFiltered = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('שגיאה בסינון הזמנות:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadDressDetailsForOrder(order: OrderModel): void {
    if (!order.orderItems || order.orderItems.length === 0) return;

    order.orderItems.forEach(item => {
      const id = item.dressId;
      if (!id) return;
      if (this.dressCache[id] || this.loadingDressIds.has(id)) return;

      this.loadingDressIds.add(id);
      this.dressService.getDressById(id).subscribe({
        next: (dress) => {
          this.dressCache[id] = dress;
          this.loadingDressIds.delete(id);
          // trigger change detection in case this was called outside angular zone
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (err) => {
          console.error('Failed to load dress', id, err);
          this.loadingDressIds.delete(id);
          setTimeout(() => this.cdr.detectChanges(), 0);
        }
      });
    });
  }
}