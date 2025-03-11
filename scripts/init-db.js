/**
 * MongoDB Atlas Database Initialization Script
 * 
 * This script connects to MongoDB Atlas and ensures all necessary collections exist.
 * It also creates indexes for better query performance.
 */

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Required collections for the application
const requiredCollections = [
  'users',
  'furniture',
  'orders',
  'estimates',
  'payments'
];

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected to MongoDB Atlas!");

    // Get the database
    const db = client.db('furniture-store');
    
    // Get existing collections
    const collections = await db.listCollections().toArray();
    const existingCollections = collections.map(c => c.name);
    
    console.log('Existing collections:', existingCollections);
    
    // Create missing collections
    for (const collection of requiredCollections) {
      if (!existingCollections.includes(collection)) {
        console.log(`Creating collection: ${collection}`);
        await db.createCollection(collection);
      } else {
        console.log(`Collection already exists: ${collection}`);
      }
    }
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Furniture collection indexes
    await db.collection('furniture').createIndex({ name: 1 });
    await db.collection('furniture').createIndex({ category: 1 });
    
    // Orders collection indexes
    await db.collection('orders').createIndex({ user: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    
    // Estimates collection indexes
    await db.collection('estimates').createIndex({ user: 1 });
    
    // Payments collection indexes
    await db.collection('payments').createIndex({ user: 1 });
    await db.collection('payments').createIndex({ status: 1 });
    
    console.log('All collections and indexes are set up!');
    
    // Verify connection with a ping
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir); 