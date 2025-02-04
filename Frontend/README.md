# Cornwallis Exchange - Frontend

A modern web application for custom furniture estimates and orders. This application provides real-time furniture appraisals using AI vision technology.

![Application Screenshot](docs/images/app-screenshot.png)

## Features

- 🖼️ AI-powered furniture appraisal from images
- 💰 Real-time price estimates
- 🔒 Secure user authentication
- 📱 Responsive design
- ⚡ Real-time updates using WebSocket
- 🎨 Modern UI with Tailwind CSS

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT with HTTP-only cookies
- **Form Handling**: React Hook Form
- **API Communication**: Fetch API

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Backend server running (see backend README)

## Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
Frontend/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
├── public/              # Static assets
├── store/               # Zustand state management
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Key Features Implementation

### Authentication

The application uses JWT-based authentication with HTTP-only cookies for security. Authentication state is managed using Zustand store.

### Real-time Updates

WebSocket connection is managed through a custom hook (`useSocket`) that provides real-time updates for estimate status and results.

### Image Processing

- Supports image upload and preview
- Handles various image formats
- Provides client-side image compression
- Shows real-time upload progress

### Estimate Flow

1. User uploads furniture image
2. Provides requirements and details
3. System processes image using AI
4. Real-time updates during processing
5. Displays detailed estimate results

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

The application can be deployed using various platforms:

### Docker Deployment

```bash
docker build -t cornwallis-frontend .
docker run -p 3000:3000 cornwallis-frontend
```

### Vercel Deployment

```bash
vercel
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Screenshots

### Home Page
![Home Page](docs/images/home.png)

### Estimate Page
![Estimate Page](docs/images/estimate.png)

### Results Page
![Results Page](docs/images/results.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

