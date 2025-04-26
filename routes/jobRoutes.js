const express = require('express');
const router = express.Router();
const { 
    createJob, 
    getAllJobs, 
    getSingleJob, 
    updateJob, 
    deleteJob 
} = require('../controllers/jobController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// Public
router.get('/', getAllJobs);
router.get('/:id', getSingleJob);

// Admin/Organizer routes
router.post('/', authenticate, requireRole('admin', 'organizer'), createJob);
router.put('/:id', authenticate, requireRole('admin', 'organizer'), updateJob);
router.delete('/:id', authenticate, requireRole('admin'), deleteJob);

module.exports = router;