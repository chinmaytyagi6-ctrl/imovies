const Cinema = require('../models/Cinema');
const Show = require('../models/Show');

// @desc    Get all cinemas
// @route   GET /api/cinemas
// @access  Public
exports.getCinemas = async (req, res, next) => {
  try {
    const { location } = req.query;
    const filter = {};
    if (location && location !== 'All') {
      filter.location = { $regex: new RegExp(`^${location.trim()}$`, 'i') };
    }

    const cinemas = await Cinema.find(filter).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: cinemas.length,
      data: cinemas,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single cinema
// @route   GET /api/cinemas/:id
// @access  Public
exports.getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    res.status(200).json({ success: true, data: cinema });
  } catch (err) {
    next(err);
  }
};

// @desc    Create cinema
// @route   POST /api/cinemas
// @access  Private (Admin)
exports.createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Cinema created successfully',
      data: cinema,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cinema
// @route   PUT /api/cinemas/:id
// @access  Private (Admin)
exports.updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Cinema updated successfully',
      data: cinema,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete cinema
// @route   DELETE /api/cinemas/:id
// @access  Private (Admin)
exports.deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    await Cinema.findByIdAndDelete(req.params.id);
    await Show.deleteMany({ cinemaId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Cinema and associated shows deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
