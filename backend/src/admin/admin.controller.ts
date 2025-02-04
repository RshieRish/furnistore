import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

interface UpdateFurnitureDto {
  name?: string;
  price?: number;
  category?: string;
  status?: string;
  description?: string;
  imageUrl?: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('furniture')
  async getFurniture() {
    return this.adminService.getAllFurniture();
  }

  @Post('furniture')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
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
    @UploadedFile() file?: Express.Multer.File
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.adminService.createFurniture({
      ...furnitureData,
      imageUrl
    });
  }

  @Patch('furniture/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
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
    @UploadedFile() file?: Express.Multer.File
  ) {
    const dataToUpdate: UpdateFurnitureDto = { ...updateData };
    if (file) {
      dataToUpdate.imageUrl = `/uploads/${file.filename}`;
    }
    return this.adminService.updateFurniture(id, dataToUpdate);
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
    @Body('status') status: string,
  ) {
    return this.adminService.updateEstimate(id, status);
  }

  @Patch('orders/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateOrder(id, status);
  }
} 