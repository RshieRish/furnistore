#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Cornwallis Exchange Deployment Script${NC}"
echo -e "${YELLOW}This script will help you deploy the application to Railway and Vercel${NC}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Check if GitHub repository exists
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}Git repository initialized.${NC}"
else
    echo -e "${GREEN}Git repository already exists.${NC}"
fi

# Prepare backend for deployment
echo -e "${YELLOW}Preparing backend for deployment...${NC}"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Build the backend
echo -e "${YELLOW}Building backend...${NC}"
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend build successful.${NC}"
else
    echo -e "${RED}Backend build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

# Return to root directory
cd ..

# Prepare frontend for deployment
echo -e "${YELLOW}Preparing frontend for deployment...${NC}"
cd Frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Build the frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend build successful.${NC}"
else
    echo -e "${RED}Frontend build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

# Return to root directory
cd ..

echo -e "${GREEN}Build process completed successfully.${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Push your code to GitHub"
echo "2. Deploy the backend to Railway using the instructions in DEPLOYMENT.md"
echo "3. Deploy the frontend to Vercel using the instructions in DEPLOYMENT.md"
echo ""
echo -e "${GREEN}Good luck with your deployment!${NC}" 