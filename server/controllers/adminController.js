const User = require('../models/User');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const Cinema = require('../models/Cinema');
const Show = require('../models/Show');

// @desc    Get admin dashboard metrics & analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalCinemas = await Cinema.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate revenue from confirmed bookings
    const confirmedBookings = await Booking.find({ bookingStatus: 'confirmed' });
    const totalRevenue = confirmedBookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0
    );

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('movieId', 'title poster')
      .populate('cinemaId', 'name location')
      .sort({ createdAt: -1 })
      .limit(8);

    // Bookings summary by status
    const confirmedCount = confirmedBookings.length;
    const cancelledCount = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMovies,
        totalCinemas,
        totalShows,
        totalBookings,
        totalRevenue,
        confirmedCount,
        cancelledCount,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change user role (e.g. promote to admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings across system
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.bookingStatus = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('movieId', 'title poster')
      .populate('cinemaId', 'name location')
      .populate('showId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};
