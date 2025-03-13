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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        console.log('Validating user:', email);
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            console.log('User not found:', email);
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return null;
        }
        console.log('User validated successfully:', email);
        const { password: _, ...result } = user.toObject();
        return result;
    }
    async login(user) {
        try {
            const freshUser = await this.usersService.findById(user._id);
            if (!freshUser) {
                console.error('User not found during login:', user._id);
                throw new common_1.UnauthorizedException('User not found');
            }
            const payload = {
                email: freshUser.email,
                sub: freshUser._id,
                role: freshUser.role,
                isAdmin: freshUser.isAdmin
            };
            console.log('Creating login payload:', payload);
            const token = this.jwtService.sign(payload);
            console.log('JWT token generated successfully');
            return {
                access_token: token,
                user: {
                    email: freshUser.email,
                    name: freshUser.name,
                    role: freshUser.role,
                    isAdmin: freshUser.isAdmin,
                    _id: freshUser._id,
                },
            };
        }
        catch (error) {
            console.error('Login error in service:', error);
            throw error;
        }
    }
    async register(createUserDto) {
        if (createUserDto.role === 'admin') {
            createUserDto.isAdmin = true;
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.login(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map