import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    _id: 'product-id',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    images: ['image1.jpg', 'image2.jpg'],
    category: 'test-category',
    stockQuantity: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCategory: jest.fn(),
    updateStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 129.99,
        category: 'new-category',
        stockQuantity: 5,
        images: [],
      };

      mockProductsService.create.mockResolvedValue({
        ...mockProduct,
        ...createProductDto,
      });

      const result = await controller.create(createProductDto);
      expect(result).toEqual({
        ...mockProduct,
        ...createProductDto,
      });
      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return all products when no category is provided', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();
      expect(result).toEqual(products);
      expect(mockProductsService.findAll).toHaveBeenCalled();
    });

    it('should return products by category when category is provided', async () => {
      const products = [mockProduct];
      mockProductsService.findByCategory.mockResolvedValue(products);

      const result = await controller.findAll('test-category');
      expect(result).toEqual(products);
      expect(mockProductsService.findByCategory).toHaveBeenCalledWith('test-category');
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('product-id');
      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('product-id');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99,
      };
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('product-id', updateProductDto);
      expect(result).toEqual(updatedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith('product-id', updateProductDto);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('nonexistent-id', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockProductsService.remove.mockResolvedValue(mockProduct);

      const result = await controller.remove('product-id');
      expect(result).toEqual(mockProduct);
      expect(mockProductsService.remove).toHaveBeenCalledWith('product-id');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 