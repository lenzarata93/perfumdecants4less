
const mongoose = require("mongoose");

const raffleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    targetPoints: {
      type: Number,
      required: true,
      min: 1,
    },

    collectedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    winnerEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RaffleEntry",
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Raffle",
  raffleSchema
);
