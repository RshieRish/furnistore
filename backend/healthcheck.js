// Simple standalone health check server
// This file is used by Railway for health checks
console.log('Starting standalone health check server...');

const http = require('http');

// Create a simple HTTP server that responds to all requests with a 200 OK
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`Health check request received: ${req.method} ${req.url}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,Accept,Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Always respond with 200 OK for any path
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'ok', 
    message: 'Health check passed',
    timestamp: new Date().toISOString(),
    path: req.url
  }));
});

// Start the server on the specified port
const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Health check server running on port ${port}`);
  console.log('This server will respond with 200 OK to all requests');
});

// Log any errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 