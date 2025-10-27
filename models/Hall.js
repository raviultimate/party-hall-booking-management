import mongoose from 'mongoose';

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

export default mongoose.models.Hall || mongoose.model('Hall', HallSchema);
