import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Furniture extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: 'available' })
  status: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;
}

export const FurnitureSchema = SchemaFactory.createForClass(Furniture); 