import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    hallId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hall',
      required: [true, 'Please provide hall ID'] 
    },
    customerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Customer',
      required: [true, 'Please provide customer ID'] 
    },
    date: { 
      type: Date, 
      required: [true, 'Please provide booking date'] 
    },
    timeSlot: { 
      type: String, 
      enum: ['Morning', 'Evening'],
      required: [true, 'Please provide booking time slot'] 
    },
    totalCost: { 
      type: Number, 
      required: [true, 'Please provide total cost'] 
    },
    advanceAmount: { 
      type: Number, 
      default: 0 
    },
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
    notes: { 
      type: String, 
      default: '' 
    },
    attendeesCount: {
      type: Number,
      required: [true, 'Please provide number of attendees']
    },
    cateringMenu: {
      type: String,
      required: [true, 'Please provide catering menu details']
    }
  },
  { 
    timestamps: true 
  }
);

// Prevent overlapping bookings for the same hall
BookingSchema.pre('save', async function(next) {
  if (this.isModified('hallId') || this.isModified('date') || this.isModified('timeSlot')) {
    const overlappingBooking = await mongoose.models.Booking.findOne({
      hallId: this.hallId,
      date: this.date,
      timeSlot: this.timeSlot,
      status: { $ne: 'cancelled' },
      _id: { $ne: this._id }
    });

    if (overlappingBooking) {
      const error = new Error('Hall is already booked for this time period');
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
