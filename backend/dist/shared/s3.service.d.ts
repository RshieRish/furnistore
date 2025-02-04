import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private s3Client;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, key: string): Promise<string>;
}
