import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  items: {
    productId: string;
    quantity: number;
  }[];

  @IsString()
  shippingAddress: string;

  @IsNumber()
  totalAmount: number;
} 