const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// User schema
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a name'] 
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'viewer'],
    default: 'viewer' 
  }
}, { 
  timestamps: true 
});

// Create User model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Seed admin user
const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@partyhall.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@partyhall.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Admin user created successfully:', adminUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Main function
const main = async () => {
  await connectToDatabase();
  await seedAdminUser();
  console.log('Seeding completed');
  process.exit(0);
};

main();
