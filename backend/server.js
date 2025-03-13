const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
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
  
  // Parse the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Health check endpoint
  if (pathname === '/health' || pathname === '/healthcheck' || pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Backend API is healthy',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Handle login requests
  if (pathname === '/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        console.log('Login request body:', body);
        const { email, password } = JSON.parse(body);
        console.log(`Login attempt for email: ${email}`);
        
        // Check if it's the admin user
        if (email === 'admin@cornwallis.com' && password === 'Admin@123') {
          console.log('Admin login successful');
          
          // Create a token
          const token = 'dummy-jwt-token-for-admin';
          
          // Set a cookie for the token
          res.setHeader('Set-Cookie', `token=${token}; Path=/; Max-Age=86400; SameSite=None; Secure`);
          
          // Return the response
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            access_token: token,
            user: {
              _id: '1',
              id: '1',
              email: 'admin@cornwallis.com',
              name: 'Admin User',
              role: 'admin',
              isAdmin: true
            }
          }));
        } else {
          // Regular user login
          const token = `dummy-jwt-token-${Date.now()}`;
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            access_token: token,
            user: {
              _id: Date.now().toString(),
              id: Date.now().toString(),
              email: email,
              name: 'User',
              role: 'user',
              isAdmin: false
            }
          }));
        }
      } catch (err) {
        console.error('Error processing login request:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
      }
    });
    return;
  }
  
  // Handle register requests
  if (pathname === '/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        console.log('Register request body:', body);
        const { name, email, password } = JSON.parse(body);
        console.log(`Register attempt for email: ${email}`);
        
        // Check if it's an admin registration
        const isAdminUser = email === 'admin@cornwallis.com';
        
        // Create a token
        const token = isAdminUser ? 'dummy-jwt-token-for-admin' : `dummy-jwt-token-${Date.now()}`;
        
        // Set a cookie for the token
        res.setHeader('Set-Cookie', `token=${token}; Path=/; Max-Age=86400; SameSite=None; Secure`);
        
        // Return the response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: token,
          user: {
            _id: isAdminUser ? '1' : Date.now().toString(),
            id: isAdminUser ? '1' : Date.now().toString(),
            email: email,
            name: name || 'User',
            role: isAdminUser ? 'admin' : 'user',
            isAdmin: isAdminUser
          }
        }));
      } catch (err) {
        console.error('Error processing register request:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
      }
    });
    return;
  }
  
  // Handle profile requests
  if (pathname === '/auth/profile' && req.method === 'GET') {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
    
    console.log(`Profile request with token: ${token}`);
    
    // Check if it's the admin token
    if (token === 'dummy-jwt-token-for-admin') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        _id: '1',
        id: '1',
        email: 'admin@cornwallis.com',
        name: 'Admin User',
        role: 'admin',
        isAdmin: true
      }));
    } else if (token.startsWith('dummy-jwt-token-')) {
      // Regular user token
      const userId = token.substring('dummy-jwt-token-'.length);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        _id: userId,
        id: userId,
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
        isAdmin: false
      }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unauthorized' }));
    }
    return;
  }
  
  // Handle admin furniture endpoint
  if (pathname === '/admin/furniture' && req.method === 'GET') {
    console.log('Admin furniture request received');
    // Return mock furniture data
    const mockFurniture = [
      {
        _id: '1',
        id: '1',
        name: 'Modern Sofa',
        description: 'A comfortable modern sofa',
        price: 599.99,
        category: 'Living Room',
        imageUrl: 'https://example.com/sofa.jpg',
        stock: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        id: '2',
        name: 'Dining Table',
        description: 'Elegant dining table for 6',
        price: 399.99,
        category: 'Dining Room',
        imageUrl: 'https://example.com/table.jpg',
        stock: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockFurniture));
    return;
  }
  
  // Handle public furniture endpoint
  if (pathname === '/admin/public/furniture' && req.method === 'GET') {
    console.log('Public furniture request received');
    
    // Get category from query params
    const category = url.searchParams.get('category');
    console.log('Category filter:', category);
    
    // Return mock furniture data
    const mockFurniture = [
      {
        _id: '1',
        id: '1',
        name: 'Modern Sofa',
        description: 'A comfortable modern sofa with premium fabric',
        price: 599.99,
        category: 'Living Room',
        imageUrl: 'https://example.com/sofa.jpg',
        imageUrls: [
          'https://example.com/sofa-1.jpg',
          'https://example.com/sofa-2.jpg'
        ],
        stock: 10,
        material: 'Fabric',
        color: 'Gray',
        dimensions: '220x90x85 cm',
        weight: '45 kg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        id: '2',
        name: 'Dining Table',
        description: 'Elegant dining table for 6 people made of solid oak',
        price: 399.99,
        category: 'Dining Room',
        imageUrl: 'https://example.com/table.jpg',
        imageUrls: [
          'https://example.com/table-1.jpg',
          'https://example.com/table-2.jpg'
        ],
        stock: 5,
        material: 'Oak',
        color: 'Natural',
        dimensions: '180x90x75 cm',
        weight: '60 kg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        id: '3',
        name: 'Queen Size Bed',
        description: 'Comfortable queen size bed with storage',
        price: 799.99,
        category: 'Bedroom',
        imageUrl: 'https://example.com/bed.jpg',
        imageUrls: [
          'https://example.com/bed-1.jpg',
          'https://example.com/bed-2.jpg'
        ],
        stock: 3,
        material: 'Wood and Fabric',
        color: 'Beige',
        dimensions: '160x200x45 cm',
        weight: '80 kg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        id: '4',
        name: 'Coffee Table',
        description: 'Modern coffee table with glass top',
        price: 249.99,
        category: 'Living Room',
        imageUrl: 'https://example.com/coffee-table.jpg',
        imageUrls: [
          'https://example.com/coffee-table-1.jpg',
          'https://example.com/coffee-table-2.jpg'
        ],
        stock: 8,
        material: 'Glass and Metal',
        color: 'Black',
        dimensions: '120x60x45 cm',
        weight: '25 kg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Filter by category if provided
    const filteredFurniture = category
      ? mockFurniture.filter(item => 
          item.category.toLowerCase().includes(category.toLowerCase()) ||
          (item.category.toLowerCase().includes('sofa') && category.toLowerCase() === 'living room') ||
          (item.category.toLowerCase().includes('bed') && category.toLowerCase() === 'bedroom') ||
          (item.category.toLowerCase().includes('table') && category.toLowerCase() === 'dining room')
        )
      : mockFurniture;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filteredFurniture));
    return;
  }
  
  // For all other requests, return a not found response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'error', 
    message: 'Endpoint not found' 
  }));
});

// Start the server
const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
}); 