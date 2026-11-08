
const mongoose = require("mongoose");

const raffleEntrySchema = new mongoose.Schema(
  {
    raffle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Raffle",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    pointsSpent: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    entryNumber: {
      type: Number,
      required: true,
    },

    isWinner: {
      type: Boolean,
      default: false,
    },

    participatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Един запис представлява едно участие.
// Няма ограничение за броя участия на един потребител.

raffleEntrySchema.index({
  raffle: 1,
  entryNumber: 1,
});

raffleEntrySchema.index({
  raffle: 1,
  user: 1,
});

module.exports = mongoose.model(
  "RaffleEntry",
  raffleEntrySchema
);
