import { NewOrderItemModel } from './new-order-item.model';

export class NewOrderModel {
    orderDate!: string;      
    eventDate!: string;
    finalPrice!: number;
    userId!: number;
    note?: string;        
    orderItems!: NewOrderItemModel[]; 
}