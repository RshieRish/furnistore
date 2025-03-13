import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

// Mock Stripe at the top level
jest.mock('stripe', () => {
  const mockStripeInstance = {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'stripe-payment-intent-id',
        client_secret: 'stripe-client-secret',
        amount: 19998,
      }),
    },
    webhooks: {
      constructEvent: jest.fn().mockImplementation((payload, signature, secret) => {
        if (signature === 'invalid-signature') {
          throw new Error('Invalid signature');
        }
        return {
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'stripe-payment-id',
              metadata: {
                orderId: 'order-id',
              },
            },
          },
        };
      }),
    },
  };
  
  const MockStripe = jest.fn(() => mockStripeInstance);
  return { __esModule: true, default: MockStripe };
});

// Define mock variables for use in tests
const mockStripePaymentIntents = {
  create: jest.fn().mockResolvedValue({
    id: 'stripe-payment-intent-id',
    client_secret: 'stripe-client-secret',
    amount: 19998,
  }),
};

const mockStripeWebhooks = {
  constructEvent: jest.fn().mockImplementation((payload, signature, secret) => {
    if (signature === 'invalid-signature') {
      throw new Error('Invalid signature');
    }
    return {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'stripe-payment-id',
          metadata: {
            orderId: 'order-id',
          },
        },
      },
    };
  }),
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let model: Model<PaymentDocument>;
  let configService: ConfigService;

  const mockPayment = {
    _id: 'payment-id',
    userId: 'user-id',
    estimateId: 'estimate-id',
    amount: 199.98,
    currency: 'inr',
    stripePaymentIntentId: 'stripe-payment-id',
    status: 'succeeded',
    createdAt: new Date(),
    toObject: jest.fn().mockReturnThis(),
  };

  // Create a mock class for the Payment model
  class MockPaymentModel {
    constructor(private data) {}
    save = jest.fn().mockImplementation(() => {
      return Promise.resolve({ _id: 'payment-id', ...this.data });
    });
    static find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockPayment]),
    });
    static findOne = jest.fn();
    static findById = jest.fn();
    static findOneAndUpdate = jest.fn().mockResolvedValue(mockPayment);
    static aggregate = jest.fn().mockImplementation((query) => {
      if (query[0]?.$match?.status === 'succeeded') {
        return Promise.resolve([{ total: 1000 }]);
      }
      return Promise.resolve([
        { _id: 'succeeded', count: 5 },
        { _id: 'pending', count: 2 },
      ]);
    });
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'stripe_test_key';
      if (key === 'STRIPE_WEBHOOK_SECRET') return 'stripe_webhook_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getModelToken(Payment.name),
          useValue: MockPaymentModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    model = module.get<Model<PaymentDocument>>(getModelToken(Payment.name));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent', async () => {
      const amount = 199.98;
      const currency = 'inr';
      const metadata = { orderId: 'order-id' };

      const result = await service.createPaymentIntent(amount, currency, metadata);
      
      expect(result).toHaveProperty('id', 'stripe-payment-intent-id');
      expect(result).toHaveProperty('client_secret', 'stripe-client-secret');
    });

    it('should throw BadRequestException if Stripe API fails', async () => {
      const stripeInstance = (service as any).stripe;
      stripeInstance.paymentIntents.create = jest.fn().mockRejectedValueOnce(new Error('Stripe API error'));
      
      await expect(service.createPaymentIntent(0, 'inr')).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPayment', () => {
    it('should create a new payment record', async () => {
      const userId = 'user-id';
      const estimateId = 'estimate-id';
      const amount = 199.98;
      const stripePaymentIntentId = 'stripe-payment-intent-id';
      const metadata = { custom: 'data' };

      const result = await service.createPayment(
        userId,
        estimateId,
        amount,
        stripePaymentIntentId,
        metadata
      );
      
      expect(result).toHaveProperty('_id', 'payment-id');
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('estimateId', estimateId);
      expect(result).toHaveProperty('amount', amount);
      expect(result).toHaveProperty('stripePaymentIntentId', stripePaymentIntentId);
      expect(result).toHaveProperty('currency', 'inr');
    });
  });

  describe('getPaymentsByUser', () => {
    it('should return payments for a user', async () => {
      const userId = 'user-id';
      const payments = [mockPayment];
      
      const result = await service.getPaymentsByUser(userId);
      
      expect(result).toEqual(payments);
      expect(MockPaymentModel.find).toHaveBeenCalledWith({ userId });
    });
  });

  describe('handleWebhook', () => {
    it('should handle a webhook event', async () => {
      const signature = 'test-signature';
      const payload = Buffer.from('test-payload');

      const result = await service.handleWebhook(signature, payload);
      
      expect(result).toEqual({ received: true });
      expect(MockPaymentModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should throw BadRequestException if webhook verification fails', async () => {
      const signature = 'invalid-signature';
      const payload = Buffer.from('test-payload');

      const stripeInstance = (service as any).stripe;
      stripeInstance.webhooks.constructEvent = jest.fn().mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.handleWebhook(signature, payload)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      const result = await service.getPaymentStats();
      
      expect(result).toHaveProperty('totalRevenue', 1000);
      expect(result).toHaveProperty('recentPayments');
      expect(result).toHaveProperty('paymentsByStatus');
      expect(MockPaymentModel.aggregate).toHaveBeenCalledTimes(2);
    });
  });
}); 