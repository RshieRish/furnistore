import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/schemas/user.schema';
export declare class OrdersService {
    private orderModel;
    constructor(orderModel: Model<Order>);
    create(createOrderDto: CreateOrderDto, user: User): Promise<Order>;
    findAll(user: User): Promise<Order[]>;
    findOne(id: string, user: User): Promise<Order>;
}
