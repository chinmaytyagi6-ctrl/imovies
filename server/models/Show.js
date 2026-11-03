const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true,
    },
    screenNumber: {
      type: Number,
      default: 1,
    },
    screenName: {
      type: String,
      default: 'Audi 1 (Dolby Atmos)',
    },
    showDate: {
      type: String, // format YYYY-MM-DD
      required: true,
      index: true,
    },
    showTime: {
      type: String, // e.g. "10:30 AM"
      required: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
      default: 250,
    },
    totalSeats: {
      type: Number,
      default: 64,
    },
    rows: {
      type: Number,
      default: 8, // A to H
    },
    cols: {
      type: Number,
      default: 8, // 1 to 8
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookup of shows for a movie/cinema on a specific date
ShowSchema.index({ movieId: 1, cinemaId: 1, showDate: 1 });

module.exports = mongoose.model('Show', ShowSchema);
