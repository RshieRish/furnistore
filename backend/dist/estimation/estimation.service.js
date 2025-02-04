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
exports.EstimationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const s3_service_1 = require("../shared/s3.service");
const estimation_schema_1 = require("./schemas/estimation.schema");
const axios_1 = require("axios");
let EstimationService = class EstimationService {
    constructor(estimationModel, configService, s3Service) {
        this.estimationModel = estimationModel;
        this.configService = configService;
        this.s3Service = s3Service;
    }
    async estimateBuild(file, user) {
        try {
            const key = `estimates/${Date.now()}-${file.originalname}`;
            const imageUrl = await this.s3Service.uploadFile(file, key);
            const response = await axios_1.default.post('http://localhost:3001/estimate-build', {
                image_url: imageUrl
            });
            if (!response.data.success) {
                throw new common_1.HttpException('Failed to get estimation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const estimation = await this.estimationModel.create({
                userId: user._id,
                imageUrls: [imageUrl],
                type: 'build',
                estimatedCost: this.extractCostFromAnalysis(response.data.estimation),
                status: 'pending',
            });
            return estimation;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to process estimation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async estimateRepair(file, user) {
        try {
            const key = `repairs/${Date.now()}-${file.originalname}`;
            const imageUrl = await this.s3Service.uploadFile(file, key);
            const response = await axios_1.default.post('http://localhost:3001/estimate-repair', {
                image_url: imageUrl
            });
            if (!response.data.success) {
                throw new common_1.HttpException('Failed to get estimation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const estimation = await this.estimationModel.create({
                userId: user._id,
                imageUrls: [imageUrl],
                type: 'repair',
                estimatedCost: this.extractCostFromAnalysis(response.data.estimation),
                status: 'pending',
            });
            return estimation;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to process estimation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    extractCostFromAnalysis(analysis) {
        const matches = analysis.match(/\$(\d+)/);
        return matches ? parseInt(matches[1]) : 0;
    }
};
exports.EstimationService = EstimationService;
exports.EstimationService = EstimationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(estimation_schema_1.Estimation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService,
        s3_service_1.S3Service])
], EstimationService);
//# sourceMappingURL=estimation.service.js.map