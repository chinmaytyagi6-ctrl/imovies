const mongoose = require('mongoose');

const ScreenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    default: 'Screen 1',
  },
  totalSeats: {
    type: Number,
    default: 64, // e.g. 8 rows x 8 cols = 64
  },
  seatLayout: {
    rows: { type: Number, default: 8 },
    cols: { type: Number, default: 8 },
  },
});

const CinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add cinema name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add cinema location / city'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Please add cinema address'],
    },
    screens: [ScreenSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cinema', CinemaSchema);
