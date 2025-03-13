import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotFoundException } from '@nestjs/common';
import { GetUser } from '../auth/get-user.decorator';
import { Types } from 'mongoose';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;
  let productsService: ProductsService;

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    isAdmin: false,
    role: 'user',
    createdAt: new Date(),
  };

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
    .overrideGuard(GetUser)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
    productsService = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        items: [
          {
            productId: 'product-id',
            quantity: 2,
          },
        ],
        shippingAddress: '123 Main St, City, State 12345, Country',
        totalAmount: 199.99,
      };

      const product = {
        _id: 'product-id',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      const expectedResult = {
        _id: 'order-id',
        ...createOrderDto,
        userId: mockUser._id.toString(),
        status: 'pending',
        createdAt: new Date(),
      };

      mockProductsService.findOne.mockResolvedValueOnce(product);
      mockOrdersService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createOrderDto, mockUser);

      expect(result).toEqual(expectedResult);
      expect(productsService.findOne).toHaveBeenCalledWith('product-id');
      expect(ordersService.create).toHaveBeenCalledWith(createOrderDto, mockUser);
    });

    it('should throw NotFoundException when product not found', async () => {
      const createOrderDto: CreateOrderDto = {
        items: [
          {
            productId: 'nonexistent-product-id',
            quantity: 2,
          },
        ],
        shippingAddress: '123 Main St, City, State 12345, Country',
        totalAmount: 199.99,
      };

      mockProductsService.findOne.mockResolvedValueOnce(null);

      await expect(controller.create(createOrderDto, mockUser)).rejects.toThrow(NotFoundException);
      expect(productsService.findOne).toHaveBeenCalledWith('nonexistent-product-id');
    });
  });

  describe('findAll', () => {
    it('should return all orders for the user', async () => {
      const expectedResult = [
        {
          _id: 'order-id-1',
          items: [{ productId: 'product-id', quantity: 2 }],
          shippingAddress: '123 Main St, City, State 12345, Country',
          totalAmount: 199.99,
          userId: mockUser._id.toString(),
          status: 'pending',
        },
        {
          _id: 'order-id-2',
          items: [{ productId: 'product-id', quantity: 1 }],
          shippingAddress: '456 Oak St, City, State 12345, Country',
          totalAmount: 99.99,
          userId: mockUser._id.toString(),
          status: 'shipped',
        },
      ];

      mockOrdersService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(expectedResult);
      expect(ordersService.findAll).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const expectedResult = {
        _id: 'order-id',
        items: [{ productId: 'product-id', quantity: 2 }],
        shippingAddress: '123 Main St, City, State 12345, Country',
        totalAmount: 199.99,
        userId: mockUser._id.toString(),
        status: 'pending',
      };

      mockOrdersService.findOne.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne('order-id', mockUser);

      expect(result).toEqual(expectedResult);
      expect(ordersService.findOne).toHaveBeenCalledWith('order-id', mockUser);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrdersService.findOne.mockResolvedValueOnce(null);

      await expect(controller.findOne('nonexistent-id', mockUser)).rejects.toThrow(NotFoundException);
      expect(ordersService.findOne).toHaveBeenCalledWith('nonexistent-id', mockUser);
    });
  });
});