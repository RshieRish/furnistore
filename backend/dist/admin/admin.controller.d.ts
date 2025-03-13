import { AdminService } from './admin.service';
import { S3Service } from '../shared/s3.service';
interface UpdateFurnitureDto {
    name?: string;
    price?: number;
    category?: string;
    status?: string;
    description?: string;
    imageUrl?: string;
    imageUrls?: string[];
}
export declare class AdminController {
    private readonly adminService;
    private readonly s3Service;
    constructor(adminService: AdminService, s3Service: S3Service);
    getFurniture(): Promise<(import("mongoose").Document<unknown, {}, import("../furniture/schemas/furniture.schema").Furniture> & import("../furniture/schemas/furniture.schema").Furniture & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getPublicFurniture(category?: string): Promise<(import("mongoose").Document<unknown, {}, import("../furniture/schemas/furniture.schema").Furniture> & import("../furniture/schemas/furniture.schema").Furniture & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createFurniture(furnitureData: {
        name: string;
        price: number;
        category: string;
        description?: string;
    }, files?: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, import("../furniture/schemas/furniture.schema").Furniture> & import("../furniture/schemas/furniture.schema").Furniture & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateFurniture(id: string, updateData: UpdateFurnitureDto, files?: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, import("../furniture/schemas/furniture.schema").Furniture> & import("../furniture/schemas/furniture.schema").Furniture & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteFurniture(id: string): Promise<{
        message: string;
    }>;
    getEstimates(): Promise<Omit<import("mongoose").Document<unknown, {}, import("../estimates/schemas/estimate.schema").Estimate> & import("../estimates/schemas/estimate.schema").Estimate & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    getOrders(userId?: string): Promise<(import("mongoose").Document<unknown, {}, import("../orders/schemas/order.schema").Order> & import("../orders/schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    updateEstimate(id: string, updateData: {
        status: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../estimates/schemas/estimate.schema").Estimate> & import("../estimates/schemas/estimate.schema").Estimate & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateOrder(id: string, updateData: {
        status: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../orders/schemas/order.schema").Order> & import("../orders/schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
export {};
