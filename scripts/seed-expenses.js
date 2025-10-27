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

// Import models
const BookingSchema = new mongoose.Schema(
  {
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalCost: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

const ExpenseSchema = new mongoose.Schema(
  {
    bookingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Booking',
      required: [true, 'Please provide booking ID'] 
    },
    description: { 
      type: String, 
      required: [true, 'Please provide expense description'] 
    },
    amount: { 
      type: Number, 
      required: [true, 'Please provide expense amount'] 
    },
    category: { 
      type: String, 
      enum: ['decor', 'catering', 'labor', 'misc'],
      required: [true, 'Please provide expense category'] 
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    addedBy: { 
      type: String, 
      required: [true, 'Please provide the name of the person who added this expense'] 
    }
  },
  { 
    timestamps: true 
  }
);

// Create models
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

// Expense categories and descriptions
const expenseCategories = ['decor', 'catering', 'labor', 'misc'];
const expenseDescriptions = {
  decor: [
    'Flower arrangements',
    'Stage decoration',
    'Table centerpieces',
    'Balloon decorations',
    'Lighting setup',
    'Backdrop design',
    'Entrance decor',
    'Chair covers and sashes'
  ],
  catering: [
    'Main course buffet',
    'Appetizers and starters',
    'Dessert station',
    'Beverage service',
    'Cake and pastries',
    'Special dietary meals',
    'Staff meals',
    'Coffee and tea service'
  ],
  labor: [
    'Waitstaff',
    'Cleaning crew',
    'Security personnel',
    'Event coordinator',
    'Parking attendants',
    'Technical support',
    'Kitchen staff',
    'Bartenders'
  ],
  misc: [
    'Transportation',
    'Equipment rental',
    'Photography services',
    'Entertainment',
    'Printing materials',
    'Emergency supplies',
    'Insurance',
    'Permits and licenses'
  ]
};

// Seed expenses
const seedExpenses = async () => {
  try {
    // Get confirmed bookings
    const bookings = await Booking.find({ status: 'confirmed' });
    
    if (bookings.length === 0) {
      console.error('No confirmed bookings found. Please seed bookings first.');
      process.exit(1);
    }
    
    // Delete existing expenses
    await Expense.deleteMany({});
    console.log('Deleted existing expenses');
    
    const expensesData = [];
    const staffMembers = ['Rahul Mehta', 'Priya Sharma', 'Amit Patel', 'Neha Singh', 'Vikram Joshi'];
    
    // Create 2-4 expenses for each confirmed booking
    for (const booking of bookings) {
      const numExpenses = Math.floor(Math.random() * 3) + 2; // 2-4 expenses per booking
      
      for (let i = 0; i < numExpenses; i++) {
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const descriptions = expenseDescriptions[category];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        // Calculate amount based on category and booking total cost
        let amount;
        switch (category) {
          case 'decor':
            amount = booking.totalCost * (Math.random() * 0.1 + 0.05); // 5-15% of booking cost
            break;
          case 'catering':
            amount = booking.totalCost * (Math.random() * 0.2 + 0.2); // 20-40% of booking cost
            break;
          case 'labor':
            amount = booking.totalCost * (Math.random() * 0.1 + 0.1); // 10-20% of booking cost
            break;
          case 'misc':
            amount = booking.totalCost * (Math.random() * 0.05 + 0.02); // 2-7% of booking cost
            break;
          default:
            amount = booking.totalCost * 0.05; // 5% of booking cost
        }
        
        // Round to 2 decimal places
        amount = Math.round(amount * 100) / 100;
        
        // Set date to a few days before the booking
        const bookingDate = new Date(booking.startTime);
        const expenseDate = new Date(bookingDate);
        expenseDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 5) - 1); // 1-5 days before
        
        expensesData.push({
          bookingId: booking._id,
          description,
          amount,
          category,
          date: expenseDate,
          addedBy: staffMembers[Math.floor(Math.random() * staffMembers.length)]
        });
      }
    }
    
    // Insert expenses
    const expenses = await Expense.insertMany(expensesData);
    console.log(`Added ${expenses.length} expenses to the database`);
    
    return expenses;
  } catch (error) {
    console.error('Error seeding expenses:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  await connectToDatabase();
  await seedExpenses();
  console.log('Expense seeding completed');
  process.exit(0);
};

main();
