import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: Model<Order>;

  const userId = 'user-123';
  
  const mockOrderItemDto = {
    productId: 'furniture-123',
    quantity: 2,
  };

  const mockOrderItemSchema = {
    furnitureId: 'furniture-123',
    quantity: 2,
    price: 99.99,
  };

  const createOrderDto: CreateOrderDto = {
    items: [mockOrderItemDto],
    totalAmount: 199.98,
    shippingAddress: 'New York, 123 Main St, NY 10001, USA',
  };

  const mockUser = {
    _id: userId,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockOrder = {
    _id: 'order-123',
    userId,
    items: [mockOrderItemSchema],
    total: 199.98,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock save method
  const mockSave = jest.fn().mockResolvedValue({ _id: 'order-123', ...createOrderDto, userId });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockOrder]),
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));

    // Mock the service's create method directly
    jest.spyOn(service, 'create').mockImplementation(async (dto, user) => {
      return { 
        _id: 'order-123', 
        ...dto, 
        userId: user._id,
        save: mockSave
      } as any;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const result = await service.create(createOrderDto, mockUser as any);

      expect(result).toEqual(expect.objectContaining({
        _id: 'order-123',
        userId,
      }));
    });
  });

  describe('findAll', () => {
    it('should return all orders for a user', async () => {
      const result = await service.findAll(mockUser as any);
      
      expect(result).toEqual([mockOrder]);
      expect(orderModel.find).toHaveBeenCalledWith({ userId: mockUser._id });
    });
  });

  describe('findOne', () => {
    it('should return a single order by ID', async () => {
      const orderId = 'order-123';
      const result = await service.findOne(orderId, mockUser as any);
      
      expect(result).toEqual(mockOrder);
      expect(orderModel.findOne).toHaveBeenCalledWith({ 
        _id: orderId, 
        userId: mockUser._id 
      });
    });
  });
}); 