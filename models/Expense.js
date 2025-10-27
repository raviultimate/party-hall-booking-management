import mongoose from 'mongoose';

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

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
