const mongoose = require("mongoose");

const bonusTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["earned", "spent", "adjustment"],
      required: true,
    },

    points: {
      type: Number,
      required: true,
      min: 0.01,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Една поръчка може да носи точки само веднъж.
bonusTransactionSchema.index(
  { orderId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      orderId: { $type: "objectId" },
      type: "earned",
    },
  }
);

module.exports = mongoose.model(
  "BonusTransaction",
  bonusTransactionSchema
);