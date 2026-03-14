import { DressModel } from "./dress.model";

export class CartItem extends DressModel {
  selectedEventDate!: Date; // התאריך הספציפי שנבחר לשמלה זו
}