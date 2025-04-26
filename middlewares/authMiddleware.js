const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authorization token required" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      level: user.level,
      geo: user.geo,
      designation: user.designation,
      permissions: user.permissions
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};

// Role-based access control middleware
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient privileges",
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

// Permission-based access control middleware
exports.requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    // Super admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.permissions?.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
        requiredPermission
      });
    }

    next();
  };
};

// Geographic access control middleware
exports.requireGeoAccess = (requiredLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    // Super admin has global access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check geographic access level
    const geoLevels = ['country', 'state', 'region', 'district', 'block', 'area'];
    const userGeoLevel = geoLevels.findIndex(level => req.user.geo[level] !== undefined);
    const requiredGeoLevel = geoLevels.indexOf(requiredLevel);

    if (userGeoLevel > requiredGeoLevel) {
      return res.status(403).json({
        success: false,
        message: "Insufficient geographic access",
        requiredAccess: requiredLevel,
        yourAccess: geoLevels[userGeoLevel] || 'none'
      });
    }

    next();
  };
};

// Admin hierarchy protection middleware
exports.requireHigherRole = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    const targetRole = req.body.role;
    if (!targetRole) {
      return res.status(400).json({ 
        success: false,
        message: "Target role not specified" 
      });
    }

    // Super admin can modify anyone
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if current user's role is higher in hierarchy than target role
    const roleHierarchy = [
      'admin',
      'country-admin',
      'state-admin',
      'regional-admin',
      'district-admin',
      'block-admin',
      'area-admin'
    ];
    
    const currentRoleIndex = roleHierarchy.indexOf(req.user.role);
    const targetRoleIndex = roleHierarchy.indexOf(targetRole);

    if (currentRoleIndex >= targetRoleIndex) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify users with equal or higher role",
        yourRole: req.user.role,
        targetRole
      });
    }

    next();
  };
};