import { Model } from 'mongoose';
import { Furniture } from '../furniture/schemas/furniture.schema';
import { Estimate } from '../estimates/schemas/estimate.schema';
import { Order } from '../orders/schemas/order.schema';
export declare class AdminService {
    private furnitureModel;
    private estimateModel;
    private orderModel;
    constructor(furnitureModel: Model<Furniture>, estimateModel: Model<Estimate>, orderModel: Model<Order>);
    getAllFurniture(): Promise<(import("mongoose").Document<unknown, {}, Furniture> & Furniture & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createFurniture(furnitureData: {
        name: string;
        price: number;
        category: string;
        description?: string;
        imageUrl?: string;
    }): Promise<import("mongoose").Document<unknown, {}, Furniture> & Furniture & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateFurniture(id: string, updateData: {
        name?: string;
        price?: number;
        category?: string;
        status?: string;
        description?: string;
        imageUrl?: string;
    }): Promise<import("mongoose").Document<unknown, {}, Furniture> & Furniture & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteFurniture(id: string): Promise<{
        message: string;
    }>;
    getAllEstimates(): Promise<(import("mongoose").Document<unknown, {}, Estimate> & Estimate & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getAllOrders(userId?: string): Promise<(import("mongoose").Document<unknown, {}, Order> & Order & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    updateEstimate(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, Estimate> & Estimate & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateOrder(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, Order> & Order & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
