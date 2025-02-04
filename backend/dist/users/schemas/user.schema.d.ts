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
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: Types.ObjectId;
}>>;
