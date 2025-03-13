import { ConfigService } from '@nestjs/config';
export declare class AppController {
    getHealth(): {
        status: string;
        message: string;
        timestamp: string;
    };
}
export declare class DebugController {
    private configService;
    constructor(configService: ConfigService);
    getEnv(): {
        MONGODB_URI: any;
        STRIPE_SECRET_KEY: string;
        STRIPE_PUBLISHABLE_KEY: string;
        STRIPE_WEBHOOK_SECRET: string;
        JWT_SECRET: string;
        PORT: any;
        FRONTEND_URL: any;
    };
}
export declare class AppModule {
}
