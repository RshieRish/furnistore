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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
        this.ensureAdminExists();
    }
    async ensureAdminExists() {
        try {
            const adminEmail = 'admin@cornwallis.com';
            const existingAdmin = await this.findByEmail(adminEmail);
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash('Admin@123', 10);
                await this.create({
                    name: 'Admin User',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'admin',
                    isAdmin: true
                });
                console.log('Admin user created successfully');
            }
            else if (!existingAdmin.isAdmin || existingAdmin.role !== 'admin') {
                await this.userModel.findByIdAndUpdate(existingAdmin._id, {
                    role: 'admin',
                    isAdmin: true
                });
                console.log('Admin user updated successfully');
            }
        }
        catch (error) {
            console.error('Error ensuring admin exists:', error);
        }
    }
    async create(createUserDto) {
        const existingUser = await this.userModel.findOne({ email: createUserDto.email });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }
    async findAll() {
        return this.userModel.find().exec();
    }
    async findById(id) {
        return this.userModel.findById(id).exec();
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async update(id, updateUserDto) {
        return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    }
    async remove(id) {
        return this.userModel.findByIdAndDelete(id).exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], UsersService);
//# sourceMappingURL=users.service.js.map