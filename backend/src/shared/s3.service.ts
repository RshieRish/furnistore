import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor(private configService: ConfigService) {
    const region = this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    
    this.logger.log(`Initializing S3 client with region: ${region}`);
    
    if (!region || !accessKeyId || !secretAccessKey) {
      this.logger.error('Missing AWS credentials or region');
      throw new Error('Missing AWS credentials or region. Please check your environment variables.');
    }
    
    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
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
      
      const command = new PutObjectCommand({
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
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${error.message}`, error.stack);
      throw error;
    }
  }
} 