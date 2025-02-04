import { EstimationService } from './estimation.service';
import { User } from '../users/schemas/user.schema';
export declare class EstimationController {
    private readonly estimationService;
    constructor(estimationService: EstimationService);
    estimateBuild(file: Express.Multer.File, user: User): Promise<import("mongoose").Document<unknown, {}, import("./schemas/estimation.schema").EstimationDocument> & import("./schemas/estimation.schema").Estimation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    estimateRepair(file: Express.Multer.File, user: User): Promise<import("mongoose").Document<unknown, {}, import("./schemas/estimation.schema").EstimationDocument> & import("./schemas/estimation.schema").Estimation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
