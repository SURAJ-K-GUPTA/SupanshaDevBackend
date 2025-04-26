const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([
    'super-admin',
    'country-admin',
    'state-admin',
    'regional-admin',
    'district-admin',
    'block-admin',
    'area-admin',
    'user'
  ]),
  designation: z.enum([
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
  ]).optional(),
  level: z.number().min(1).max(12).default(1),
  geo: z.object({
    country: z.string(),
    state: z.string().optional(),
    region: z.string().optional(),
    district: z.string().optional(),
    block: z.string().optional(),
    area: z.string().optional(),
  }),
  assignedRegions: z.array(z.string()).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    // Validate request body
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      });
    }

    const { email, role } = result.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Authorization check for admin creation
    if (role !== 'user' && req.user?.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can create admin users'
      });
    }

    // Create new user
    const user = new User(result.data);
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // Set cookie and respond
    res.cookie('token', token, cookieOptions)
       .status(201)
       .json({
         success: true,
         user: {
           id: user._id,
           name: user.name,
           email: user.email,
           role: user.role,
           designation: user.designation,
           level: user.level,
           geo: user.geo
         }
       });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    // Validate request body
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      });
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    // Set cookie and respond
    res.cookie('token', token, cookieOptions)
       .status(200)
       .json({
         success: true,
         user: {
           id: user._id,
           name: user.name,
           email: user.email,
           role: user.role,
           designation: user.designation,
           level: user.level,
           geo: user.geo
         }
       });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  }).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Update user details
exports.updateUser = async (req, res) => {
  try {
    // Authorization - users can only update their own profile
    if (req.user?.id !== req.params.id && req.user?.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};