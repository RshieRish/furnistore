import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
  ) {
    // Use a fallback value for Stripe API key if not provided in environment variables
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_51QwVnKSDylfS10gkcy2mvo1SylJpidJ4azq6q9UB4fvYzMnoysH1rZ5Pj7HS3PYUwsHUEu5WYrcgCfeuUUdqJgXu00F4tLw02I';
    console.log('Initializing Stripe with API key');
    
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'inr', metadata: any = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException('Error creating payment intent');
    }
  }

  async createPayment(
    userId: string,
    estimateId: string,
    amount: number,
    stripePaymentIntentId: string,
    metadata: any = {},
  ) {
    const payment = new this.paymentModel({
      userId,
      estimateId,
      amount,
      currency: 'inr',
      stripePaymentIntentId,
      status: 'pending',
      metadata,
    });

    return payment.save();
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      // Use a fallback value for Stripe webhook secret if not provided in environment variables
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || 'whsec_your_stripe_webhook_secret';
      
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException('Webhook error: ' + error.message);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'succeeded' },
    );
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'failed',
        errorMessage: paymentIntent.last_payment_error?.message,
      },
    );
  }

  async getPaymentsByUser(userId: string) {
    return this.paymentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate('estimateId')
      .exec();
  }

  async getPaymentStats() {
    const [totalRevenue, recentPayments, paymentsByStatus] = await Promise.all([
      this.paymentModel.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel
        .find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'email name')
        .populate('estimateId'),
      this.paymentModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      recentPayments,
      paymentsByStatus: paymentsByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
} 