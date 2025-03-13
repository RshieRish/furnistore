import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Furniture, FurnitureSchema } from '../furniture/schemas/furniture.schema';
import { Estimate, EstimateSchema } from '../estimates/schemas/estimate.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Furniture.name, schema: FurnitureSchema },
      { name: Estimate.name, schema: EstimateSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    SharedModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 