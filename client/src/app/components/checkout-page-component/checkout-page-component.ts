import { Component, inject } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { CartService } from '../../services/cart-service';
import { NewOrderModel } from '../../models/new-order.model';
import { FormsModule } from '@angular/forms';  
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AlertService } from '../../services/alert-service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe],
  templateUrl: './checkout-page-component.html',
  styleUrls: ['./checkout-page-component.scss']
})
export  class CheckoutPageComponent {
  public cartService = inject(CartService);
  public orderService = inject(OrderService);
  public userService = inject(UserService);
  public alertService = inject(AlertService);
  private route = inject(ActivatedRoute); 
  public router = inject(Router);
  public alertMessage: string | null = null;
  public isError: boolean = false;

  cardName: string = '';
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  formTouched: boolean = false;

  trackById(index: number, draft: any): string {
    return draft.id;
  }

  trackItemById(index: number, item: any): number {
    return item.id;
  }

  removeDraft(draftId: string) {
    this.cartService.draftOrders.update(orders =>
      orders.filter(d => d.id !== draftId)
    );
  }

  removeItem(draftId: string, dressId: number) {
    this.cartService.draftOrders.update(orders =>
      orders
        .map(d => d.id === draftId
          ? { ...d, items: d.items.filter(i => i.id !== dressId) }
          : d
        )
        .filter(d => d.items.length > 0)
    );
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-dress.png';
  }
  
  totalPrice(): number {
    return this.cartService.draftOrders().reduce(
      (sum, draft) => sum + this.cartService.getDraftTotalPrice(draft.id),
      0
    );
  }

  totalItems(): number {
    return this.cartService.draftOrders().reduce((sum, draft) => sum + draft.items.length, 0);
  }

 showAlert(msg: string, isError: boolean = false) {
    this.alertMessage = msg;
    this.isError = isError;
      setTimeout(() => {
      this.alertMessage = null;
    }, 2100); 
    // this.alertMessage = "";
  }

  isCardNameValid(): boolean {
    return this.cardName.trim().length >= 2;
  }

  isCardNumberValid(): boolean {
    const digits = this.cardNumber.replace(/\s+/g, '');
    return /^\d{13,19}$/.test(digits);
  }

  isExpiryValid(): boolean {
    const match = this.cardExpiry.trim().match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = Number(match[1]);
    const year = Number(match[2]);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = Number(String(now.getFullYear()).slice(2));
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  }

  isCvvValid(): boolean {
    return /^\d{3,4}$/.test(this.cardCvv.trim());
  }

  isPaymentFormValid(): boolean {
    return this.isCardNameValid()
      && this.isCardNumberValid()
      && this.isExpiryValid()
      && this.isCvvValid();
  }


  pay(): void {
    this.formTouched = true;

    if (!this.isPaymentFormValid()) {
      this.showAlert('אנא מלאי את כל פרטי האשראי לפני התשלום', true);
      return;
    }

    if (this.userService.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }

    if (!this.userService.isLoggedIn()) {
      this.alertService.show('יש להתחבר למערכת לפני ההמשך', 'error');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const selectedDrafts = this.cartService.draftOrders().filter(d => d.selected);

    if (selectedDrafts.length === 0) {
      this.showAlert('אנא בחרי לפחות הזמנה אחת להמשך', true);
      return;
    }

    let completedOrders = 0;
    let hasError = false;

    selectedDrafts.forEach(draft => {
      const newOrder: NewOrderModel = {
        orderDate: new Date().toISOString().split('T')[0],
        eventDate: new Date(draft.eventDate).toISOString().split('T')[0],
        finalPrice: draft.items.reduce((sum, i) => sum + i.price, 0),
        userId: (() => {
          const data = localStorage.getItem('user_data');
          if (data) {
            const user = JSON.parse(data);
            return Number(user.id);
          }
          return 0;
        })(),
        note: draft.note || '',
        orderItems: draft.items.map(i => ({ dressId: i.id, dressPrice: i.price }))
      };

      this.orderService.addOrder(newOrder).subscribe({
        next: (savedOrder) => {
          console.log(`הזמנה מספר ${savedOrder.id} נשלחה בהצלחה!`);
          completedOrders++;
          
          if (completedOrders === selectedDrafts.length && !hasError) {
            this.cartService.removeSelectedDrafts();
            this.cartService.isCartOpen.set(false);
            this.showAlert('ההזמנות שנבחרו נשלחו בהצלחה!');
          }
        },
        error: (err) => {
          console.error('שגיאה בשליחת ההזמנה:', err);
          hasError = true;
          completedOrders++;
          
          if (completedOrders === selectedDrafts.length) {
            this.showAlert('ארעה שגיאה בשליחת אחת או יותר מההזמנות', true);
          }
        }
      });
    });
  }
}