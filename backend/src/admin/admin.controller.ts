import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { extname } from 'path';
import { memoryStorage } from 'multer';
import { S3Service } from '../shared/s3.service';
import { Public } from '../auth/decorators/public.decorator';

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
  ) {}

  @Get('furniture')
  async getFurniture() {
    return this.adminService.getAllFurniture();
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
} 