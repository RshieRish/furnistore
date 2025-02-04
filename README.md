# Cornwallis Exchange - Furniture Appraisal Platform

A modern web application that provides AI-powered furniture appraisals and estimates using computer vision technology. The platform includes secure payment processing and comprehensive admin analytics.

![Platform Screenshot](docs/images/platform-screenshot.png)

## 🌟 Features

- 🤖 AI-powered furniture appraisal
- 💰 Real-time price estimates
- 💳 Secure payment processing with Stripe
- 📊 Admin financial dashboard
- 🔒 JWT authentication
- 📱 Responsive design
- ⚡ Real-time updates
- 📈 Analytics and reporting

## 🏗️ Architecture

The project is split into two main components:

### Frontend (Next.js)
- Modern UI built with Next.js 14
- Real-time updates with Socket.IO
- Secure authentication
- Responsive design with Tailwind CSS
- Interactive charts with Recharts

### Backend (NestJS)
- Robust API with NestJS
- MongoDB database
- Groq Vision API integration
- Stripe payment processing
- WebSocket support
- JWT authentication

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- MongoDB 4.4 or later
- npm or yarn
- Groq API account
- Stripe account

### Environment Setup

1. Backend (.env):
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/cornwallis

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h

# Groq API
GROQ_API_KEY=your-groq-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

2. Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cornwallis-exchange.git
cd cornwallis-exchange
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../Frontend
npm install
```

4. Start the development servers:

Backend:
```bash
cd backend
npm run start:dev
```

Frontend:
```bash
cd Frontend
npm run dev
```

## 📸 Screenshots

### Home Page
![Home Page](docs/images/home.png)

### Estimate Page
![Estimate Page](docs/images/estimate.png)

### Admin Dashboard
![Admin Dashboard](docs/images/admin.png)

## 🔧 Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Socket.IO Client
- Stripe.js
- Recharts

### Backend
- NestJS
- TypeScript
- MongoDB with Mongoose
- Passport.js
- Socket.IO
- Stripe
- Groq Vision API

## 🛡️ Security Features

- JWT authentication
- HTTP-only cookies
- Role-based access control
- Secure payment processing
- Input validation
- Rate limiting
- CORS protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 