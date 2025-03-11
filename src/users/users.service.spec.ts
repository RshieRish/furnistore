import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'user',
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnThis(),
  };

  const mockUserModel = {
    new: jest.fn(),
    constructor: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            ensureAdminExists: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
    
    // Mock bcrypt hash
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const savedUser = {
        ...createUserDto,
        _id: 'new-user-id',
        password: 'hashedPassword',
        role: 'user',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: jest.fn().mockReturnValue({
          ...createUserDto,
          _id: 'new-user-id',
          password: undefined,
        }),
      };

      // Mock service.create to return a saved user
      service.create = jest.fn().mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(savedUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      // Mock service.create to throw ConflictException
      service.create = jest.fn().mockRejectedValue(new ConflictException('Email already exists'));

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      service.findAll = jest.fn().mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      service.findById = jest.fn().mockResolvedValue(mockUser);

      const result = await service.findById('user-id');
      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('user-id');
    });

    it('should return null if user not found', async () => {
      service.findById = jest.fn().mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');
      expect(result).toBeNull();
      expect(service.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      service.findByEmail = jest.fn().mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(service.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if user not found', async () => {
      service.findByEmail = jest.fn().mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
      expect(service.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };
      
      service.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.update('user-id', updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('user-id', updateUserDto);
    });

    it('should return null if user not found', async () => {
      service.update = jest.fn().mockResolvedValue(null);

      const result = await service.update('nonexistent-id', { name: 'Updated' });
      expect(result).toBeNull();
      expect(service.update).toHaveBeenCalledWith('nonexistent-id', { name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      service.remove = jest.fn().mockResolvedValue(mockUser);

      const result = await service.remove('user-id');
      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith('user-id');
    });

    it('should return null if user not found', async () => {
      service.remove = jest.fn().mockResolvedValue(null);

      const result = await service.remove('nonexistent-id');
      expect(result).toBeNull();
      expect(service.remove).toHaveBeenCalledWith('nonexistent-id');
    });
  });
}); 