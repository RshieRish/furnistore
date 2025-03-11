import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EstimatesService } from './estimates.service';
import { User } from '../users/schemas/user.schema';
import { GetUser } from '../auth/get-user.decorator';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Controller('estimate')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async createEstimate(
    @UploadedFile() image: Express.Multer.File,
    @Body('requirements') requirements: string,
    @GetUser() user: User
  ) {
    const imageUrl = `${process.env.BACKEND_URL}/uploads/${image.filename}`;
    return this.estimatesService.createEstimate(image, requirements, user);
  }
} 