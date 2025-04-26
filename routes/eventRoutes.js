const express = require('express');
const router = express.Router();
const { 
    createEvent, 
    getAllEvents, 
    getEventById, 
    approveEvent, 
    updateEvent, 
    deleteEvent 
} = require('../controllers/eventController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// Public Routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin/Organizer Routes
router.post('/', authenticate, requireRole('admin', 'organizer'), createEvent);
router.patch('/:id/approve', authenticate, requireRole('admin'), approveEvent);
router.put('/:id', authenticate, requireRole('admin', 'organizer'), updateEvent);
router.delete('/:id', authenticate, requireRole('admin'), deleteEvent);

module.exports = router;
