const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  phone: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 1 },
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause', default: null },
  message: { type: String, required: true },
  paymentId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  receipt: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  date: { type: Date, default: Date.now },
  aadharNumber: { type: String, default: null },
  panCardNumber: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
