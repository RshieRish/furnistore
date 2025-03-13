import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export declare class Estimate extends Document {
    userId: User;
    imageUrl: string;
    requirements: string;
    price: number;
    explanation: string;
    status: string;
}
export declare const EstimateSchema: MongooseSchema<Estimate, import("mongoose").Model<Estimate, any, any, any, Document<unknown, any, Estimate> & Estimate & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Estimate, Document<unknown, {}, import("mongoose").FlatRecord<Estimate>> & import("mongoose").FlatRecord<Estimate> & {
    _id: import("mongoose").Types.ObjectId;
}>;
