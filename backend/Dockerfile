FROM node:18-alpine

WORKDIR /app

# Install dependencies required for Alpine
RUN apk add --no-cache \
    python3 \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    vips-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Debug: List current directory before copying
RUN echo "Current directory before copying:"
RUN ls -la

# Copy all files at once instead of individually
COPY . .

# Debug: List files in the directory after copying
RUN echo "Files in /app after copying:"
RUN ls -la /app
RUN echo "Checking for diagnostic-server.js:"
RUN ls -la /app/diagnostic-server.js || echo "diagnostic-server.js not found"

# Create a startup script that uses diagnostic-server.js
RUN echo '#!/bin/sh' > start.sh && \
    echo 'echo "Starting server..."' >> start.sh && \
    echo 'echo "Files in /app:"' >> start.sh && \
    echo 'ls -la /app' >> start.sh && \
    echo 'echo "Environment variables:"' >> start.sh && \
    echo 'echo "MONGODB_URI=${MONGODB_URI:0:20}..."' >> start.sh && \
    echo 'echo "MONGO_DB_NAME=${MONGO_DB_NAME}"' >> start.sh && \
    echo 'echo "PORT=${PORT}"' >> start.sh && \
    echo 'echo "Using diagnostic-server.js"' >> start.sh && \
    echo 'node diagnostic-server.js' >> start.sh && \
    chmod +x start.sh

# Expose the port
EXPOSE 4000

# Start the server
CMD ["./start.sh"] 