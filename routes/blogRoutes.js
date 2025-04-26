const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// Public
router.get('/', getAllBlogs);
router.get('/:slug', getSingleBlog);

// Admin/Contributor routes
router.post('/', authenticate, requireRole('admin', 'user'), createBlog);
router.put('/:id', authenticate, requireRole('admin', 'user'), updateBlog);
router.delete('/:id', authenticate, requireRole('admin'), deleteBlog);

module.exports = router;
