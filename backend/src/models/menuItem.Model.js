/* eslint-disable comma-dangle */
import mongoose from 'mongoose';

const menuItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    category: {
      type: String,
      enum: ['Espresso', 'Hot', 'Iced', 'Tea', 'Protein', 'Caffeine Free', 'Pastry'],
      default: 'Espresso',
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('MenuItem', menuItemSchema);
