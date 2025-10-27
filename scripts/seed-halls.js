const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
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

// Hall schema
const HallSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Please provide a hall name'], 
      unique: true 
    },
    basePrice: { 
      type: Number, 
      required: [true, 'Please provide base price'] 
    },
    features: { 
      type: [String], 
      default: [] 
    },
    available: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Create Hall model
const Hall = mongoose.models.Hall || mongoose.model('Hall', HallSchema);

// Sample hall data
const hallsData = [
  {
    name: 'Grand Ballroom',
    basePrice: 25000,
    features: ['Stage', 'Dance Floor', 'Premium Sound System', 'Chandeliers', 'Projector', 'VIP Lounge'],
    available: true
  },
  {
    name: 'Royal Banquet Hall',
    basePrice: 20000,
    features: ['Elegant Decor', 'Buffet Setup', 'Sound System', 'Lighting Effects', 'Bridal Room'],
    available: true
  },
  {
    name: 'Garden Pavilion',
    basePrice: 18000,
    features: ['Outdoor Setting', 'Garden View', 'Tent Option', 'Natural Lighting', 'BBQ Area'],
    available: true
  },
  {
    name: 'Crystal Room',
    basePrice: 15000,
    features: ['Crystal Chandeliers', 'Elegant Decor', 'Private Bar', 'Mood Lighting'],
    available: true
  },
  {
    name: 'Executive Conference Hall',
    basePrice: 12000,
    features: ['Boardroom Setup', 'Projector', 'Video Conferencing', 'High-speed WiFi', 'Coffee Service'],
    available: true
  },
  {
    name: 'Celebration Lounge',
    basePrice: 10000,
    features: ['Intimate Setting', 'Bar Setup', 'Lounge Furniture', 'Ambient Lighting'],
    available: true
  },
  {
    name: 'Sunset Terrace',
    basePrice: 14000,
    features: ['Rooftop', 'Sunset View', 'Open Air', 'Bar Counter', 'Lounge Seating'],
    available: true
  },
  {
    name: 'Emerald Suite',
    basePrice: 8000,
    features: ['Elegant Decor', 'Private Dining', 'Sound System', 'Mood Lighting'],
    available: true
  },
  {
    name: 'Diamond Hall',
    basePrice: 18000,
    features: ['Spacious Layout', 'Stage', 'Premium Sound System', 'Lighting Effects', 'Dance Floor'],
    available: true
  },
  {
    name: 'Platinum Venue',
    basePrice: 22000,
    features: ['Grand Entrance', 'High Ceiling', 'Premium Decor', 'Stage', 'VIP Area', 'Full Bar Service'],
    available: true
  }
];

// Seed halls
const seedHalls = async () => {
  try {
    // Delete existing halls
    await Hall.deleteMany({});
    console.log('Deleted existing halls');
    
    // Insert new halls
    const halls = await Hall.insertMany(hallsData);
    console.log(`Added ${halls.length} halls to the database`);
    
    return halls;
  } catch (error) {
    console.error('Error seeding halls:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  await connectToDatabase();
  await seedHalls();
  console.log('Hall seeding completed');
  process.exit(0);
};

main();
