import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import { S3Client } from '@aws-sdk/client-s3';

describe('S3Service', () => {
  let service: S3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have AWS credentials set correctly', () => {
    // During tests, jest.setup.js sets these to test values
    expect(configService.get('AWS_ACCESS_KEY_ID')).toBe('test-key-id');
    expect(configService.get('AWS_SECRET_ACCESS_KEY')).toBe('test-access-key');
    expect(configService.get('AWS_BUCKET_NAME')).toBe('test-bucket');
    expect(configService.get('AWS_REGION')).toBe('us-east-1');
  });

  it('should initialize S3Client with correct config', () => {
    // Testing private property using any type assertion
    const s3Client = (service as any).s3Client;
    expect(s3Client).toBeInstanceOf(S3Client);
  });

  // Mock test for file upload function
  it('should generate correct S3 URL on upload', async () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
    } as Express.Multer.File;
    
    // Mock the S3Client send method
    jest.spyOn(S3Client.prototype, 'send').mockImplementation(() => Promise.resolve({}));
    
    const url = await service.uploadFile(mockFile, 'test-key.jpg');
    expect(url).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/test-key.jpg');
  });
}); 