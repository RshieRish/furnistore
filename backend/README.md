# Cornwallis Exchange Backend

A robust NestJS backend service for the Cornwallis Exchange application, a modern web application that provides AI-powered furniture appraisals and estimates using computer vision technology. The platform includes secure payment processing and comprehensive admin analytics.

## 🌟 Features

* 🤖 AI-powered furniture appraisal
* 💰 Real-time price estimates
* 💳 Secure payment processing
* 📊 Admin dashboard with analytics
* 🔒 JWT authentication
* ⚡ Real-time updates with WebSockets
* 📈 Analytics and reporting
* 📁 File upload handling
* 🔑 Role-based access control
* 📝 Detailed logging system

## 🏗️ Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with JWT
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **AI Integration**: Groq API
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Payment Processing**: Stripe
- **Storage**: AWS S3

## Prerequisites

- Node.js 18.x or later
- MongoDB 4.4 or later
- npm or yarn
- Groq API account and key

## Environment Setup

Create a `.env` file in the root directory (or copy from .env.example):

```env
# Application
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cornwallis

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=24h

# Groq API
GROQ_API_KEY=your-groq-api-key

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-bucket-name
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/RareandFind/Backend.git
cd Backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Initialize the database:
```bash
npm run init-db
```

5. Start the development server:
```bash
npm run start:dev
```

The server will be available at `http://localhost:3001`.

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── estimates/      # Furniture estimation module
│   ├── users/          # User management module
│   ├── orders/         # Order processing module
│   ├── products/       # Product management module
│   ├── common/         # Shared utilities and middleware
│   └── config/         # Configuration files
├── test/              # Test files
├── uploads/          # Uploaded files directory
└── dist/            # Compiled JavaScript files
```

## API Documentation

The API documentation is available at `/api` when the server is running. It includes:

- Authentication endpoints
- Estimate creation and management
- User management
- Order processing
- Product management

## Key Features Implementation

### AI Vision Integration

The backend integrates with Groq's Vision API for furniture appraisal:
- Image preprocessing and optimization
- Detailed cost estimation
- Material analysis
- Labor hour calculation

### Authentication System

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Token refresh mechanism

### File Upload

- Supports multiple image formats
- File size validation
- Automatic cleanup of temporary files
- Secure file storage

### WebSocket Implementation

- Real-time status updates
- Connection management
- Room-based communication
- Error handling

## Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

## Deployment

### Docker Deployment

1. Build the image:
```bash
docker build -t cornwallis-backend .
```

2. Run the container:
```bash
docker run -p 3001:3001 \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_SECRET=your-jwt-secret \
  -e GROQ_API_KEY=your-groq-api-key \
  cornwallis-backend
```

## 🛡️ Security Features
* JWT authentication
* HTTP-only cookies
* Role-based access control
* Input validation
* Rate limiting
* CORS protection

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 