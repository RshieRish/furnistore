"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const express = require("express");
const path_1 = require("path");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    console.log('Environment Variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set');
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (hidden)' : 'Not set');
    console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? 'Set (hidden)' : 'Not set');
    console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set (hidden)' : 'Not set');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden)' : 'Not set');
    console.log('PORT:', process.env.PORT);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('Frontend URL:', frontendUrl);
    app.enableCors({
        origin: function (origin, callback) {
            if (!origin) {
                callback(null, true);
                return;
            }
            const allowedOrigins = [
                'http://localhost:3000',
                'https://cornwalliss-bq7g7zcu0-rs-projects-4ede899c.vercel.app',
                'https://cornwalliss.vercel.app',
                'https://cornwallis-exchange.vercel.app'
            ];
            if (allowedOrigins.includes(origin) ||
                origin.includes('vercel.app') ||
                origin.includes('railway.app') ||
                origin.includes('localhost')) {
                console.log('Allowed origin:', origin);
                callback(null, true);
            }
            else {
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
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use(cookieParser());
    app.use('/api/status', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'API is running' });
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.use('/uploads', express.static((0, path_1.join)(__dirname, '..', 'uploads')));
    app.use('/images', express.static((0, path_1.join)(__dirname, '..', 'images')));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Furniture Store API')
        .setDescription('API documentation for the Furniture Store backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map