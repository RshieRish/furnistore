import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // Print out environment variables for debugging
  console.log('Environment Variables:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set');
  console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (hidden)' : 'Not set');
  console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? 'Set (hidden)' : 'Not set');
  console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set (hidden)' : 'Not set');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden)' : 'Not set');
  console.log('PORT:', process.env.PORT);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  
  const app = await NestFactory.create(AppModule);
  
  // Get frontend URL from environment or default
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  console.log('Frontend URL:', frontendUrl);
  
  // Enable CORS with specific configuration
  app.enableCors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Check if the origin is allowed
      const allowedOrigins = [
        'http://localhost:3000',
        'https://cornwalliss-bq7g7zcu0-rs-projects-4ede899c.vercel.app',
        'https://cornwalliss.vercel.app',
        'https://cornwallis-exchange.vercel.app'
      ];
      
      // Allow all vercel.app domains and railway.app domains
      if (allowedOrigins.includes(origin) || 
          origin.includes('vercel.app') || 
          origin.includes('railway.app') ||
          origin.includes('localhost')) {
        console.log('Allowed origin:', origin);
        callback(null, true);
      } else {
        console.log('Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Configure body parser limits
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Use cookie parser
  app.use(cookieParser());

  // Add a simple API status endpoint
  app.use('/api/status', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Serve static files from uploads directory
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  
  // Serve static files from images directory
  app.use('/images', express.static(join(__dirname, '..', 'images')));

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
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 