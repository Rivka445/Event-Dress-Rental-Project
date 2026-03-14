import { CategoryModel } from './category.model'

export class ModelModel {
    id!: number;
    name!: string;
    description!: string;
    imgUrl!: string;
    basePrice!: number;
    color!: string;
    isActive!: boolean;
    categories!: CategoryModel[]; 
}
