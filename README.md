# Cornwallis Exchange Backend

This is the backend service for the Cornwallis Exchange application, a modern web application that provides AI-powered furniture appraisals and estimates using computer vision technology. The platform includes secure payment processing and comprehensive admin analytics.

## 🌟 Features

* 🤖 AI-powered furniture appraisal
* 💰 Real-time price estimates
* 💳 Secure payment processing
* 📊 Admin dashboard with analytics
* 🔒 JWT authentication
* ⚡ Real-time updates with WebSockets
* 📈 Analytics and reporting

## 🏗️ Architecture

The backend is built with:

* NestJS framework
* MongoDB database
* Groq Vision API integration
* WebSocket support
* JWT authentication
* Stripe payment integration
* AWS S3 for image storage

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or later
* MongoDB 4.4 or later
* npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RareandFind/Backend.git
cd Backend
```

2. Install dependencies:
```bash
npm install
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

## 🔧 API Endpoints

The API documentation is available at `/api` when the server is running.

## 🛡️ Security Features
* JWT authentication
* HTTP-only cookies
* Role-based access control
* Input validation
* Rate limiting
* CORS protection

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 