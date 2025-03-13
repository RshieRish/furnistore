FROM node:18-alpine

WORKDIR /app

# Install dependencies required for canvas and sharp
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libvips-dev

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with optional packages included
RUN npm install --include=optional

# If sharp is still problematic, install it specifically for Linux
RUN npm install --os=linux --cpu=x64 sharp

# Copy all files
COPY . .

# List files to debug
RUN ls -la
RUN echo "Checking for direct-api.js:"
RUN ls -la direct-api.js || echo "direct-api.js not found"
RUN echo "Checking for healthcheck.js:"
RUN ls -la healthcheck.js || echo "healthcheck.js not found"

# Create a simple healthcheck file directly in the Dockerfile
RUN echo 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  console.log(`Received request: ${req.method} ${req.url}`);\n  res.writeHead(200, { "Content-Type": "application/json" });\n  res.end(JSON.stringify({ status: "ok", message: "Backend API is healthy" }));\n});\n\nconst port = process.env.PORT || 8080;\nserver.listen(port, "0.0.0.0", () => {\n  console.log(`Server running on port ${port}`);\n});\n' > inline-healthcheck.js

# Build the application
RUN npm run build

# Expose the port
EXPOSE 4000
EXPOSE 8080

# Create a startup script with fallbacks
RUN echo '#!/bin/sh' > start.sh && \
    echo 'echo "Starting server..."' >> start.sh && \
    echo 'echo "Files in /app:"' >> start.sh && \
    echo 'ls -la /app' >> start.sh && \
    echo 'node server.js' >> start.sh && \
    chmod +x start.sh

# Use the startup script as the entry point
CMD ["./start.sh"] 