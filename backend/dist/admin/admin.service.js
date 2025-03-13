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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const furniture_schema_1 = require("../furniture/schemas/furniture.schema");
const estimate_schema_1 = require("../estimates/schemas/estimate.schema");
const order_schema_1 = require("../orders/schemas/order.schema");
let AdminService = class AdminService {
    constructor(furnitureModel, estimateModel, orderModel) {
        this.furnitureModel = furnitureModel;
        this.estimateModel = estimateModel;
        this.orderModel = orderModel;
    }
    async getAllFurniture() {
        return this.furnitureModel.find().exec();
    }
    async getPublicFurniture(category) {
        if (category) {
            return this.furnitureModel.find({
                category: { $regex: new RegExp(category, 'i') },
                status: 'available'
            }).exec();
        }
        return this.furnitureModel.find({ status: 'available' }).exec();
    }
    async createFurniture(furnitureData) {
        const newFurniture = new this.furnitureModel(furnitureData);
        return newFurniture.save();
    }
    async updateFurniture(id, updateData) {
        const furniture = await this.furnitureModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        if (!furniture) {
            throw new common_1.NotFoundException('Furniture not found');
        }
        return furniture;
    }
    async deleteFurniture(id) {
        const furniture = await this.furnitureModel.findByIdAndDelete(id).exec();
        if (!furniture) {
            throw new common_1.NotFoundException('Furniture not found');
        }
        return { message: 'Furniture deleted successfully' };
    }
    async getAllEstimates() {
        return this.estimateModel.find()
            .populate({
            path: 'userId',
            select: 'email name',
            model: 'User'
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getAllOrders(userId) {
        const query = userId ? { userId } : {};
        return this.orderModel.find(query).exec();
    }
    async updateEstimate(id, updateData) {
        return this.estimateModel.findByIdAndUpdate(id, { status: updateData.status }, { new: true }).exec();
    }
    async updateOrder(id, updateData) {
        return this.orderModel.findByIdAndUpdate(id, { status: updateData.status }, { new: true }).exec();
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(furniture_schema_1.Furniture.name)),
    __param(1, (0, mongoose_1.InjectModel)(estimate_schema_1.Estimate.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map