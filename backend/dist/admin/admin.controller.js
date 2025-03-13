"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const admin_service_1 = require("./admin.service");
const path_1 = require("path");
const multer_1 = require("multer");
const s3_service_1 = require("../shared/s3.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let AdminController = class AdminController {
    constructor(adminService, s3Service) {
        this.adminService = adminService;
        this.s3Service = s3Service;
    }
    async getFurniture() {
        return this.adminService.getAllFurniture();
    }
    async getPublicFurniture(category) {
        return this.adminService.getPublicFurniture(category);
    }
    async createFurniture(furnitureData, files) {
        try {
            console.log('Creating furniture with data:', { ...furnitureData, files: files?.map(f => f.originalname) });
            const price = typeof furnitureData.price === 'string'
                ? parseFloat(furnitureData.price)
                : furnitureData.price;
            let imageUrl;
            const imageUrls = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const timestamp = Date.now();
                    const randomString = Math.random().toString(36).substring(2, 15);
                    const key = `furniture/${timestamp}-${randomString}${(0, path_1.extname)(file.originalname)}`;
                    const s3Url = await this.s3Service.uploadFile(file, key);
                    imageUrls.push(s3Url);
                }
                imageUrl = imageUrls[0];
            }
            const result = await this.adminService.createFurniture({
                ...furnitureData,
                price,
                imageUrl,
                imageUrls
            });
            console.log('Furniture created successfully:', result);
            return result;
        }
        catch (error) {
            console.error('Error creating furniture:', error);
            throw error;
        }
    }
    async updateFurniture(id, updateData, files) {
        try {
            console.log('Updating furniture with ID:', id);
            console.log('Update data received:', updateData);
            console.log('Files received:', files?.map(f => f.originalname) || 'No files');
            const dataToUpdate = { ...updateData };
            if (typeof dataToUpdate.price === 'string') {
                dataToUpdate.price = parseFloat(dataToUpdate.price);
            }
            if (files && files.length > 0) {
                console.log('Processing files for upload to S3...');
                const imageUrls = [];
                for (const file of files) {
                    try {
                        const timestamp = Date.now();
                        const randomString = Math.random().toString(36).substring(2, 15);
                        const key = `furniture/${timestamp}-${randomString}${(0, path_1.extname)(file.originalname)}`;
                        console.log(`Uploading file ${file.originalname} to S3 with key ${key}...`);
                        const s3Url = await this.s3Service.uploadFile(file, key);
                        console.log('File uploaded successfully, S3 URL:', s3Url);
                        imageUrls.push(s3Url);
                    }
                    catch (uploadError) {
                        console.error('Error uploading file to S3:', uploadError);
                        throw new Error(`Failed to upload file ${file.originalname} to S3: ${uploadError.message}`);
                    }
                }
                dataToUpdate.imageUrl = imageUrls[0];
                dataToUpdate.imageUrls = imageUrls;
                console.log('Image URLs set:', { imageUrl: dataToUpdate.imageUrl, imageUrls: dataToUpdate.imageUrls });
            }
            console.log('Calling adminService.updateFurniture with data:', dataToUpdate);
            const result = await this.adminService.updateFurniture(id, dataToUpdate);
            console.log('Furniture updated successfully:', result);
            return result;
        }
        catch (error) {
            console.error('Error updating furniture:', error);
            throw error;
        }
    }
    async deleteFurniture(id) {
        return this.adminService.deleteFurniture(id);
    }
    async getEstimates() {
        return this.adminService.getAllEstimates();
    }
    async getOrders(userId) {
        return this.adminService.getAllOrders(userId);
    }
    async updateEstimate(id, updateData) {
        return this.adminService.updateEstimate(id, updateData);
    }
    async updateOrder(id, updateData) {
        return this.adminService.updateOrder(id, updateData);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('furniture'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFurniture", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/furniture'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPublicFurniture", null);
__decorate([
    (0, common_1.Post)('furniture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('image', 5, {
        storage: (0, multer_1.memoryStorage)(),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new common_1.BadRequestException('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createFurniture", null);
__decorate([
    (0, common_1.Patch)('furniture/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('image', 5, {
        storage: (0, multer_1.memoryStorage)(),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new common_1.BadRequestException('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateFurniture", null);
__decorate([
    (0, common_1.Delete)('furniture/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteFurniture", null);
__decorate([
    (0, common_1.Get)('estimates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEstimates", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Patch)('estimates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateEstimate", null);
__decorate([
    (0, common_1.Patch)('orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrder", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        s3_service_1.S3Service])
], AdminController);
//# sourceMappingURL=admin.controller.js.map