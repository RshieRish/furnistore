import { Document } from 'mongoose';
export declare class Order extends Document {
    userId: string;
    total: number;
    status: string;
    items: Array<{
        furnitureId: string;
        quantity: number;
        price: number;
    }>;
}
export declare const OrderSchema: any;
