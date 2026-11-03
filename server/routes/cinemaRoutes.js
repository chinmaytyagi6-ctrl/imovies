const express = require('express');
const router = express.Router();
const {
  getCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
} = require('../controllers/cinemaController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getCinemas)
  .post(protect, authorize('admin'), createCinema);

router.route('/:id')
  .get(getCinemaById)
  .put(protect, authorize('admin'), updateCinema)
  .delete(protect, authorize('admin'), deleteCinema);

module.exports = router;
