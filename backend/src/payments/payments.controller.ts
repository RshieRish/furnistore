import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Body() body: { amount: number; estimateId: string },
    @User('id') userId: string,
  ) {
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      body.amount,
      'usd',
      { userId, estimateId: body.estimateId },
    );

    await this.paymentsService.createPayment(
      userId,
      body.estimateId,
      body.amount,
      paymentIntent.id,
      { estimateId: body.estimateId },
    );

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, request.rawBody as Buffer);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserPayments(@User('id') userId: string) {
    return this.paymentsService.getPaymentsByUser(userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }
} 