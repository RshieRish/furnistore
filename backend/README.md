# Cornwallis Exchange - Backend

A robust NestJS backend service for the Cornwallis Exchange furniture appraisal platform. This service provides AI-powered furniture appraisal, user authentication, and real-time communication capabilities.

## Features

- 🤖 AI Vision-powered furniture appraisal
- 🔐 JWT-based authentication
- 📊 MongoDB database integration
- 🔄 Real-time WebSocket updates
- 📁 File upload handling
- 🔑 Role-based access control
- 📝 Detailed logging system

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with JWT
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **AI Integration**: Groq API
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

- Node.js 18.x or later
- MongoDB 4.4 or later
- npm or yarn
- Groq API account and key

## Environment Setup

Create a `.env` file in the root directory:

```env
# Application
PORT=4000
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

# WebSocket
WS_PORT=4000
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start MongoDB:
```bash
mongod
```

4. Start the development server:
```bash
npm run start:dev
# or
yarn start:dev
```

The server will be available at `http://localhost:4000`.

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

The API documentation is available at `http://localhost:4000/api` when running in development mode. It includes:

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
docker run -p 4000:4000 \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_SECRET=your-jwt-secret \
  -e GROQ_API_KEY=your-groq-api-key \
  cornwallis-backend
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set up environment variables

3. Start the server:
```bash
npm run start:prod
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## API Rate Limiting

- Authentication: 5 requests per minute
- Estimates: 10 requests per hour
- File uploads: 50 requests per day

## Error Handling

The application implements a global error handling system with:
- Detailed error messages
- Error logging
- Appropriate HTTP status codes
- Rate limit notifications

## Security Measures

- CORS configuration
- Helmet security headers
- Rate limiting
- Input validation
- File upload restrictions
- JWT token validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 