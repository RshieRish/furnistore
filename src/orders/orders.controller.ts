import { Controller, Get, Post, Body, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ProductsService } from '../products/products.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    // Validate that all products exist
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
    }
    
    return await this.ordersService.create(createOrderDto, user);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.ordersService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    const order = await this.ordersService.findOne(id, user);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
} 