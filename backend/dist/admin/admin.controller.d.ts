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
    getFurniture(): unknown;
    getPublicFurniture(category?: string): unknown;
    createFurniture(furnitureData: {
        name: string;
        price: number;
        category: string;
        description?: string;
    }, files?: Express.Multer.File[]): unknown;
    updateFurniture(id: string, updateData: UpdateFurnitureDto, files?: Express.Multer.File[]): unknown;
    deleteFurniture(id: string): unknown;
    getEstimates(): unknown;
    getOrders(userId?: string): unknown;
    updateEstimate(id: string, updateData: {
        status: string;
    }): unknown;
    updateOrder(id: string, updateData: {
        status: string;
    }): unknown;
}
export {};
