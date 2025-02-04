import { Document, Types } from 'mongoose';
export type EstimationDocument = Estimation & Document;
export declare class Estimation {
    userId: Types.ObjectId;
    imageUrls: string[];
    type: string;
    estimatedCost: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const EstimationSchema: import("mongoose").Schema<Estimation, import("mongoose").Model<Estimation, any, any, any, Document<unknown, any, Estimation> & Estimation & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Estimation, Document<unknown, {}, import("mongoose").FlatRecord<Estimation>> & import("mongoose").FlatRecord<Estimation> & {
    _id: Types.ObjectId;
}>;
