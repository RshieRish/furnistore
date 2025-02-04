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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimationSchema = exports.Estimation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Estimation = class Estimation {
};
exports.Estimation = Estimation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Estimation.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Array)
], Estimation.prototype, "imageUrls", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['build', 'repair'] }),
    __metadata("design:type", String)
], Estimation.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Estimation.prototype, "estimatedCost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'pending', enum: ['pending', 'completed', 'failed'] }),
    __metadata("design:type", String)
], Estimation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Estimation.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Estimation.prototype, "updatedAt", void 0);
exports.Estimation = Estimation = __decorate([
    (0, mongoose_1.Schema)()
], Estimation);
exports.EstimationSchema = mongoose_1.SchemaFactory.createForClass(Estimation);
//# sourceMappingURL=estimation.schema.js.map