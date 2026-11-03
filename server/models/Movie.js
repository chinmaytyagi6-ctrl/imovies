const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a movie title'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description/storyline'],
    },
    genre: {
      type: [String],
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please specify duration in minutes'],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    poster: {
      type: String,
      required: [true, 'Please add a poster image URL'],
    },
    backdrop: {
      type: String,
      required: [true, 'Please add a backdrop banner image URL'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0,
      index: true,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    cast: {
      type: [String],
      required: true,
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming', 'popular'],
      default: 'now_showing',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
MovieSchema.index({ title: 'text', description: 'text', director: 'text' });

module.exports = mongoose.model('Movie', MovieSchema);
