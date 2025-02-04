import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ type: [{ type: Object }], required: true })
  items: Array<{
    furnitureId: string;
    quantity: number;
    price: number;
  }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 