import { Document } from 'mongoose';
export declare class Furniture extends Document {
    name: string;
    price: number;
    category: string;
    status: string;
    description?: string;
    imageUrl?: string;
    imageUrls?: string[];
}
export declare const FurnitureSchema: any;
