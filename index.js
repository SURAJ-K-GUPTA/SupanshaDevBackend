require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./db/db');
connectDB();

// API Routes
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const eventRoutes = require('./routes/eventRoutes');
const jobRoutes = require('./routes/jobRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000' || 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Supansha Backend API',
    version: '1.0.0',
    documentation: '/api-docs' // If you have API docs
  });
});



app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/job', jobRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});