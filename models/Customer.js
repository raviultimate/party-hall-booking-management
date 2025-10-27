import mongoose from 'mongoose';

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

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
