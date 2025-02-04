import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return await this.ordersService.create(createOrderDto, user);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.ordersService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    return await this.ordersService.findOne(id, user);
  }
} 