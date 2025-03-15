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
var S3Service_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("@nestjs/config");
let S3Service = S3Service_1 = class S3Service {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(S3Service_1.name);
        const region = this.configService.get('AWS_REGION');
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        this.logger.log(`Initializing S3 client with region: ${region}`);
        if (!region || !accessKeyId || !secretAccessKey) {
            this.logger.error('Missing AWS credentials or region');
            throw new Error('Missing AWS credentials or region. Please check your environment variables.');
        }
        this.s3Client = new client_s3_1.S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    async uploadFile(file, key) {
        try {
            const bucketName = this.configService.get('AWS_BUCKET_NAME');
            if (!bucketName) {
                this.logger.error('Missing AWS_BUCKET_NAME environment variable');
                throw new Error('AWS_BUCKET_NAME is not defined in environment variables');
            }
            this.logger.log(`Uploading file to S3 bucket: ${bucketName}, key: ${key}`);
            if (!file.buffer) {
                this.logger.error('File buffer is missing');
                throw new Error('File buffer is missing. Make sure the file interceptor is not using disk storage.');
            }
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });
            this.logger.log('Sending PutObjectCommand to S3...');
            await this.s3Client.send(command);
            const fileUrl = `https://${bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
            this.logger.log(`File uploaded successfully. URL: ${fileUrl}`);
            return fileUrl;
        }
        catch (error) {
            this.logger.error(`Error uploading file to S3: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], S3Service);
//# sourceMappingURL=s3.service.js.map