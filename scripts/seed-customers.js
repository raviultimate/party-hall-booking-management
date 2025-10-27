import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// MongoDB connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Customer schema
const CustomerSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Please provide customer name'] 
    },
    email: { 
      type: String, 
      required: [true, 'Please provide customer email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: { 
      type: String, 
      required: [true, 'Please provide customer phone number'] 
    }
  },
  { 
    timestamps: true 
  }
);

// Create Customer model
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

// Sample customer data
const customersData = [
  {
    name: 'Raj Sharma',
    email: 'raj.sharma@example.com',
    phone: '9876543210'
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '8765432109'
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    phone: '7654321098'
  },
  {
    name: 'Neha Singh',
    email: 'neha.singh@example.com',
    phone: '6543210987'
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@example.com',
    phone: '5432109876'
  },
  {
    name: 'Anjali Desai',
    email: 'anjali.desai@example.com',
    phone: '4321098765'
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '3210987654'
  },
  {
    name: 'Sunita Reddy',
    email: 'sunita.reddy@example.com',
    phone: '2109876543'
  },
  {
    name: 'Kiran Joshi',
    email: 'kiran.joshi@example.com',
    phone: '1098765432'
  },
  {
    name: 'Deepak Gupta',
    email: 'deepak.gupta@example.com',
    phone: '0987654321'
  }
];

// Seed customers
const seedCustomers = async () => {
  try {
    // Delete existing customers
    await Customer.deleteMany({});
    console.log('Deleted existing customers');
    
    // Insert new customers
    const customers = await Customer.insertMany(customersData);
    console.log(`Added ${customers.length} customers to the database`);
    
    return customers;
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  await connectToDatabase();
  await seedCustomers();
  console.log('Customer seeding completed');
  process.exit(0);
};

main();
