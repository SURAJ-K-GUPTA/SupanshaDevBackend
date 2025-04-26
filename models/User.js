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
    ],
    default: null
  },
  level: { 
    type: Number, 
    min: 1, 
    max: 12, 
    default: 1 
  },
  geo: {
    country: { type: String, default: null },
    state: { type: String, default: null },
    region: { type: String, default: null },
    district: { type: String, default: null },
    block: { type: String, default: null },
    area: { type: String, default: null }
  },
  permissions: [{ type: String }],
  assignedRegions: [{ type: String, default: [] }]
}, { timestamps: true });

// Add permissions based on role before saving
userSchema.pre('save', function(next) {
  if (this.role && !this.permissions) {
    const permissionsMap = {
      'admin': [
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

module.exports = mongoose.model('User', userSchema);
