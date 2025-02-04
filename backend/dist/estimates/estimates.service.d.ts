import { Model } from 'mongoose';
import { Estimate } from './schemas/estimate.schema';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { EstimatesGateway } from './estimates.gateway';
export declare class EstimatesService {
    private estimateModel;
    private configService;
    private readonly estimatesGateway;
    private readonly groqApiUrl;
    constructor(estimateModel: Model<Estimate>, configService: ConfigService, estimatesGateway: EstimatesGateway);
    createEstimate(image: Express.Multer.File, requirements: string, user: User): Promise<import("mongoose").Document<unknown, {}, Estimate> & Estimate & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    private getPriceEstimateFromGroq;
    getUserEstimates(userId: string): Promise<(import("mongoose").Document<unknown, {}, Estimate> & Estimate & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    updateEstimateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, Estimate> & Estimate & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
