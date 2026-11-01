const mongoose = require("mongoose");

const pricingSettingsSchema = new mongoose.Schema(
  {
    sizes: {
      3: {
        multiplier: {
          type: Number,
          required: true,
          min: 0,
          default: 1.70,
        },

        consumablesCost: {
          type: Number,
          required: true,
          min: 0,
          default: 0.50,
        },
      },

      5: {
        multiplier: {
          type: Number,
          required: true,
          min: 0,
          default: 1.60,
        },

        consumablesCost: {
          type: Number,
          required: true,
          min: 0,
          default: 0.50,
        },
      },

      10: {
        multiplier: {
          type: Number,
          required: true,
          min: 0,
          default: 1.45,
        },

        consumablesCost: {
          type: Number,
          required: true,
          min: 0,
          default: 0.80,
        },
      },

      20: {
        multiplier: {
          type: Number,
          required: true,
          min: 0,
          default: 1.35,
        },

        consumablesCost: {
          type: Number,
          required: true,
          min: 0,
          default: 1.30,
        },
      },
    },

    roundingStep: {
      type: Number,
      required: true,
      min: 0.01,
      default: 0.05,
    },

    currency: {
      type: String,
      default: "EUR",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PricingSettings",
  pricingSettingsSchema
);