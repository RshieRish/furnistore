import { Document } from 'mongoose';
export declare class Estimate extends Document {
    userId: string;
    imageUrl: string;
    requirements: string;
    price: number;
    explanation: string;
    status: string;
}
export declare const EstimateSchema: import("mongoose").Schema<Estimate, import("mongoose").Model<Estimate, any, any, any, Document<unknown, any, Estimate> & Estimate & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Estimate, Document<unknown, {}, import("mongoose").FlatRecord<Estimate>> & import("mongoose").FlatRecord<Estimate> & {
    _id: import("mongoose").Types.ObjectId;
}>;
