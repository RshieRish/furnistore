const http = require('http');

// Create a simple HTTP server for healthcheck
const server = http.createServer((req, res) => {
  console.log(`Received healthcheck request: ${req.method} ${req.url}`);
  
  // If it's a healthcheck request, respond with 200
  if (req.url === '/health' || req.url === '/healthcheck' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Backend API is healthy',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // For all other requests, return a 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'error', 
    message: 'Not found' 
  }));
});

// Start the server on the specified port
const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', () => {
  console.log(`Healthcheck server running on port ${port}`);
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