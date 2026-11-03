const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAllBookings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require protect and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/bookings', getAllBookings);

module.exports = router;
