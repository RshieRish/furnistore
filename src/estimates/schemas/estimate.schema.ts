import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Estimate extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

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