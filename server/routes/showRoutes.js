const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowSeats,
  lockSeats,
  unlockSeats,
  createShow,
  deleteShow,
} = require('../controllers/showController');
const { protect, authorize } = require('../middleware/auth');

// Optional auth middleware for getShowSeats to know which seats the current user locked
const optionalAuth = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return protect(req, res, next);
  }
  next();
};

router.route('/')
  .get(getShows)
  .post(protect, authorize('admin'), createShow);

router.route('/:id/seats')
  .get(optionalAuth, getShowSeats);

router.post('/lock-seats', protect, lockSeats);
router.post('/unlock-seats', protect, unlockSeats);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteShow);

module.exports = router;
