import { Component, DestroyRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order-service';
import { NewOrderModel } from '../../models/new-order.model';
import { CartService } from '../../services/cart-service';
import { UserService } from '../../services/user-service';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RouterModule],
  templateUrl: './cart-component.html',
  styleUrls: ['./cart-component.scss']
})
export class CartComponent {
private router = inject(Router);
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  private previousItemKeys = new Set<string>();
  private animatedItemKeys = new Set<string>();

  constructor() {
    effect(() => {
      const drafts = this.cartService.draftOrders();
      const currentKeys = new Set<string>();

      drafts.forEach(draft => {
        draft.items.forEach(item => {
          currentKeys.add(this.itemKey(draft.id, item.id));
        });
      });

      currentKeys.forEach(key => {
        if (!this.previousItemKeys.has(key)) {
          this.animatedItemKeys.add(key);
          const timeoutId = setTimeout(() => {
            this.animatedItemKeys.delete(key);
          }, 800);
          this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
        }
      });

      this.previousItemKeys = currentKeys;
    });
  }

  isAnimated(draftId: string, itemId: number): boolean {
    return this.animatedItemKeys.has(this.itemKey(draftId, itemId));
  }

  private itemKey(draftId: string, itemId: number): string {
    return `${draftId}-${itemId}`;
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  trackItemById(index: number, item: any): number {
    return item.id;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-dress.png'; 
  }

processOrders(): void {
  if (this.userService.isAdmin()) {
    this.router.navigate(['/admin']);
    return;
  }

  this.cartService.closeCart();
  this.router.navigate(['/checkout']);
}

  removeItem(draftId: string, dressId: number): void {
    this.cartService.removeItem(draftId, dressId);
  }
}