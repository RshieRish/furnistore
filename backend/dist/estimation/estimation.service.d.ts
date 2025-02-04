import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../shared/s3.service';
import { Estimation, EstimationDocument } from './schemas/estimation.schema';
import { User } from '../users/schemas/user.schema';
export declare class EstimationService {
    private estimationModel;
    private configService;
    private s3Service;
    constructor(estimationModel: Model<EstimationDocument>, configService: ConfigService, s3Service: S3Service);
    estimateBuild(file: Express.Multer.File, user: User): Promise<import("mongoose").Document<unknown, {}, EstimationDocument> & Estimation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    estimateRepair(file: Express.Multer.File, user: User): Promise<import("mongoose").Document<unknown, {}, EstimationDocument> & Estimation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    private extractCostFromAnalysis;
}
