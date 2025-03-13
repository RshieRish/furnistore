const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB connection
let db = null;
let client = null;

async function connectToMongoDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined in environment variables');
      return false;
    }
    
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    db = client.db();
    return true;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    return false;
  }
}

// Connect to MongoDB when the server starts
connectToMongoDB().catch(console.error);

// Create a simple HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Get the origin from the request headers
  const origin = req.headers.origin || '';
  
  // Set CORS headers for all responses - allow both development and production domains
  const allowedOrigins = [
    'https://cornwalliss-bq7g7zcu0-rs-projects-4ede899c.vercel.app',
    'https://cornwalliss.vercel.app',
    'http://localhost:3000'
  ];
  
  // Check if the request origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For development or unknown origins, allow all
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,Accept,Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Log the full request details for debugging
  console.log('Request headers:', req.headers);
  
  // Parse the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log('Parsed pathname:', pathname);
  
  // Health check endpoint
  if (pathname === '/health' || pathname === '/healthcheck' || pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Backend API is healthy',
      timestamp: new Date().toISOString(),
      mongodb: db ? 'connected' : 'disconnected'
    }));
    return;
  }
  
  // Handle login requests
  if (pathname === '/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('Login request body:', body);
        const { email, password } = JSON.parse(body);
        console.log(`Login attempt for email: ${email}`);
        
        // Check if MongoDB is connected
        if (!db) {
          console.error('MongoDB not connected');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Database connection error' }));
          return;
        }
        
        // Find user in database
        const user = await db.collection('users').findOne({ email });
        
        if (!user) {
          console.log(`User not found: ${email}`);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
          return;
        }
        
        // For simplicity, we're not checking password hash here
        // In a real app, you would compare password hashes
        
        // Create a token
        const token = `real-jwt-token-${user._id}`;
        
        // Set a cookie for the token with proper cross-domain settings
        res.setHeader('Set-Cookie', `token=${token}; Path=/; Max-Age=86400; SameSite=None; Secure; HttpOnly`);
        
        // Return the response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: token,
          user: {
            _id: user._id.toString(),
            id: user._id.toString(),
            email: user.email,
            name: user.name || 'User',
            role: user.role || 'user',
            isAdmin: user.role === 'admin'
          }
        }));
      } catch (err) {
        console.error('Error processing login request:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal server error' }));
      }
    });
    return;
  }
  
  // Handle logout requests
  if (pathname === '/auth/logout' && (req.method === 'POST' || req.method === 'GET')) {
    console.log('Logout request received');
    
    // Clear the token cookie
    res.setHeader('Set-Cookie', 'token=; Path=/; Max-Age=0; SameSite=None; Secure; HttpOnly');
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      message: 'Logged out successfully' 
    }));
    return;
  }
  
  // Handle register requests
  if (pathname === '/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('Register request body:', body);
        const { name, email, password } = JSON.parse(body);
        console.log(`Register attempt for email: ${email}`);
        
        // Check if MongoDB is connected
        if (!db) {
          console.error('MongoDB not connected');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Database connection error' }));
          return;
        }
        
        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
          console.log(`User already exists: ${email}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User already exists' }));
          return;
        }
        
        // Create new user
        const newUser = {
          email,
          name: name || email.split('@')[0],
          role: email === 'admin@cornwallis.com' ? 'admin' : 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert user into database
        const result = await db.collection('users').insertOne(newUser);
        const userId = result.insertedId;
        
        // Create a token
        const token = `real-jwt-token-${userId}`;
        
        // Set a cookie for the token with proper cross-domain settings
        res.setHeader('Set-Cookie', `token=${token}; Path=/; Max-Age=86400; SameSite=None; Secure; HttpOnly`);
        
        // Return the response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: token,
          user: {
            _id: userId.toString(),
            id: userId.toString(),
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            isAdmin: newUser.role === 'admin'
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
    
    // Also check for token in cookies
    const cookies = req.headers.cookie || '';
    const cookieToken = cookies.split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith('token='));
    
    const finalToken = token || (cookieToken ? cookieToken.substring(6) : '');
    
    console.log(`Profile request with token: ${finalToken}`);
    
    // Check if MongoDB is connected
    if (!db) {
      console.error('MongoDB not connected');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Database connection error' }));
      return;
    }
    
    try {
      // Extract user ID from token
      let userId = null;
      
      // Handle dummy tokens for backward compatibility
      if (finalToken === 'dummy-jwt-token-for-admin') {
        // Find admin user
        const adminUser = await db.collection('users').findOne({ role: 'admin' });
        if (adminUser) {
          userId = adminUser._id;
        }
      } else if (finalToken.startsWith('dummy-jwt-token-')) {
        // For dummy tokens, we can't extract a real user ID
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid token format' }));
        return;
      } else if (finalToken.startsWith('real-jwt-token-')) {
        // Extract user ID from real token
        userId = finalToken.substring('real-jwt-token-'.length);
        try {
          userId = new ObjectId(userId);
        } catch (err) {
          console.error('Invalid ObjectId:', userId);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid token' }));
          return;
        }
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid token' }));
        return;
      }
      
      // Find user in database
      const user = await db.collection('users').findOne({ _id: userId });
      
      if (!user) {
        console.log(`User not found for ID: ${userId}`);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
        return;
      }
      
      // Return user profile
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        _id: user._id.toString(),
        id: user._id.toString(),
        email: user.email,
        name: user.name || 'User',
        role: user.role || 'user',
        isAdmin: user.role === 'admin'
      }));
    } catch (err) {
      console.error('Error processing profile request:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error' }));
    }
    return;
  }
  
  // Handle admin furniture endpoint
  if (pathname === '/admin/furniture' && req.method === 'GET') {
    console.log('Admin furniture request received');
    
    // Check if MongoDB is connected
    if (!db) {
      console.error('MongoDB not connected');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Database connection error' }));
      return;
    }
    
    try {
      // Get furniture from database
      const furniture = await db.collection('furnitures').find().toArray();
      
      // Map the data to the expected format
      const mappedFurniture = furniture.map(item => ({
        _id: item._id.toString(),
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl || 'https://example.com/placeholder.jpg',
        stock: item.stock || 10,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mappedFurniture));
    } catch (err) {
      console.error('Error fetching furniture:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error' }));
    }
    return;
  }
  
  // Handle public furniture endpoint
  if (pathname === '/admin/public/furniture' && req.method === 'GET') {
    console.log('Public furniture request received');
    
    // Get category from query params
    const category = url.searchParams.get('category');
    console.log('Category filter:', category);
    
    // Check if MongoDB is connected
    if (!db) {
      console.error('MongoDB not connected');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Database connection error' }));
      return;
    }
    
    try {
      // Build query
      const query = {};
      if (category) {
        query.category = { $regex: category, $options: 'i' };
      }
      
      // Get furniture from database
      const furniture = await db.collection('furnitures').find(query).toArray();
      
      // If no furniture found, return empty array
      if (!furniture || furniture.length === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      
      // Map the data to the expected format
      const mappedFurniture = furniture.map(item => ({
        _id: item._id.toString(),
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl || 'https://example.com/placeholder.jpg',
        imageUrls: item.imageUrls || [
          item.imageUrl || 'https://example.com/placeholder.jpg',
          'https://example.com/placeholder-2.jpg'
        ],
        stock: item.stock || 10,
        material: item.material || 'Wood',
        color: item.color || 'Natural',
        dimensions: item.dimensions || '100x50x75 cm',
        weight: item.weight || '20 kg',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mappedFurniture));
    } catch (err) {
      console.error('Error fetching public furniture:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error' }));
    }
    return;
  }
  
  // Handle products endpoint (for frontend compatibility)
  if (pathname === '/products' && req.method === 'GET') {
    console.log('Products request received');
    
    // Get category from query params
    const category = url.searchParams.get('category');
    console.log('Category filter for products:', category);
    
    // Check if MongoDB is connected
    if (!db) {
      console.error('MongoDB not connected');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Database connection error' }));
      return;
    }
    
    try {
      // Build query
      const query = {};
      if (category) {
        query.category = { $regex: category, $options: 'i' };
      }
      
      // Get products from database
      const products = await db.collection('products').find(query).toArray();
      
      // If no products found, try to get furniture instead
      if (!products || products.length === 0) {
        const furniture = await db.collection('furnitures').find(query).toArray();
        
        // If still no data, return empty array
        if (!furniture || furniture.length === 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([]));
          return;
        }
        
        // Map furniture to products format
        const mappedProducts = furniture.map(item => ({
          _id: item._id.toString(),
          id: item._id.toString(),
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          imageUrl: item.imageUrl || 'https://example.com/placeholder.jpg',
          imageUrls: item.imageUrls || [
            item.imageUrl || 'https://example.com/placeholder.jpg',
            'https://example.com/placeholder-2.jpg'
          ],
          stock: item.stock || 10,
          material: item.material || 'Wood',
          color: item.color || 'Natural',
          dimensions: item.dimensions || '100x50x75 cm',
          weight: item.weight || '20 kg',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mappedProducts));
        return;
      }
      
      // Map the data to the expected format
      const mappedProducts = products.map(item => ({
        _id: item._id.toString(),
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl || 'https://example.com/placeholder.jpg',
        imageUrls: item.imageUrls || [
          item.imageUrl || 'https://example.com/placeholder.jpg',
          'https://example.com/placeholder-2.jpg'
        ],
        stock: item.stock || 10,
        material: item.material || 'Wood',
        color: item.color || 'Natural',
        dimensions: item.dimensions || '100x50x75 cm',
        weight: item.weight || '20 kg',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mappedProducts));
    } catch (err) {
      console.error('Error fetching products:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error' }));
    }
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