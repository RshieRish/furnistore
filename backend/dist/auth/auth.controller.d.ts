import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        user: {
            email: string;
            name: string;
            role: string;
            isAdmin: boolean;
            _id: any;
        };
    }>;
    login(req: any): Promise<{
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
