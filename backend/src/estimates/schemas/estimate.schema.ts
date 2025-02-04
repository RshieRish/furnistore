import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Estimate extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  requirements: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  explanation: string;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'] })
  status: string;
}

export const EstimateSchema = SchemaFactory.createForClass(Estimate); 