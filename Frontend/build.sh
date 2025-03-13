#!/bin/bash
set -e

echo "Node version:"
node -v
echo "NPM version:"
npm -v

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building the application..."
npm run build

echo "Build completed successfully!" 