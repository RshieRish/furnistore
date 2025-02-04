import { Document } from 'mongoose';
export declare class Furniture extends Document {
    name: string;
    price: number;
    category: string;
    status: string;
    description?: string;
    imageUrl?: string;
}
export declare const FurnitureSchema: import("mongoose").Schema<Furniture, import("mongoose").Model<Furniture, any, any, any, Document<unknown, any, Furniture> & Furniture & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Furniture, Document<unknown, {}, import("mongoose").FlatRecord<Furniture>> & import("mongoose").FlatRecord<Furniture> & {
    _id: import("mongoose").Types.ObjectId;
}>;
