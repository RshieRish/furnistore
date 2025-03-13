FROM node:18

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

# Build the application
RUN npm run build

# Expose the port
EXPOSE 4000
EXPOSE 8080

# Create a startup script
RUN echo '#!/bin/bash\nif [ -f "./direct-api.js" ]; then\n  echo "Starting with direct-api.js"\n  node ./direct-api.js\nelse\n  echo "direct-api.js not found, using healthcheck.js"\n  node ./healthcheck.js\nfi' > start.sh
RUN chmod +x start.sh

# Use the startup script as the entry point
CMD ["./start.sh"] 