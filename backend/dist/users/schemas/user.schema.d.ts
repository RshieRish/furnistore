import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
    role: string;
    createdAt: Date;
}
export declare const UserSchema: any;
