import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/schemas/user.schema';
import { ProductsService } from '../products/products.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly productsService;
    constructor(ordersService: OrdersService, productsService: ProductsService);
    create(createOrderDto: CreateOrderDto, user: User): Promise<import("./schemas/order.schema").Order>;
    findAll(user: User): Promise<import("./schemas/order.schema").Order[]>;
    findOne(id: string, user: User): Promise<import("./schemas/order.schema").Order>;
}
