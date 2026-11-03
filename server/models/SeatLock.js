const mongoose = require('mongoose');

const SeatLockSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index: automatically deletes document when expiresAt is reached!
    },
  },
  {
    timestamps: true,
  }
);

// Prevent same seat locked twice for the same show
SeatLockSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('SeatLock', SeatLockSchema);
