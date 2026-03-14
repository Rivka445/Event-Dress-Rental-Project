import { DressModel } from "./dress.model";

export class DraftOrder {
  id!: string;
  eventDate!: Date;
  items!: DressModel[];
  selected?: boolean;
  note?: string;
}