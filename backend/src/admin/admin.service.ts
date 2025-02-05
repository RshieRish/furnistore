import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Furniture } from '../furniture/schemas/furniture.schema';
import { Estimate } from '../estimates/schemas/estimate.schema';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Furniture.name) private furnitureModel: Model<Furniture>,
    @InjectModel(Estimate.name) private estimateModel: Model<Estimate>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async getAllFurniture() {
    return this.furnitureModel.find().exec();
  }

  async createFurniture(furnitureData: {
    name: string;
    price: number;
    category: string;
    description?: string;
    imageUrl?: string;
  }) {
    const newFurniture = new this.furnitureModel(furnitureData);
    return newFurniture.save();
  }

  async updateFurniture(id: string, updateData: {
    name?: string;
    price?: number;
    category?: string;
    status?: string;
    description?: string;
    imageUrl?: string;
  }) {
    const furniture = await this.furnitureModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!furniture) {
      throw new NotFoundException('Furniture not found');
    }

    return furniture;
  }

  async deleteFurniture(id: string) {
    const furniture = await this.furnitureModel.findByIdAndDelete(id).exec();
    if (!furniture) {
      throw new NotFoundException('Furniture not found');
    }
    return { message: 'Furniture deleted successfully' };
  }

  async getAllEstimates() {
    return this.estimateModel.find()
      .populate({
        path: 'userId',
        select: 'email name',
        model: 'User'
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllOrders(userId?: string) {
    const query = userId ? { userId } : {};
    return this.orderModel.find(query).exec();
  }

  async updateEstimate(id: string, status: string) {
    return this.estimateModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  async updateOrder(id: string, status: string) {
    return this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }
} 