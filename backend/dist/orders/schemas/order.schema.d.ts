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
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order> & Order & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>> & import("mongoose").FlatRecord<Order> & {
    _id: import("mongoose").Types.ObjectId;
}>;
