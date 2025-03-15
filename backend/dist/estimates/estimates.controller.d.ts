import { EstimatesService } from './estimates.service';
import { User } from '../users/schemas/user.schema';
export declare class EstimatesController {
    private readonly estimatesService;
    constructor(estimatesService: EstimatesService);
    createEstimate(image: Express.Multer.File, requirements: string, user: User): unknown;
}
