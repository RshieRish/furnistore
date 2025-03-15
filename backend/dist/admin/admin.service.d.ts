import { Model } from 'mongoose';
import { Furniture } from '../furniture/schemas/furniture.schema';
import { Estimate } from '../estimates/schemas/estimate.schema';
import { Order } from '../orders/schemas/order.schema';
export declare class AdminService {
    private furnitureModel;
    private estimateModel;
    private orderModel;
    constructor(furnitureModel: Model<Furniture>, estimateModel: Model<Estimate>, orderModel: Model<Order>);
    getAllFurniture(): unknown;
    getPublicFurniture(category?: string): unknown;
    createFurniture(furnitureData: {
        name: string;
        price: number;
        category: string;
        description?: string;
        imageUrl?: string;
        imageUrls?: string[];
    }): unknown;
    updateFurniture(id: string, updateData: {
        name?: string;
        price?: number;
        category?: string;
        status?: string;
        description?: string;
        imageUrl?: string;
        imageUrls?: string[];
    }): unknown;
    deleteFurniture(id: string): unknown;
    getAllEstimates(): unknown;
    getAllOrders(userId?: string): unknown;
    updateEstimate(id: string, updateData: {
        status: string;
    }): unknown;
    updateOrder(id: string, updateData: {
        status: string;
    }): unknown;
}
