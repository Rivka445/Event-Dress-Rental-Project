import { OrderItemModel } from './order-item.model'; 

export class OrderModel {
    id!: number;
    orderDate!: Date;     
    eventDate!: Date;
    finalPrice!: number;
    userId!: number;
    note?: string;         
    statusId!: number;
    statusName!: string;
    userFirstName!: string;
    userLastName!: string;
    userEmail!: string;
    userPhone!: string;
    orderItems!: OrderItemModel[]; 
}