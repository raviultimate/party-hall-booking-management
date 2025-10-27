import mongoose from 'mongoose';

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

// Update booking advance amount when a payment is made
PaymentSchema.post('save', async function() {
  const booking = await mongoose.models.Booking.findById(this.bookingId);
  if (booking) {
    const payments = await mongoose.models.Payment.find({ bookingId: this.bookingId, status: 'paid' });
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    booking.advanceAmount = totalPaid;
    booking.balanceAmount = booking.totalCost - totalPaid;
    
    await booking.save();
  }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
