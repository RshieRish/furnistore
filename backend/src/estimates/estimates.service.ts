import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Estimate } from './schemas/estimate.schema';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { EstimatesGateway } from './estimates.gateway';
import * as Sharp from 'sharp';

interface GroqEstimateResponse {
  choices: [{
    message: {
      content: string;
    };
  }];
}

interface EstimateResult {
  price: number;
  complexity: 'simple' | 'medium' | 'complex';
  materials: string[];
  laborHours: number;
  explanation: string;
}

@Injectable()
export class EstimatesService {
  private readonly groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(
    @InjectModel(Estimate.name) private estimateModel: Model<Estimate>,
    private configService: ConfigService,
    private readonly estimatesGateway: EstimatesGateway,
  ) {}

  async createEstimate(
    image: Express.Multer.File,
    requirements: string,
    user: User,
  ) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Notify client that processing has started
      this.estimatesGateway.sendEstimateStatus(
        user._id.toString(),
        'processing',
        'Analyzing your image and requirements...'
      );

      // Get price estimate from Groq
      const priceEstimate = await this.getPriceEstimateFromGroq(image, requirements);

      // Create and save the estimate
      const estimate = new this.estimateModel({
        userId: user._id,
        imageUrl: `uploads/${image.filename}`,
        requirements,
        price: priceEstimate.price,
        complexity: priceEstimate.complexity,
        materials: priceEstimate.materials,
        laborHours: priceEstimate.laborHours,
        explanation: priceEstimate.explanation,
        status: 'pending',
      });

      const savedEstimate = await estimate.save();

      // Notify client of success
      this.estimatesGateway.sendEstimateResult(
        user._id.toString(),
        savedEstimate
      );

      return savedEstimate;
    } catch (error) {
      console.error('Estimate creation error:', error);
      // Notify client of error
      this.estimatesGateway.sendEstimateStatus(
        user._id.toString(),
        'error',
        'Failed to create estimate. Please try again.'
      );
      throw error;
    }
  }

  private async getPriceEstimateFromGroq(image: Express.Multer.File, requirements: string): Promise<EstimateResult> {
    const promptText = `You are analyzing a furniture image to provide a detailed price estimate. Please consider these guidelines:

1. Base Material Costs:
   - Premium Hardwoods: $15-30 per board foot
   - Exotic Woods: $30-100 per board foot
   - Metal Components: $20-50 per sq ft
   - Glass: $25-75 per sq ft
   - Upholstery: $30-100 per yard
   - Hardware: $10-50 per piece

2. Labor Rates:
   - Basic Construction: $50/hour
   - Complex Work: $75/hour
   - Fine Details: $100/hour
   - Custom Design: $150/hour

3. Size Considerations:
   - Small (side table): 10-20 hours
   - Medium (dining table): 20-40 hours
   - Large (wardrobe): 40-60 hours

Please analyze the image and provide a detailed estimate in this exact JSON format:
{
  "price": number,
  "complexity": "simple" | "medium" | "complex",
  "materials": string[],
  "laborHours": number,
  "explanation": string
}

The explanation should include:
1. Breakdown of material costs
2. Labor hour justification
3. Complexity level reasoning
4. Special features considered
5. Final price calculation with 20% markup

Customer Requirements: ${requirements}`;

    try {
      // Read and compress the image
      const imageBuffer = await Sharp(path.join(process.cwd(), 'uploads', image.filename))
        .resize(800, 800, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const base64Image = imageBuffer.toString('base64');

      console.log('Sending request to Groq API...');
      const response = await fetch(this.groqApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.configService.get('GROQ_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.2-90b-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: promptText
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 0.9,
          response_format: { "type": "json_object" },
          stream: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Groq API error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      console.log('Received response from Groq API');
      const result = await response.json() as GroqEstimateResponse;
      
      try {
        const parsedResult = JSON.parse(result.choices[0].message.content) as EstimateResult;
        console.log('Successfully parsed estimate result');
        return parsedResult;
      } catch (error) {
        console.error('Failed to parse Groq response:', error);
        console.error('Raw response content:', result.choices[0].message.content);
        throw new Error('Invalid response format from Groq');
      }
    } catch (error) {
      console.error('Error in getPriceEstimateFromGroq:', error);
      throw error;
    }
  }

  async getUserEstimates(userId: string) {
    return this.estimateModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async updateEstimateStatus(id: string, status: string) {
    return this.estimateModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }
} 