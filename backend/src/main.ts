import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get frontend URL from environment or default
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  console.log('Frontend URL:', frontendUrl);
  
  // Enable CORS with specific configuration
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Configure body parser limits
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Use cookie parser
  app.use(cookieParser());

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Serve static files from uploads directory
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Furniture Store API')
    .setDescription('API documentation for the Furniture Store backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 