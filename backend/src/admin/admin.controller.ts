import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFiles, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { extname } from 'path';
import { memoryStorage } from 'multer';
import { S3Service } from '../shared/s3.service';
import { Public } from '../auth/decorators/public.decorator';
import axios from 'axios';
import { Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

interface UpdateFurnitureDto {
  name?: string;
  price?: number;
  category?: string;
  status?: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  @Get('furniture')
  async getFurniture() {
    return this.adminService.getAllFurniture();
  }

  @Get('furniture/:id')
  async getFurnitureById(@Param('id') id: string) {
    return this.adminService.getFurnitureById(id);
  }

  @Public()
  @Get('public/furniture')
  async getPublicFurniture(@Query('category') category?: string) {
    return this.adminService.getPublicFurniture(category);
  }

  @Post('furniture')
  @UseInterceptors(FilesInterceptor('image', 5, {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  }))
  async createFurniture(
    @Body() furnitureData: {
      name: string;
      price: number;
      category: string;
      description?: string;
    },
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    try {
      console.log('Creating furniture with data:', { ...furnitureData, files: files?.map(f => f.originalname) });
      
      // Convert price to number if it's a string
      const price = typeof furnitureData.price === 'string' 
        ? parseFloat(furnitureData.price) 
        : furnitureData.price;

      let imageUrl;
      const imageUrls = [];

      // Upload files to S3 if any
      if (files && files.length > 0) {
        // Upload each file to S3
        for (const file of files) {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const key = `furniture/${timestamp}-${randomString}${extname(file.originalname)}`;
          
          const s3Url = await this.s3Service.uploadFile(file, key);
          imageUrls.push(s3Url);
        }
        
        // Use the first image as the main imageUrl for backward compatibility
        imageUrl = imageUrls[0];
      }
      
      const result = await this.adminService.createFurniture({
        ...furnitureData,
        price,
        imageUrl,
        imageUrls
      });

      console.log('Furniture created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating furniture:', error);
      throw error;
    }
  }

  @Patch('furniture/:id')
  @UseInterceptors(FilesInterceptor('image', 5, {
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  }))
  async updateFurniture(
    @Param('id') id: string,
    @Body() updateData: UpdateFurnitureDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    try {
      console.log('Updating furniture with ID:', id);
      console.log('Update data received:', updateData);
      console.log('Files received:', files?.map(f => f.originalname) || 'No files');
      
      const dataToUpdate: UpdateFurnitureDto = { ...updateData };
      
      // Convert price to number if it's a string
      if (typeof dataToUpdate.price === 'string') {
        dataToUpdate.price = parseFloat(dataToUpdate.price);
      }
      
      if (files && files.length > 0) {
        console.log('Processing files for upload to S3...');
        const imageUrls = [];
        
        // Upload each file to S3
        for (const file of files) {
          try {
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const key = `furniture/${timestamp}-${randomString}${extname(file.originalname)}`;
            
            console.log(`Uploading file ${file.originalname} to S3 with key ${key}...`);
            const s3Url = await this.s3Service.uploadFile(file, key);
            console.log('File uploaded successfully, S3 URL:', s3Url);
            imageUrls.push(s3Url);
          } catch (uploadError) {
            console.error('Error uploading file to S3:', uploadError);
            throw new Error(`Failed to upload file ${file.originalname} to S3: ${uploadError.message}`);
          }
        }
        
        // Use the first image as the main imageUrl for backward compatibility
        dataToUpdate.imageUrl = imageUrls[0];
        dataToUpdate.imageUrls = imageUrls;
        console.log('Image URLs set:', { imageUrl: dataToUpdate.imageUrl, imageUrls: dataToUpdate.imageUrls });
      }
      
      console.log('Calling adminService.updateFurniture with data:', dataToUpdate);
      const result = await this.adminService.updateFurniture(id, dataToUpdate);
      console.log('Furniture updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating furniture:', error);
      throw error;
    }
  }

  @Delete('furniture/:id')
  async deleteFurniture(@Param('id') id: string) {
    return this.adminService.deleteFurniture(id);
  }

  @Get('estimates')
  async getEstimates() {
    return this.adminService.getAllEstimates();
  }

  @Get('orders')
  async getOrders(@Query('userId') userId?: string) {
    return this.adminService.getAllOrders(userId);
  }

  @Patch('estimates/:id')
  async updateEstimate(
    @Param('id') id: string,
    @Body() updateData: { status: string }
  ) {
    return this.adminService.updateEstimate(id, updateData);
  }

  @Patch('orders/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateData: { status: string }
  ) {
    return this.adminService.updateOrder(id, updateData);
  }

  @Public()
  @Get('proxy-image')
  async proxyImage(
    @Query('url') url: string,
    @Res() res: Response
  ) {
    try {
      if (!url) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'URL parameter is required' });
      }

      console.log('Proxy image request for URL:', url);

      // Check if this is an S3 URL
      if (url.includes('s3.us-east') || url.includes('amazonaws.com')) {
        // Extract bucket name and key from the S3 URL
        const urlObj = new URL(url);
        const hostParts = urlObj.hostname.split('.');
        const bucketName = hostParts[0];
        const key = urlObj.pathname.substring(1); // Remove leading slash
        
        console.log(`Detected S3 URL. Bucket: ${bucketName}, Key: ${key}`);
        
        try {
          // Create a GetObjectCommand to fetch the image directly from S3
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          });
          
          // Get the S3 client from the S3Service
          const s3Client = (this.s3Service as any).s3Client;
          
          console.log('Sending S3 GetObjectCommand...');
          
          // Send the command to get the object
          const response = await s3Client.send(command);
          
          // Set appropriate headers
          res.set({
            'Content-Type': response.ContentType,
            'Content-Length': response.ContentLength,
            'Cache-Control': 'max-age=31536000', // Cache for 1 year
          });
          
          console.log('S3 object retrieved successfully, streaming to client');
          
          // Stream the response body to the client
          response.Body.pipe(res);
          return; // Important: return here to prevent further execution
        } catch (error) {
          console.error('Error fetching from S3:', error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: 'Error fetching image from S3',
            error: error.message 
          });
        }
      } else {
        // For non-S3 URLs, proxy the request through axios
        console.log('Non-S3 URL, proxying through axios:', url);
        
        const response = await axios.get(url, { responseType: 'stream' });
        
        // Set appropriate headers
        res.set({
          'Content-Type': response.headers['content-type'],
          'Content-Length': response.headers['content-length'],
          'Cache-Control': 'max-age=31536000', // Cache for 1 year
        });
        
        console.log('External image retrieved successfully, streaming to client');
        
        // Stream the response to the client
        response.data.pipe(res);
      }
    } catch (error) {
      console.error('Error proxying image:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: 'Error proxying image',
        error: error.message 
      });
    }
  }
} 