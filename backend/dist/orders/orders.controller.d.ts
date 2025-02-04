import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/schemas/user.schema';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, user: User): Promise<import("./schemas/order.schema").Order>;
    findAll(user: User): Promise<import("./schemas/order.schema").Order[]>;
    findOne(id: string, user: User): Promise<import("./schemas/order.schema").Order>;
}
