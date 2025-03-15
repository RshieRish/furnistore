import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/schemas/user.schema';
import { ProductsService } from '../products/products.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly productsService;
    constructor(ordersService: OrdersService, productsService: ProductsService);
    create(createOrderDto: CreateOrderDto, user: User): unknown;
    findAll(user: User): unknown;
    findOne(id: string, user: User): unknown;
}
