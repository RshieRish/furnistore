import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../users/decorators/user.decorator';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPayment = {
    _id: 'payment-id',
    userId: 'user-id',
    estimateId: 'estimate-id',
    amount: 199.98,
    currency: 'usd',
    stripePaymentIntentId: 'stripe-payment-id',
    status: 'completed',
    createdAt: new Date(),
  };

  const mockPaymentsService = {
    createPaymentIntent: jest.fn(),
    createPayment: jest.fn(),
    getPaymentsByUser: jest.fn(),
    handleWebhook: jest.fn(),
    getPaymentStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
    .overrideGuard(User)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent', async () => {
      const paymentIntentData = {
        amount: 199.98,
        estimateId: 'estimate-id',
      };
      
      const userId = 'user-id';

      const mockPaymentIntent = {
        id: 'pi_123456',
        client_secret: 'client-secret',
        amount: 19998,
      };

      mockPaymentsService.createPaymentIntent.mockResolvedValue(mockPaymentIntent);
      mockPaymentsService.createPayment.mockResolvedValue(mockPayment);

      const result = await controller.createPaymentIntent(paymentIntentData, userId);
      
      expect(result).toEqual({ clientSecret: 'client-secret' });
      expect(mockPaymentsService.createPaymentIntent).toHaveBeenCalledWith(
        paymentIntentData.amount,
        'usd',
        { userId, estimateId: paymentIntentData.estimateId }
      );
      expect(mockPaymentsService.createPayment).toHaveBeenCalledWith(
        userId,
        paymentIntentData.estimateId,
        paymentIntentData.amount,
        mockPaymentIntent.id,
        { estimateId: paymentIntentData.estimateId }
      );
    });

    it('should throw BadRequestException if payment intent creation fails', async () => {
      const paymentIntentData = {
        amount: 199.98,
        estimateId: 'estimate-id',
      };
      
      const userId = 'user-id';

      mockPaymentsService.createPaymentIntent.mockRejectedValue(new BadRequestException());

      await expect(controller.createPaymentIntent(paymentIntentData, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    it('should handle a webhook event', async () => {
      const signature = 'test-signature';
      const mockRequest = {
        rawBody: Buffer.from('test-payload'),
      };

      mockPaymentsService.handleWebhook.mockResolvedValue({ received: true });

      const result = await controller.handleWebhook(signature, mockRequest as any);
      expect(result).toEqual({ received: true });
      expect(mockPaymentsService.handleWebhook).toHaveBeenCalledWith(
        signature,
        mockRequest.rawBody
      );
    });
  });

  describe('getUserPayments', () => {
    it('should return payments for a user', async () => {
      const userId = 'user-id';
      const payments = [mockPayment];
      
      mockPaymentsService.getPaymentsByUser.mockResolvedValue(payments);

      const result = await controller.getUserPayments(userId);
      expect(result).toEqual(payments);
      expect(mockPaymentsService.getPaymentsByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      const stats = {
        totalRevenue: 1000,
        recentPayments: [mockPayment],
        paymentsByStatus: { completed: 5, pending: 2 },
      };
      
      mockPaymentsService.getPaymentStats.mockResolvedValue(stats);

      const result = await controller.getPaymentStats();
      expect(result).toEqual(stats);
      expect(mockPaymentsService.getPaymentStats).toHaveBeenCalled();
    });
  });
}); 