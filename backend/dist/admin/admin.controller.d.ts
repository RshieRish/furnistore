import { AdminService } from './admin.service';
interface UpdateFurnitureDto {
    name?: string;
    price?: number;
    category?: string;
    status?: string;
    description?: string;
    imageUrl?: string;
}
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getFurniture(): Promise<(import("mongoose").Document<unknown, {}, import("../furniture/schemas/furniture.schema").Furniture> & import("../furniture/schemas/furniture.schema").Furniture & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createFurniture(furnitureData: {
        name: string;
        price: number;
        category: string;
        description?: string;
    }, file?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("../furniture/schemas/furniture.schema").Furniture> & import("../furniture/schemas/furniture.schema").Furniture & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateFurniture(id: string, updateData: UpdateFurnitureDto, file?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("../furniture/schemas/furniture.schema").Furniture> & import("../furniture/schemas/furniture.schema").Furniture & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteFurniture(id: string): Promise<{
        message: string;
    }>;
    getEstimates(): Promise<(import("mongoose").Document<unknown, {}, import("../estimates/schemas/estimate.schema").Estimate> & import("../estimates/schemas/estimate.schema").Estimate & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getOrders(userId?: string): Promise<(import("mongoose").Document<unknown, {}, import("../orders/schemas/order.schema").Order> & import("../orders/schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    updateEstimate(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, import("../estimates/schemas/estimate.schema").Estimate> & import("../estimates/schemas/estimate.schema").Estimate & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateOrder(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, import("../orders/schemas/order.schema").Order> & import("../orders/schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
export {};
