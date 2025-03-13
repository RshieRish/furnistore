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

# Build the application
RUN npm run build

# Expose the port
EXPOSE 4000

# Use direct-api.js as the entry point
CMD ["node", "direct-api.js"] 