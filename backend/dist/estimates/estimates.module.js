"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimatesModule = void 0;
const common_1 = require("@nestjs/common");
const estimates_controller_1 = require("./estimates.controller");
const estimates_service_1 = require("./estimates.service");
const estimates_gateway_1 = require("./estimates.gateway");
const mongoose_1 = require("@nestjs/mongoose");
const estimate_schema_1 = require("./schemas/estimate.schema");
let EstimatesModule = class EstimatesModule {
};
exports.EstimatesModule = EstimatesModule;
exports.EstimatesModule = EstimatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: estimate_schema_1.Estimate.name, schema: estimate_schema_1.EstimateSchema }]),
        ],
        controllers: [estimates_controller_1.EstimatesController],
        providers: [estimates_service_1.EstimatesService, estimates_gateway_1.EstimatesGateway],
    })
], EstimatesModule);
//# sourceMappingURL=estimates.module.js.map