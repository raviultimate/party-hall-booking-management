import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Get the MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', 
  MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in log

// MongoDB connection options
const options = {
  bufferCommands: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increased timeout for better diagnostics
  socketTimeoutMS: 45000,
};

// Test connection
async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log(`MongoDB connected successfully! Database: ${conn.connection.db.databaseName}`);
    
    // List collections if any
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
