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
exports.EstimationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const estimation_service_1 = require("./estimation.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
let EstimationController = class EstimationController {
    constructor(estimationService) {
        this.estimationService = estimationService;
    }
    async estimateBuild(file, user) {
        return await this.estimationService.estimateBuild(file, user);
    }
    async estimateRepair(file, user) {
        return await this.estimationService.estimateRepair(file, user);
    }
};
exports.EstimationController = EstimationController;
__decorate([
    (0, common_1.Post)('build'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_schema_1.User]),
    __metadata("design:returntype", Promise)
], EstimationController.prototype, "estimateBuild", null);
__decorate([
    (0, common_1.Post)('repair'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_schema_1.User]),
    __metadata("design:returntype", Promise)
], EstimationController.prototype, "estimateRepair", null);
exports.EstimationController = EstimationController = __decorate([
    (0, common_1.Controller)('estimate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [estimation_service_1.EstimationService])
], EstimationController);
//# sourceMappingURL=estimation.controller.js.map