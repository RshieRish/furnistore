import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { S3Service } from '../shared/s3.service';
import { NotFoundException } from '@nestjs/common';

// Define inline DTOs instead of importing them
interface FurnitureDto {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

interface UpdateFurnitureDto {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;
  let s3Service: S3Service;

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
    userId: 'user-id',
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

  const mockAdminService = {
    getAllFurniture: jest.fn(),
    getFurnitureById: jest.fn(),
    createFurniture: jest.fn(),
    updateFurniture: jest.fn(),
    deleteFurniture: jest.fn(),
    getAllEstimates: jest.fn(),
    updateEstimate: jest.fn(),
    getAllOrders: jest.fn(),
    updateOrder: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  // Mock guards
  const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        { provide: S3Service, useValue: mockS3Service },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
    s3Service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFurniture', () => {
    it('should return all furniture items', async () => {
      const furnitureItems = [mockFurniture];
      mockAdminService.getAllFurniture.mockResolvedValue(furnitureItems);

      const result = await controller.getFurniture();
      expect(result).toEqual(furnitureItems);
      expect(adminService.getAllFurniture).toHaveBeenCalled();
    });
  });

  describe('createFurniture', () => {
    it('should create a new furniture item', async () => {
      const createFurnitureDto: FurnitureDto = {
        name: 'Test Chair',
        price: 199.99,
        category: 'chairs',
        description: 'A comfortable chair',
      };

      const mockFile = {
        fieldname: 'image',
        originalname: 'chair.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 955578,
        destination: './uploads',
        filename: 'chair.jpg',
        path: 'uploads/chair.jpg',
        stream: null as any,
      } as Express.Multer.File;

      // Wrap the mockFile in an array
      const mockFiles = [mockFile];

      mockAdminService.createFurniture.mockResolvedValue({
        _id: 'new-furniture-id',
        ...createFurnitureDto,
        imageUrl: '/uploads/chair.jpg',
        imageUrls: ['/uploads/chair.jpg'],
      });

      const result = await controller.createFurniture(createFurnitureDto, mockFiles);
      expect(result).toHaveProperty('_id', 'new-furniture-id');
      expect(adminService.createFurniture).toHaveBeenCalled();
    });
  });

  describe('updateFurniture', () => {
    it('should update a furniture item', async () => {
      const updateFurnitureDto: UpdateFurnitureDto = {
        name: 'Updated Sofa',
        price: 599.99,
      };

      const mockFile = {
        fieldname: 'image',
        originalname: 'sofa.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 955578,
        destination: './uploads',
        filename: 'sofa.jpg',
        path: 'uploads/sofa.jpg',
        stream: null as any,
      } as Express.Multer.File;

      // Wrap the mockFile in an array
      const mockFiles = [mockFile];

      const updatedFurniture = {
        ...mockFurniture,
        ...updateFurnitureDto,
      };

      mockAdminService.updateFurniture.mockResolvedValue(updatedFurniture);

      const result = await controller.updateFurniture('furniture-id', updateFurnitureDto, mockFiles);
      expect(result).toEqual(updatedFurniture);
      expect(adminService.updateFurniture).toHaveBeenCalledWith('furniture-id', updateFurnitureDto);
    });

    it('should throw NotFoundException if furniture not found', async () => {
      const updateFurnitureDto: UpdateFurnitureDto = {
        name: 'Updated Sofa',
        price: 599.99,
      };

      mockAdminService.updateFurniture.mockRejectedValue(new NotFoundException('Furniture not found'));

      await expect(controller.updateFurniture('nonexistent-id', updateFurnitureDto, [])).rejects.toThrow(NotFoundException);
      expect(adminService.updateFurniture).toHaveBeenCalledWith('nonexistent-id', updateFurnitureDto);
    });
  });

  describe('deleteFurniture', () => {
    it('should delete a furniture item', async () => {
      const deleteResult = { message: 'Furniture deleted successfully' };
      mockAdminService.deleteFurniture.mockResolvedValue(deleteResult);

      const result = await controller.deleteFurniture('furniture-id');
      expect(result).toEqual(deleteResult);
      expect(adminService.deleteFurniture).toHaveBeenCalledWith('furniture-id');
    });

    it('should throw NotFoundException if furniture not found during deletion', async () => {
      mockAdminService.deleteFurniture.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteFurniture('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(adminService.deleteFurniture).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('getEstimates', () => {
    it('should return all estimates', async () => {
      const estimates = [mockEstimate];
      mockAdminService.getAllEstimates.mockResolvedValue(estimates);

      const result = await controller.getEstimates();
      expect(result).toEqual(estimates);
      expect(adminService.getAllEstimates).toHaveBeenCalled();
    });
  });

  describe('updateEstimate', () => {
    it('should update an estimate status', async () => {
      const updatedEstimate = { ...mockEstimate, status: 'approved' };
      mockAdminService.updateEstimate.mockResolvedValue(updatedEstimate);

      const result = await controller.updateEstimate('estimate-id', { status: 'approved' });
      expect(result).toEqual(updatedEstimate);
      expect(adminService.updateEstimate).toHaveBeenCalledWith('estimate-id', { status: 'approved' });
    });
  });

  describe('getOrders', () => {
    it('should return all orders', async () => {
      const orders = [mockOrder];
      mockAdminService.getAllOrders.mockResolvedValue(orders);

      const result = await controller.getOrders();
      expect(result).toEqual(orders);
      expect(adminService.getAllOrders).toHaveBeenCalledWith(undefined);
    });

    it('should return orders for a specific user when userId is provided', async () => {
      const orders = [mockOrder];
      mockAdminService.getAllOrders.mockResolvedValue(orders);

      const result = await controller.getOrders('user-id');
      expect(result).toEqual(orders);
      expect(adminService.getAllOrders).toHaveBeenCalledWith('user-id');
    });
  });

  describe('updateOrder', () => {
    it('should update an order status', async () => {
      const updatedOrder = { ...mockOrder, status: 'shipped' };
      mockAdminService.updateOrder.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrder('order-id', { status: 'shipped' });
      expect(result).toEqual(updatedOrder);
      expect(adminService.updateOrder).toHaveBeenCalledWith('order-id', { status: 'shipped' });
    });
  });
}); 