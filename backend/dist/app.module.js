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
exports.AppModule = exports.DebugController = exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const estimates_module_1 = require("./estimates/estimates.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const admin_module_1 = require("./admin/admin.module");
const shared_module_1 = require("./shared/shared.module");
let AppController = class AppController {
    getHealth() {
        return {
            status: 'ok',
            message: 'API is running',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
let DebugController = class DebugController {
    constructor(configService) {
        this.configService = configService;
    }
    getEnv() {
        return {
            MONGODB_URI: this.configService.get('MONGODB_URI'),
            STRIPE_SECRET_KEY: this.configService.get('STRIPE_SECRET_KEY') ? 'Set (hidden)' : 'Not set',
            STRIPE_PUBLISHABLE_KEY: this.configService.get('STRIPE_PUBLISHABLE_KEY') ? 'Set (hidden)' : 'Not set',
            STRIPE_WEBHOOK_SECRET: this.configService.get('STRIPE_WEBHOOK_SECRET') ? 'Set (hidden)' : 'Not set',
            JWT_SECRET: this.configService.get('JWT_SECRET') ? 'Set (hidden)' : 'Not set',
            PORT: this.configService.get('PORT'),
            FRONTEND_URL: this.configService.get('FRONTEND_URL'),
        };
    }
};
exports.DebugController = DebugController;
__decorate([
    (0, common_1.Get)('env'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DebugController.prototype, "getEnv", null);
exports.DebugController = DebugController = __decorate([
    (0, common_1.Controller)('debug'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DebugController);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const uri = configService.get('MONGODB_URI') ||
                        'mongodb://mongo:jEuVNzUuvAeAQDiOVljSUQmrTblsrHnd@mongodb.railway.internal:27017';
                    console.log('MongoDB URI:', uri);
                    return {
                        uri,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            estimates_module_1.EstimatesModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
        ],
        controllers: [AppController, DebugController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map