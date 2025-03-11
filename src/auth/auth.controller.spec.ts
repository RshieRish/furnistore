import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock response object
  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        _id: 'user-id',
        email: 'test@example.com',
      };

      const expectedResult = {
        access_token: 'jwt-token',
        user: {
          _id: 'user-id',
          email: 'test@example.com',
        },
      };

      mockAuthService.validateUser.mockResolvedValueOnce(user);
      mockAuthService.login.mockResolvedValueOnce(expectedResult);

      const result = await controller.login(loginDto, mockResponse as any);

      expect(result).toEqual(expectedResult);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        expectedResult.access_token,
        expect.any(Object)
      );
    });

    it('should throw UnauthorizedException when user validation fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockAuthService.validateUser.mockResolvedValueOnce(null);

      await expect(controller.login(loginDto, mockResponse as any)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      );
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('should propagate errors from auth service', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new UnauthorizedException('Test error');
      mockAuthService.validateUser.mockRejectedValueOnce(error);

      await expect(controller.login(loginDto, mockResponse as any)).rejects.toThrow(HttpException);
    });
  });

  describe('register', () => {
    it('should register a new user and return access token', async () => {
      const registerDto: CreateUserDto = {
        name: 'Test User',
        email: 'new@example.com',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt-token',
        user: {
          _id: 'user-id',
          name: 'Test User',
          email: 'new@example.com',
        },
      };

      mockAuthService.register.mockResolvedValueOnce(expectedResult);

      const result = await controller.register(registerDto, mockResponse as any);

      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        expectedResult.access_token,
        expect.any(Object)
      );
    });

    it('should propagate errors from auth service during registration', async () => {
      const registerDto: CreateUserDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      const error = new HttpException('Email already exists', HttpStatus.CONFLICT);
      mockAuthService.register.mockRejectedValueOnce(error);

      await expect(controller.register(registerDto, mockResponse as any)).rejects.toThrow(HttpException);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const req = {
        user: {
          _id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      const result = controller.getProfile(req);

      expect(result).toEqual(req.user);
    });
  });
}); 