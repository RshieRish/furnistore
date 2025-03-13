import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation is successful', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'user',
        isAdmin: false,
        toObject: jest.fn().mockReturnValue({
          _id: 'user-id',
          email: 'test@example.com',
          password: await bcrypt.hash('password', 10),
          role: 'user',
          isAdmin: false,
        }),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      const result = await service.validateUser('test@example.com', 'password');
      
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        isAdmin: false,
      });
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');
      
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10),
        toObject: jest.fn(),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      const result = await service.validateUser('test@example.com', 'wrongpassword');
      
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token for authenticated user', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        isAdmin: false,
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login(mockUser);

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id');
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token', 'test-token');
      expect(result).toHaveProperty('user', mockUser);
    });

    it('should throw UnauthorizedException if user not found during login', async () => {
      const mockUser = { _id: 'nonexistent-id' };
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.login(mockUser)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 