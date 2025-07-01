const mongoose = require('mongoose');

const businessRegistrationSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  services: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['Free', 'Featured', 'Premium']
  },
  amount: {
    type: Number,
    default: 0
  },
  logo: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  orderId: {
    type: String
  },
  transactionId: {
    type: String
  },
  lastChecked: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
businessRegistrationSchema.index({ businessName: 'text' });
businessRegistrationSchema.index({ email: 1 });
businessRegistrationSchema.index({ paymentStatus: 1 });
businessRegistrationSchema.index({ orderId: 1 });

module.exports = mongoose.model('BusinessRegistration', businessRegistrationSchema);