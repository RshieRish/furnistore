import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from './products.service';
import { Product, ProductDocument } from './schemas/product.schema';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<ProductDocument>;

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

  const mockProductModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
    constructor: jest.fn(() => mockProduct),
  };

  mockProductModel.constructor.mockImplementation(() => ({
    ...mockProduct,
    save: jest.fn().mockResolvedValue(mockProduct),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get<Model<ProductDocument>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [mockProduct];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(products),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual(products);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockProduct),
      } as any);

      const result = await service.findOne('product-id');
      expect(result).toEqual(mockProduct);
      expect(model.findById).toHaveBeenCalledWith('product-id');
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 129.99,
        images: ['new-image.jpg'],
        category: 'new-category',
        stockQuantity: 5,
      };

      const newProduct = { ...createProductDto, _id: 'new-product-id' };
      
      jest.spyOn(service, 'create').mockImplementation(async () => {
        return {
          ...newProduct,
        } as ProductDocument;
      });

      const result = await service.create(createProductDto);
      expect(result).toEqual(newProduct);
    });
  });

  describe('update', () => {
    it('should update and return a product', async () => {
      const updateProductDto = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, ...updateProductDto };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedProduct),
      } as any);

      const result = await service.update('product-id', updateProductDto);
      expect(result).toEqual(updatedProduct);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('product-id', updateProductDto, { new: true });
    });

    it('should throw NotFoundException if product to update not found', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.update('nonexistent-id', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return a product', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockProduct),
      } as any);

      const result = await service.remove('product-id');
      expect(result).toEqual(mockProduct);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('product-id');
    });

    it('should throw NotFoundException if product to delete not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCategory', () => {
    it('should return products in specified category', async () => {
      const products = [mockProduct];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(products),
      } as any);

      const result = await service.findByCategory('test-category');
      expect(result).toEqual(products);
      expect(model.find).toHaveBeenCalledWith({ category: 'test-category' });
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity and return the product', async () => {
      const updatedProduct = { ...mockProduct, stockQuantity: 15 };
      
      service.findOne = jest.fn().mockResolvedValue({
        ...mockProduct,
        stockQuantity: 10,
        save: jest.fn().mockResolvedValue(updatedProduct),
      });

      const result = await service.updateStock('product-id', 5);
      expect(result).toEqual(updatedProduct);
      expect(service.findOne).toHaveBeenCalledWith('product-id');
    });

    it('should not allow negative stock quantity', async () => {
      const updatedProduct = { ...mockProduct, stockQuantity: 0 };
      
      service.findOne = jest.fn().mockResolvedValue({
        ...mockProduct,
        stockQuantity: 10,
        save: jest.fn().mockResolvedValue(updatedProduct),
      });

      const result = await service.updateStock('product-id', -15);
      expect(result.stockQuantity).toBe(0);
    });
  });
}); 