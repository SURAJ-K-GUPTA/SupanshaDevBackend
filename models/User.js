const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      'super-admin',
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
      'board-of-director',
      'executive-director',
      'operations-director',
      'chartered-accountant',
      'auditor',
      'technical-consultant',
      'advisor',
      'country-officer',
      'senior-program-manager',
      'senior-manager',
      'senior-officer',
      'manager',
      'officer',
      'associate',
      'executive',
      'intern',
      'web-developer',
      'assistant',
      'data-entry-operator',
      'receptionist',
      'event-organizer',
      'development-doer',
      'office-attendant',
      'driver',
      'guard',
      'vendor',
      'daily-service-provider',
      'state-program-manager',
      'state-coordinator',
      'state-officer',
      'regional-program-manager',
      'regional-coordinator',
      'regional-officer',
      'district-program-manager',
      'district-coordinator',
      'district-executive',
      'counsellor',
      'cluster-coordinator',
      'volunteer',
      'field-coordinator'
    ]
  },
  level: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 12, 
    default: 1 
  },
  geo: {
    country: { type: String, required: true },
    state: { type: String },
    region: { type: String },
    district: { type: String },
    block: { type: String },
    area: { type: String }
  },
  assignedRegions: [{ type: String }],
  permissions: [{ type: String }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      level: this.level,
      geo: this.geo,
      designation: this.designation,
      permissions: this.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Add permissions based on role before saving
userSchema.pre('save', function(next) {
  if (this.role && !this.permissions) {
    const permissionsMap = {
      'super-admin': [
        'create-country',
        'approve-sub-admins',
        'manage-master-data',
        'design-report-formats',
        'manage-users',
        'view-reports',
        'manage-events',
        'manage-jobs',
        'manage-blogs',
        'manage-causes',
        'manage-crowd-funding',
        'manage-forum',
        'manage-shop',
        'manage-content',
        'view-audit-logs'
      ],
      'country-admin': [
        'approve-sub-admins',
        'manage-users',
        'view-reports',
        'manage-events',
        'manage-jobs',
        'manage-blogs',
        'manage-causes',
        'manage-content'
      ],
      'state-admin': [
        'manage-users',
        'view-reports',
        'manage-events',
        'manage-jobs',
        'manage-blogs'
      ],
      'regional-admin': [
        'manage-users',
        'view-reports',
        'manage-events'
      ],
      'district-admin': [
        'manage-users',
        'view-reports'
      ],
      'block-admin': [
        'manage-users'
      ],
      'area-admin': [
        'manage-users'
      ],
      'user': []
    };
    this.permissions = permissionsMap[this.role] || [];
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;