import { Module } from '@nestjs/common';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';
import { EstimatesGateway } from './estimates.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Estimate, EstimateSchema } from './schemas/estimate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Estimate.name, schema: EstimateSchema }]),
  ],
  controllers: [EstimatesController],
  providers: [EstimatesService, EstimatesGateway],
})
export class EstimatesModule {} 