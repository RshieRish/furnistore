// Main server file for Railway deployment
console.log('Starting server for Railway deployment...');

// Import required modules
const http = require('http');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Global variables for MongoDB connection
let db = null;
let mongoConnected = false;
let connectionError = null;
let connectionAttempts = 0;

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Create HTTP server
const server = http.createServer(async (req, res) => {
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
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const query = parsedUrl.query;
  
  // Health check endpoint
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Health check passed',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Proxy image endpoint
  if (path === '/proxy-image') {
    const imageUrl = url.parse(req.url, true).query.url;
    
    if (!imageUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error', 
        message: 'Missing url parameter'
      }));
      return;
    }
    
    console.log('Proxying image:', imageUrl);
    
    // Check if this is an S3 URL
    if (imageUrl.includes('amazonaws.com') || imageUrl.includes('s3.')) {
      try {
        // Parse the S3 URL to extract bucket and key
        const parsedUrl = new URL(imageUrl);
        const hostParts = parsedUrl.hostname.split('.');
        const bucketName = hostParts[0];
        const key = parsedUrl.pathname.substring(1); // Remove leading slash
        
        console.log(`Detected S3 URL. Bucket: ${bucketName}, Key: ${key}`);
        
        // Create a GetObjectCommand to fetch the image directly from S3
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        
        console.log('Sending S3 GetObjectCommand...');
        
        // Send the command to get the object
        const response = await s3Client.send(command);
        
        // Set appropriate headers
        res.writeHead(200, {
          'Content-Type': response.ContentType || 'image/jpeg',
          'Content-Length': response.ContentLength,
          'Cache-Control': 'max-age=31536000', // Cache for 1 year
          'Access-Control-Allow-Origin': '*'
        });
        
        console.log('S3 object retrieved successfully, streaming to client');
        
        // Stream the response body to the client
        response.Body.pipe(res);
        return;
      } catch (error) {
        console.error('Error accessing S3:', error.message);
        
        // Fall back to axios if S3 direct access fails
        proxyWithAxios(imageUrl, res);
        return;
      }
    } else {
      // For non-S3 URLs, use axios
      proxyWithAxios(imageUrl, res);
      return;
    }
  }
  
  // Public furniture endpoint - MOVED TO /public/furniture
  if (path === '/public/furniture') {
    console.log('Handling public furniture request');
    
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
    const category = query.category;
    console.log('Category filter:', category);
    
    // Build query
    const queryObj = {};
    if (category) {
      queryObj.category = { $regex: new RegExp(category, 'i') };
    }
    
    // Get furniture data from MongoDB
    db.collection('furnitures').find(queryObj).toArray()
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
    console.log('Handling admin furniture request');
    
    // Check for admin authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error', 
        message: 'Unauthorized - Admin access required'
      }));
      return;
    }
    
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
  console.log('Public furniture endpoint is available at /public/furniture');
  console.log('Admin furniture endpoint is available at /admin/furniture');
  console.log('Proxy image endpoint is available at /proxy-image');
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

// Helper function to proxy with axios
function proxyWithAxios(imageUrl, res) {
  axios({
    method: 'get',
    url: imageUrl,
    responseType: 'arraybuffer'
  })
    .then(response => {
      // Get content type from response
      const contentType = response.headers['content-type'] || 'image/jpeg';
      
      // Set appropriate headers
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      
      // Send the image data
      res.end(Buffer.from(response.data, 'binary'));
    })
    .catch(error => {
      console.error('Error proxying image with axios:', error.message);
      
      // Return a placeholder image or error
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error', 
        message: 'Failed to proxy image',
        url: imageUrl,
        error: error.message
      }));
    });
} 