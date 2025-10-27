const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { addDays, addHours, subDays } = require('date-fns');

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

// Import models
const HallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    features: { type: [String], default: [] },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true }
  },
  { timestamps: true }
);

const BookingSchema = new mongoose.Schema(
  {
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, enum: ['Morning', 'Evening'], required: true },
    totalCost: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    balanceAmount: { 
      type: Number,
      default: function() {
        return this.totalCost - this.advanceAmount;
      }
    },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending' 
    },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Create models
const Hall = mongoose.models.Hall || mongoose.model('Hall', HallSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

// Seed bookings
const seedBookings = async () => {
  try {
    // Get all halls and customers
    const halls = await Hall.find({});
    const customers = await Customer.find({});
    
    if (halls.length === 0 || customers.length === 0) {
      console.error('No halls or customers found. Please seed halls and customers first.');
      process.exit(1);
    }
    
    // Delete existing bookings
    await Booking.deleteMany({});
    console.log('Deleted existing bookings');
    
    const today = new Date();
    const bookingsData = [];
    
    // Create 10 bookings with different dates, halls, and customers
    for (let i = 0; i < 10; i++) {
      const hallIndex = i % halls.length;
      const customerIndex = i % customers.length;
      const hall = halls[hallIndex];
      const customer = customers[customerIndex];
      
      // Create different dates for bookings
      let bookingDate;
      let timeSlot;
      let status = 'confirmed';
      
      if (i < 3) {
        // Past bookings
        bookingDate = subDays(today, 10 + i);
        timeSlot = 'Morning';
      } else if (i < 6) {
        // Today and tomorrow bookings
        bookingDate = addDays(today, i - 3);
        timeSlot = 'Evening';
      } else {
        // Future bookings
        bookingDate = addDays(today, i);
        timeSlot = i % 2 === 0 ? 'Morning' : 'Evening';
        
        if (i > 8) {
          status = 'pending';
        }
      }
      
      // Set manual cost - base price plus additional for evening slots
      const totalCost = hall.basePrice + (timeSlot === 'Evening' ? 5000 : 0);
      const advanceAmount = status === 'confirmed' ? totalCost * 0.5 : 0;
      
      bookingsData.push({
        hallId: hall._id,
        customerId: customer._id,
        date: bookingDate,
        timeSlot,
        totalCost,
        advanceAmount,
        balanceAmount: totalCost - advanceAmount,
        status,
        notes: `Booking for ${customer.name} in ${hall.name} (${timeSlot})`
      });
    }
    
    // Insert bookings
    const bookings = await Booking.insertMany(bookingsData);
    console.log(`Added ${bookings.length} bookings to the database`);
    
    return bookings;
  } catch (error) {
    console.error('Error seeding bookings:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  await connectToDatabase();
  await seedBookings();
  console.log('Booking seeding completed');
  process.exit(0);
};

main();
