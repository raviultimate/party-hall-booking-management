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

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Booking',
      required: [true, 'Please provide booking ID'] 
    },
    amount: { 
      type: Number, 
      required: [true, 'Please provide payment amount'] 
    },
    method: { 
      type: String, 
      enum: ['cash', 'card', 'online'],
      required: [true, 'Please provide payment method'] 
    },
    paymentDate: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['paid', 'unpaid'],
      default: 'paid' 
    }
  },
  { 
    timestamps: true 
  }
);

// Create models
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

// Payment methods
const paymentMethods = ['cash', 'card', 'online'];

// Seed payments
const seedPayments = async () => {
  try {
    // Get confirmed bookings
    const bookings = await Booking.find({ status: 'confirmed' });
    
    if (bookings.length === 0) {
      console.error('No confirmed bookings found. Please seed bookings first.');
      process.exit(1);
    }
    
    // Delete existing payments
    await Payment.deleteMany({});
    console.log('Deleted existing payments');
    
    const paymentsData = [];
    
    // Create payments for each confirmed booking
    for (const booking of bookings) {
      // For each booking, create 1-3 payments
      const numPayments = Math.floor(Math.random() * 3) + 1;
      let remainingAmount = booking.totalCost;
      
      for (let i = 0; i < numPayments; i++) {
        let amount;
        
        if (i === numPayments - 1) {
          // Last payment covers the remaining amount
          amount = remainingAmount;
        } else {
          // Split payments randomly
          const maxAmount = remainingAmount * 0.8; // Max 80% of remaining
          amount = Math.round((Math.random() * maxAmount) * 100) / 100;
          remainingAmount -= amount;
        }
        
        // Set payment date
        const bookingDate = new Date(booking.startTime);
        let paymentDate;
        
        if (i === 0) {
          // First payment is usually advance payment, made when booking is created
          // Set it to 7-14 days before the event
          paymentDate = new Date(bookingDate);
          paymentDate.setDate(bookingDate.getDate() - (7 + Math.floor(Math.random() * 7)));
        } else {
          // Subsequent payments closer to the event date
          paymentDate = new Date(bookingDate);
          paymentDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 5));
        }
        
        // Select random payment method
        const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        paymentsData.push({
          bookingId: booking._id,
          amount,
          method,
          paymentDate,
          status: 'paid'
        });
      }
    }
    
    // Insert payments
    const payments = await Payment.insertMany(paymentsData);
    console.log(`Added ${payments.length} payments to the database`);
    
    // Update booking advance amounts based on payments
    for (const booking of bookings) {
      const bookingPayments = payments.filter(p => p.bookingId.toString() === booking._id.toString());
      const totalPaid = bookingPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      await Booking.findByIdAndUpdate(booking._id, {
        advanceAmount: totalPaid,
        balanceAmount: booking.totalCost - totalPaid
      });
    }
    
    console.log('Updated booking payment information');
    
    return payments;
  } catch (error) {
    console.error('Error seeding payments:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  await connectToDatabase();
  await seedPayments();
  console.log('Payment seeding completed');
  process.exit(0);
};

main();
