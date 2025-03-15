import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export declare class Estimate extends Document {
    userId: User;
    imageUrl: string;
    requirements: string;
    price: number;
    explanation: string;
    status: string;
}
export declare const EstimateSchema: any;
