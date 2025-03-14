// Main server file for Railway deployment
console.log('Starting server for Railway deployment...');

// Import required modules
const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Global variables for MongoDB connection
let db = null;
let mongoConnected = false;
let connectionError = null;
let connectionAttempts = 0;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  const allowedOrigins = [
    'http://localhost:3000',
    'https://cornwalliss.vercel.app',
    'https://cornwallis-exchange.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || origin?.includes('vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
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
  
  // Log the request
  console.log(`Received request: ${req.method} ${req.url} from ${origin || 'unknown origin'}`);
  
  // Parse the URL path
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host}`);
  } catch (error) {
    // Handle invalid URLs
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Invalid URL' }));
    return;
  }
  
  const path = url.pathname;
  
  // Health check endpoint
  if (path === '/health' || path === '/healthcheck' || path === '/' || path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Health check passed',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Public furniture endpoint
  if (path === '/admin/public/furniture') {
    if (!mongoConnected) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error', 
        message: 'MongoDB connection not available',
        connectionAttempts
      }));
      return;
    }
    
    // Get category from query params
    const category = url.searchParams.get('category');
    console.log('Category filter:', category);
    
    // Build query
    const query = {};
    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    
    // Get furniture data from MongoDB
    db.collection('furnitures').find(query).toArray()
      .then(furniture => {
        if (furniture && furniture.length > 0) {
          console.log(`Found ${furniture.length} furniture items`);
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(JSON.stringify(furniture));
        } else {
          console.log('No furniture found in database');
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(JSON.stringify([]));
        }
      })
      .catch(err => {
        console.error('Error fetching furniture:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'error', 
          message: 'Database error',
          error: err.message
        }));
      });
    return;
  }
  
  // Admin furniture endpoint
  if (path === '/admin/furniture') {
    if (!mongoConnected) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error', 
        message: 'MongoDB connection not available',
        connectionAttempts
      }));
      return;
    }
    
    // Get furniture data from MongoDB
    db.collection('furnitures').find().toArray()
      .then(furniture => {
        if (furniture && furniture.length > 0) {
          console.log(`Found ${furniture.length} furniture items`);
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(JSON.stringify(furniture));
        } else {
          console.log('No furniture found in database');
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(JSON.stringify([]));
        }
      })
      .catch(err => {
        console.error('Error fetching furniture:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'error', 
          message: 'Database error',
          error: err.message
        }));
      });
    return;
  }
  
  // For all other requests
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
  console.log('Health check endpoint is available at /health');
  console.log('Public furniture endpoint is available at /admin/public/furniture');
  console.log('Admin furniture endpoint is available at /admin/furniture');
});

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    connectionAttempts++;
    console.log(`MongoDB connection attempt #${connectionAttempts}...`);
    
    // Get MongoDB URI from environment variables
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      connectionError = new Error('MONGODB_URI is not defined in environment variables');
      console.error(connectionError.message);
      return false;
    }
    
    console.log('MongoDB URI:', uri.substring(0, 20) + '...');
    
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Get database
    const dbName = process.env.MONGO_DB_NAME || 'furniture-store';
    console.log('Using database:', dbName);
    db = client.db(dbName);
    
    // List collections to verify connection
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Check if furnitures collection exists
    const hasFurnitureCollection = collections.some(c => c.name === 'furnitures');
    console.log('Has furnitures collection:', hasFurnitureCollection);
    
    if (hasFurnitureCollection) {
      // Count documents in furnitures collection
      const count = await db.collection('furnitures').countDocuments();
      console.log('Number of furniture items:', count);
      
      // Log the first few items for debugging
      const items = await db.collection('furnitures').find().limit(3).toArray();
      console.log('Sample furniture items:', JSON.stringify(items, null, 2));
    }
    
    mongoConnected = true;
    connectionError = null;
    
    return true;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    mongoConnected = false;
    connectionError = err;
    return false;
  }
}

// Start connecting to MongoDB
console.log('Starting MongoDB connection...');
connectToMongoDB().then(connected => {
  if (connected) {
    console.log('MongoDB connection established');
  } else {
    console.log('MongoDB connection failed');
  }
}).catch(err => {
  console.error('Error in MongoDB connection process:', err);
}); 