const express = require('express');
const { createContact, getAllContacts, getSingleContact, deleteContact } = require('../controllers/contactController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', createContact); // Anyone can send a message
router.get('/', authenticate, requireRole('admin'), getAllContacts); // Admin only
router.get('/:id', authenticate, requireRole('admin'), getSingleContact); // Admin only
router.delete('/:id', authenticate, requireRole('admin'), deleteContact); // Admin only

module.exports = router;
