"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const estimate_schema_1 = require("./schemas/estimate.schema");
const config_1 = require("@nestjs/config");
const path = require("path");
const estimates_gateway_1 = require("./estimates.gateway");
const Sharp = require("sharp");
let EstimatesService = class EstimatesService {
    constructor(estimateModel, configService, estimatesGateway) {
        this.estimateModel = estimateModel;
        this.configService = configService;
        this.estimatesGateway = estimatesGateway;
        this.groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    }
    async createEstimate(image, requirements, user) {
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        try {
            this.estimatesGateway.sendEstimateStatus(user._id.toString(), 'processing', 'Analyzing your image and requirements...');
            const priceEstimate = await this.getPriceEstimateFromGroq(image, requirements);
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
            this.estimatesGateway.sendEstimateResult(user._id.toString(), savedEstimate);
            return savedEstimate;
        }
        catch (error) {
            console.error('Estimate creation error:', error);
            this.estimatesGateway.sendEstimateStatus(user._id.toString(), 'error', 'Failed to create estimate. Please try again.');
            throw error;
        }
    }
    async getPriceEstimateFromGroq(image, requirements) {
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
            const imageBuffer = await Sharp(path.join(process.cwd(), 'uploads', image.filename))
                .resize(800, 800, { fit: 'inside' })
                .jpeg({ quality: 80 })
                .toBuffer();
            const base64Image = imageBuffer.toString('base64');
            console.log('Sending request to Groq API...');
            const { default: fetch } = await Promise.resolve().then(() => require('node-fetch'));
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
            const result = await response.json();
            try {
                const parsedResult = JSON.parse(result.choices[0].message.content);
                console.log('Successfully parsed estimate result');
                return parsedResult;
            }
            catch (error) {
                console.error('Failed to parse Groq response:', error);
                console.error('Raw response content:', result.choices[0].message.content);
                throw new Error('Invalid response format from Groq');
            }
        }
        catch (error) {
            console.error('Error in getPriceEstimateFromGroq:', error);
            throw error;
        }
    }
    async getUserEstimates(userId) {
        return this.estimateModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }
    async updateEstimateStatus(id, status) {
        return this.estimateModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }
};
exports.EstimatesService = EstimatesService;
exports.EstimatesService = EstimatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(estimate_schema_1.Estimate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService,
        estimates_gateway_1.EstimatesGateway])
], EstimatesService);
//# sourceMappingURL=estimates.service.js.map