const express = require('express');
const {
  createDonation,
  getAllDonations,
  getSingleDonation,
  deleteDonation
} = require('../controllers/donationController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', createDonation); // Public
router.get('/', authenticate, requireRole('admin'), getAllDonations); // Admin
router.get('/:id', authenticate, requireRole('admin'), getSingleDonation); // Admin
router.delete('/:id', authenticate, requireRole('admin'), deleteDonation); // Admin

module.exports = router;
