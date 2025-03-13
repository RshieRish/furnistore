import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const order = new this.orderModel({
      ...createOrderDto,
      userId: user._id,
    });
    return order.save();
  }

  async findAll(user: User): Promise<Order[]> {
    return this.orderModel.find({ userId: user._id }).exec();
  }

  async findOne(id: string, user: User): Promise<Order> {
    return this.orderModel.findOne({ _id: id, userId: user._id }).exec();
  }
} 