const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with search, filter, and sorting
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, sort } = req.query;

    const query = {};

    // Search by title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { director: { $regex: search.trim(), $options: 'i' } },
        { cast: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(`^${genre.trim()}$`, 'i')] };
    }

    // Filter by language
    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language.trim()}$`, 'i') };
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Sorting
    let sortOption = { releaseDate: -1 };
    if (sort === 'rating_desc') {
      sortOption = { rating: -1 };
    } else if (sort === 'rating_asc') {
      sortOption = { rating: 1 };
    } else if (sort === 'latest') {
      sortOption = { releaseDate: -1 };
    } else if (sort === 'title_asc') {
      sortOption = { title: 1 };
    }

    const movies = await Movie.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single movie with available cinemas and shows
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Find upcoming shows for this movie
    const today = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      movieId: movie._id,
      showDate: { $gte: today },
    })
      .populate('cinemaId', 'name location address')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        movie,
        shows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private (Admin)
exports.createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      poster,
      backdrop,
      rating,
      director,
      cast,
      trailerUrl,
      status,
    } = req.body;

    const movie = await Movie.create({
      title,
      description,
      genre: Array.isArray(genre) ? genre : genre.split(',').map((g) => g.trim()),
      language,
      duration: Number(duration),
      releaseDate,
      poster,
      backdrop,
      rating: Number(rating) || 8.0,
      director,
      cast: Array.isArray(cast) ? cast : cast.split(',').map((c) => c.trim()),
      trailerUrl: trailerUrl || '',
      status: status || 'now_showing',
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update movie details
// @route   PUT /api/movies/:id
// @access  Private (Admin)
exports.updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    if (req.body.genre && typeof req.body.genre === 'string') {
      req.body.genre = req.body.genre.split(',').map((g) => g.trim());
    }

    if (req.body.cast && typeof req.body.cast === 'string') {
      req.body.cast = req.body.cast.split(',').map((c) => c.trim());
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private (Admin)
exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    await Movie.findByIdAndDelete(req.params.id);
    // Delete associated shows as well
    await Show.deleteMany({ movieId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Movie and associated shows deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
