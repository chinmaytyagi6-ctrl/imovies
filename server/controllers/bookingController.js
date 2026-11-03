const Booking = require('../models/Booking');
const Show = require('../models/Show');
const SeatLock = require('../models/SeatLock');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { showId, selectedSeats, paymentMethod } = req.body;

    if (!showId || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showId and selectedSeats array',
      });
    }

    const show = await Show.findById(showId)
      .populate('movieId')
      .populate('cinemaId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Atomic seat check & booking:
    // Update show ONLY IF none of the selected seats are already in bookedSeats
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: selectedSeats },
      },
      {
        $push: { bookedSeats: { $each: selectedSeats } },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        success: false,
        message: 'One or more of the selected seats were already booked by another user. Please choose alternative seats.',
      });
    }

    // Calculate total amount
    const ticketPrice = show.ticketPrice;
    const totalAmount = ticketPrice * selectedSeats.length;

    // Generate unique human-readable booking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `IMV-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // Payload for digital QR Code
    const qrCodeData = JSON.stringify({
      bookingId,
      movie: show.movieId.title,
      cinema: show.cinemaId.name,
      date: show.showDate,
      time: show.showTime,
      seats: selectedSeats,
      tickets: selectedSeats.length,
      amount: totalAmount,
    });

    const booking = await Booking.create({
      bookingId,
      userId: req.user.id,
      movieId: show.movieId._id,
      cinemaId: show.cinemaId._id,
      showId: show._id,
      selectedSeats,
      ticketPrice,
      totalAmount,
      paymentStatus: 'completed',
      paymentMethod: paymentMethod || 'IMovies Pay (Sandbox)',
      bookingStatus: 'confirmed',
      qrCodeData,
    });

    // Clear seat locks for this user
    await SeatLock.deleteMany({
      showId,
      userId: req.user.id,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('showId');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: populatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('movieId')
      .populate('cinemaId')
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

// @desc    Get single booking by ID or bookingId string
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const query = req.params.id.startsWith('IMV-')
      ? { bookingId: req.params.id }
      : { _id: req.params.id };

    const booking = await Booking.findOne(query)
      .populate('movieId')
      .populate('cinemaId')
      .populate('showId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure only the owner or an admin can access this booking
    if (
      booking.userId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
    }

    // Release seats on the show
    await Show.findByIdAndUpdate(booking.showId, {
      $pull: { bookedSeats: { $in: booking.selectedSeats } },
    });

    booking.bookingStatus = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully and seats released.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
