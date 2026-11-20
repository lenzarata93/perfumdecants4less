
const mongoose = require("mongoose");

const fundTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "order_profit",
        "bottle_purchase",
        "consumables",
      ],
      required: true,
    },

    direction: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    sourceKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

fundTransactionSchema.index({
  date: -1,
});

module.exports = mongoose.model(
  "FundTransaction",
  fundTransactionSchema
);
