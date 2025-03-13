import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto, response: Response): Promise<{
        access_token: string;
        user: {
            email: string;
            name: string;
            role: string;
            isAdmin: boolean;
            _id: any;
        };
    }>;
    login(loginDto: LoginDto, response: Response): Promise<{
        access_token: string;
        user: {
            email: string;
            name: string;
            role: string;
            isAdmin: boolean;
            _id: any;
        };
    }>;
    getProfile(req: any): any;
}
