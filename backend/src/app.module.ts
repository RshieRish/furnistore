import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { EstimatesModule } from './estimates/estimates.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';

// Root controller for healthcheck
@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    };
  }
}

// Debug controller to print out environment variables
@Controller('debug')
export class DebugController {
  constructor(private configService: ConfigService) {}

  @Get('env')
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
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Get the MongoDB URI from environment variables or use the fallback
        const uri = configService.get<string>('MONGODB_URI') || 
          'mongodb://mongo:jEuVNzUuvAeAQDiOVljSUQmrTblsrHnd@mongodb.railway.internal:27017';
        
        console.log('MongoDB URI:', uri); // Log the URI for debugging
        
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    EstimatesModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
  ],
  controllers: [AppController, DebugController], // Add both controllers
})
export class AppModule {} 