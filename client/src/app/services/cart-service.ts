import { Injectable, signal, effect, inject , computed} from '@angular/core';
import { DressModel } from '../models/dress.model';
import { DraftOrder } from '../models/draft-order.model';
@Injectable({ 
    providedIn: 'root'
})
export class CartService {
    private readonly STORAGE_KEY = 'my_dress_cart';
  private getInitialDraftOrders(): DraftOrder[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    const parsed: DraftOrder[] = JSON.parse(stored);

    return parsed.map(d => ({
        ...d,
        eventDate: new Date(d.eventDate)
    }));
    }
        
    draftOrders = signal<DraftOrder[]>(this.getInitialDraftOrders());
    lastSelectedDate = signal<Date | null>(null); 

    private saveToStorageEffect = effect(() => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.draftOrders()));
    });
    cartItemsCount = computed(() =>
    this.draftOrders().reduce(
        (total, draft) => total + draft.items.length,
        0
    )
    );
    openCart() { this.isCartOpen.set(true); }
    closeCart() { this.isCartOpen.set(false); }

    createDraftOrder(date: Date): DraftOrder {
    const draft: DraftOrder = {
        id: crypto.randomUUID(),
        eventDate: date,
        items: []
    };
    this.draftOrders.update(orders => [...orders, draft]);
    this.lastSelectedDate.set(date);
    this.openCart();
    return draft;
    }

    addItemToDraft(draftId: string, dress: DressModel) {
    // Prevent adding items if user is admin
    const userData = localStorage.getItem('user_data');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'Admin') {
            console.error('מנהל לא יכול להוסיף פריטים לעגלה');
            return;
        }
    }
    
    this.draftOrders.update(orders =>
        orders.map(o =>
        o.id === draftId ? { ...o, items: [...o.items, dress] } : o
        )
    );
    this.openCart();
    }
    removeItem(draftId: string, dressId: number) {
    this.draftOrders.update(orders =>
        orders
        .map(o =>
            o.id === draftId
            ? { ...o, items: o.items.filter(i => i.id !== dressId) }
            : o
        )
        .filter(o => o.items.length > 0)
    );
    }
    // CartService
    removeSelectedDrafts(): void {
    this.draftOrders.update(orders => orders.filter(draft => !draft.selected));
    }
    clearAllDrafts() {
        this.draftOrders.set([]);
    }
    isCartOpen = signal<boolean>(false);

    getDraftTotalPrice(draftId: string): number {
         const draft = this.draftOrders().find(d => d.id === draftId);
        return draft ? draft.items.reduce((sum, i) => sum + i.price, 0) : 0;
    }

    getAllDraftsTotalPrice(): number {
        return this.draftOrders().reduce((sum, draft) => sum + draft.items.reduce((s, i) => s + i.price, 0), 0);
    }
}