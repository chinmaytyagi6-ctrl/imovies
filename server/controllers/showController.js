const Show = require('../models/Show');
const SeatLock = require('../models/SeatLock');
const Cinema = require('../models/Cinema');
const Movie = require('../models/Movie');

// @desc    Get shows with filters
// @route   GET /api/shows
// @access  Public
exports.getShows = async (req, res, next) => {
  try {
    const { movieId, cinemaId, date } = req.query;
    const filter = {};

    if (movieId) filter.movieId = movieId;
    if (cinemaId) filter.cinemaId = cinemaId;
    if (date) {
      filter.showDate = date;
    } else {
      const today = new Date().toISOString().split('T')[0];
      filter.showDate = { $gte: today };
    }

    const shows = await Show.find(filter)
      .populate('movieId', 'title poster duration rating language genre')
      .populate('cinemaId', 'name location address')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single show details and real-time seat status
// @route   GET /api/shows/:id/seats
// @access  Public
exports.getShowSeats = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId', 'title poster rating duration language genre')
      .populate('cinemaId', 'name location address');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Clean up expired locks first
    await SeatLock.deleteMany({
      showId: show._id,
      expiresAt: { $lt: new Date() },
    });

    // Find currently active locked seats
    const activeLocks = await SeatLock.find({
      showId: show._id,
      expiresAt: { $gte: new Date() },
    });

    const currentUserId = req.user ? req.user.id.toString() : null;

    // Locked seats categorized by whether locked by current user or someone else
    const lockedByOthers = [];
    const lockedByMe = [];

    activeLocks.forEach((lock) => {
      if (currentUserId && lock.userId.toString() === currentUserId) {
        lockedByMe.push(lock.seatNumber);
      } else {
        lockedByOthers.push(lock.seatNumber);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        showId: show._id,
        movie: show.movieId,
        cinema: show.cinemaId,
        screenName: show.screenName,
        showDate: show.showDate,
        showTime: show.showTime,
        ticketPrice: show.ticketPrice,
        rows: show.rows || 8,
        cols: show.cols || 8,
        totalSeats: show.totalSeats || 64,
        bookedSeats: show.bookedSeats || [],
        lockedSeats: lockedByOthers,
        myLockedSeats: lockedByMe,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Lock seats temporarily before booking
// @route   POST /api/shows/lock-seats
// @access  Private
exports.lockSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;

    if (!showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showId and an array of seatNumbers to lock',
      });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Check if any seat is already booked
    const alreadyBooked = seatNumbers.filter((seat) =>
      show.bookedSeats.includes(seat)
    );
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats [${alreadyBooked.join(', ')}] are already booked. Please choose other seats.`,
      });
    }

    // Clean up expired locks first
    await SeatLock.deleteMany({
      showId,
      expiresAt: { $lt: new Date() },
    });

    // Check if any seat is locked by another user
    const existingOtherLocks = await SeatLock.find({
      showId,
      seatNumber: { $in: seatNumbers },
      userId: { $ne: req.user.id },
      expiresAt: { $gte: new Date() },
    });

    if (existingOtherLocks.length > 0) {
      const conflictSeats = existingOtherLocks.map((l) => l.seatNumber);
      return res.status(409).json({
        success: false,
        message: `Seats [${conflictSeats.join(', ')}] are currently selected by another customer. Please choose different seats.`,
      });
    }

    // Remove old locks from this user for this show
    await SeatLock.deleteMany({
      showId,
      userId: req.user.id,
    });

    // Lock seats for 5 minutes (300 seconds)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const lockDocs = seatNumbers.map((seat) => ({
      showId,
      seatNumber: seat,
      userId: req.user.id,
      expiresAt,
    }));

    await SeatLock.insertMany(lockDocs);

    res.status(200).json({
      success: true,
      message: 'Seats locked successfully for 5 minutes',
      data: {
        lockedSeats: seatNumbers,
        expiresAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unlock seats
// @route   POST /api/shows/unlock-seats
// @access  Private
exports.unlockSeats = async (req, res, next) => {
  try {
    const { showId } = req.body;
    await SeatLock.deleteMany({
      showId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Seats unlocked',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create show
// @route   POST /api/shows
// @access  Private (Admin)
exports.createShow = async (req, res, next) => {
  try {
    const {
      movieId,
      cinemaId,
      screenNumber,
      screenName,
      showDate,
      showTime,
      ticketPrice,
      rows,
      cols,
    } = req.body;

    const rowCount = rows || 8;
    const colCount = cols || 8;
    const totalSeats = rowCount * colCount;

    const show = await Show.create({
      movieId,
      cinemaId,
      screenNumber: screenNumber || 1,
      screenName: screenName || 'Screen 1 (Dolby Surround)',
      showDate,
      showTime,
      ticketPrice: Number(ticketPrice) || 250,
      rows: rowCount,
      cols: colCount,
      totalSeats,
      bookedSeats: [],
    });

    const populatedShow = await Show.findById(show._id)
      .populate('movieId', 'title poster')
      .populate('cinemaId', 'name location');

    res.status(201).json({
      success: true,
      message: 'Show created successfully',
      data: populatedShow,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private (Admin)
exports.deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    await Show.findByIdAndDelete(req.params.id);
    await SeatLock.deleteMany({ showId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
