const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  role: { 
    type: String, 
    required: true,
    enum: [
      'admin',
      'country-admin',
      'state-admin',
      'regional-admin',
      'district-admin',
      'block-admin',
      'area-admin',
      'user'
    ],
    default: 'user'
  },
  designation: {
    type: String,
    enum: [
      'board-of-director', 'executive-director', 'operations-director', 'chartered-accountant',
      'auditor', 'technical-consultant', 'advisor', 'country-officer', 'senior-program-manager',
      'senior-manager', 'senior-officer', 'manager', 'officer', 'associate', 'executive', 'intern',
      'web-developer', 'assistant', 'data-entry-operator', 'receptionist', 'event-organizer',
      'development-doer', 'office-attendant', 'driver', 'guard', 'vendor', 'daily-service-provider',
      'state-program-manager', 'state-coordinator', 'state-officer', 'regional-program-manager',
      'regional-coordinator', 'regional-officer', 'district-program-manager', 'district-coordinator',
      'district-executive', 'counsellor', 'cluster-coordinator', 'volunteer', 'field-coordinator'
    ]
  },
  level: { 
    type: Number, 
    min: 1, 
    max: 12, 
    default: 1 
  },
  geo: {
    country: { type: String },
    state: { type: String },
    region: { type: String },
    district: { type: String },
    block: { type: String },
    area: { type: String }
  },
  assignedRegions: [{ type: String }]
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
