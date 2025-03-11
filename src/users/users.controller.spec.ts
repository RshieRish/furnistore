import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        _id: 'user-id',
        ...createUserDto,
      };

      mockUsersService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [
        {
          _id: 'user-id-1',
          name: 'User 1',
          email: 'user1@example.com',
        },
        {
          _id: 'user-id-2',
          name: 'User 2',
          email: 'user2@example.com',
        },
      ];

      mockUsersService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedResult = {
        _id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockUsersService.findById.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne('user-id');

      expect(result).toEqual(expectedResult);
      expect(usersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findById.mockResolvedValueOnce(null);

      await expect(controller.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(usersService.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
      };

      const expectedResult = {
        _id: 'user-id',
        name: 'Updated User',
        email: 'test@example.com',
      };

      mockUsersService.update.mockResolvedValueOnce(expectedResult);

      const result = await controller.update('user-id', updateUserDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.update).toHaveBeenCalledWith('user-id', updateUserDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
      };

      mockUsersService.update.mockResolvedValueOnce(null);

      await expect(controller.update('nonexistent-id', updateUserDto)).rejects.toThrow(NotFoundException);
      expect(usersService.update).toHaveBeenCalledWith('nonexistent-id', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedResult = {
        _id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockUsersService.remove.mockResolvedValueOnce(expectedResult);

      const result = await controller.remove('user-id');

      expect(result).toEqual(expectedResult);
      expect(usersService.remove).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.remove.mockResolvedValueOnce(null);

      await expect(controller.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(usersService.remove).toHaveBeenCalledWith('nonexistent-id');
    });
  });
}); 