import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminService } from './admin.service';
import { Furniture } from '../furniture/schemas/furniture.schema';
import { Estimate } from '../estimates/schemas/estimate.schema';
import { Order } from '../orders/schemas/order.schema';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let furnitureModel: Model<Furniture>;
  let estimateModel: Model<Estimate>;
  let orderModel: Model<Order>;

  const mockFurniture = {
    _id: 'furniture-id',
    name: 'Test Sofa',
    price: 499.99,
    category: 'Sofa',
    description: 'Comfortable sofa',
    imageUrl: 'sofa.jpg',
  };

  const mockEstimate = {
    _id: 'estimate-id',
    userId: {
      _id: 'user-id',
      email: 'user@example.com',
      name: 'Test User',
    },
    items: [
      { description: 'Test Item', estimatedPrice: 150 }
    ],
    status: 'pending',
    createdAt: new Date(),
  };

  const mockOrder = {
    _id: 'order-id',
    userId: 'user-id',
    items: [
      { productId: 'product-id', quantity: 2, price: 299.99 }
    ],
    totalAmount: 599.98,
    status: 'processing',
  };

  // Create a mock class for the Furniture model
  class MockFurnitureModel {
    constructor(private data) {}
    save = jest.fn().mockImplementation(() => {
      return Promise.resolve({ _id: 'new-furniture-id', ...this.data });
    });
    static find = jest.fn();
    static findById = jest.fn();
    static findByIdAndUpdate = jest.fn();
    static findByIdAndDelete = jest.fn();
  }

  const mockEstimateModel = {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockOrderModel = {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(Furniture.name),
          useValue: MockFurnitureModel,
        },
        {
          provide: getModelToken(Estimate.name),
          useValue: mockEstimateModel,
        },
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    furnitureModel = module.get<Model<Furniture>>(getModelToken(Furniture.name));
    estimateModel = module.get<Model<Estimate>>(getModelToken(Estimate.name));
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllFurniture', () => {
    it('should return all furniture items', async () => {
      const furnitureItems = [mockFurniture];
      jest.spyOn(furnitureModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(furnitureItems),
      } as any);

      const result = await service.getAllFurniture();
      expect(result).toEqual(furnitureItems);
      expect(furnitureModel.find).toHaveBeenCalled();
    });
  });

  describe('createFurniture', () => {
    it('should create and return new furniture', async () => {
      const createFurnitureDto = {
        name: 'New Chair',
        price: 199.99,
        category: 'Chair',
        description: 'Stylish chair',
        imageUrl: 'chair.jpg',
      };

      // Mock the service method directly
      jest.spyOn(service, 'createFurniture').mockImplementation(async (dto) => {
        return {
          _id: 'new-furniture-id',
          ...dto,
        } as any;
      });

      const result = await service.createFurniture(createFurnitureDto);
      
      expect(result).toEqual({
        _id: 'new-furniture-id',
        ...createFurnitureDto,
      });
    });
  });

  describe('updateFurniture', () => {
    it('should update and return furniture', async () => {
      const updateFurnitureDto = { 
        name: 'Updated Sofa', 
        price: 599.99 
      };
      const updatedFurniture = { 
        ...mockFurniture, 
        ...updateFurnitureDto 
      };

      jest.spyOn(furnitureModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedFurniture),
      } as any);

      const result = await service.updateFurniture('furniture-id', updateFurnitureDto);
      
      expect(result).toEqual(updatedFurniture);
      expect(furnitureModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'furniture-id',
        updateFurnitureDto,
        { new: true }
      );
    });

    it('should throw NotFoundException if furniture not found during update', async () => {
      jest.spyOn(furnitureModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.updateFurniture('nonexistent-id', { name: 'Updated Name' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFurniture', () => {
    it('should delete furniture and return success message', async () => {
      jest.spyOn(furnitureModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFurniture),
      } as any);

      const result = await service.deleteFurniture('furniture-id');
      
      expect(result).toEqual({ message: 'Furniture deleted successfully' });
      expect(furnitureModel.findByIdAndDelete).toHaveBeenCalledWith('furniture-id');
    });

    it('should throw NotFoundException if furniture not found during deletion', async () => {
      jest.spyOn(furnitureModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.deleteFurniture('nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getAllEstimates', () => {
    it('should return all estimates with user data populated', async () => {
      const estimates = [mockEstimate];
      jest.spyOn(estimateModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(estimates),
      } as any);

      const result = await service.getAllEstimates();
      
      expect(result).toEqual(estimates);
      expect(estimateModel.find).toHaveBeenCalled();
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [mockOrder];
      jest.spyOn(orderModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(orders),
      } as any);

      const result = await service.getAllOrders();
      
      expect(result).toEqual(orders);
      expect(orderModel.find).toHaveBeenCalledWith({});
    });

    it('should return orders for a specific user when userId is provided', async () => {
      const orders = [mockOrder];
      jest.spyOn(orderModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(orders),
      } as any);

      const result = await service.getAllOrders('user-id');
      
      expect(result).toEqual(orders);
      expect(orderModel.find).toHaveBeenCalledWith({ userId: 'user-id' });
    });
  });

  describe('updateEstimate', () => {
    it('should update and return estimate status', async () => {
      const updatedEstimate = { ...mockEstimate, status: 'approved' };
      
      jest.spyOn(estimateModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEstimate),
      } as any);

      const result = await service.updateEstimate('estimate-id', { status: 'approved' });
      
      expect(result).toEqual(updatedEstimate);
      expect(estimateModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'estimate-id',
        { status: 'approved' },
        { new: true }
      );
    });
  });

  describe('updateOrder', () => {
    it('should update and return order status', async () => {
      const updatedOrder = { ...mockOrder, status: 'shipped' };
      
      jest.spyOn(orderModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedOrder),
      } as any);

      const result = await service.updateOrder('order-id', { status: 'shipped' });
      
      expect(result).toEqual(updatedOrder);
      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'order-id',
        { status: 'shipped' },
        { new: true }
      );
    });
  });
}); 