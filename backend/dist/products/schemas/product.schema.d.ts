import { Document } from 'mongoose';
export type ProductDocument = Product & Document;
export declare class Product {
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stockQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProductSchema: any;
