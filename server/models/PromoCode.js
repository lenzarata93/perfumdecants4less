
const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["discount", "partner"],
      required: true,
      default: "discount",
    },

    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
      default: "percent",
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Валидация преди запис
promoCodeSchema.pre("validate", function () {
  if (
    this.discountType === "percent" &&
    this.discountValue > 100
  ) {
    throw new Error(
      "Процентната отстъпка не може да бъде над 100%."
    );
  }

  if (
    this.type === "partner" &&
    !this.partnerId
  ) {
    throw new Error(
      "Партньорският код трябва да бъде свързан с потребител."
    );
  }

  if (
    this.type === "discount" &&
    this.partnerId
  ) {
    throw new Error(
      "Обикновеният промокод не трябва да има партньор."
    );
  }

  if (
    this.type === "partner" &&
    (this.commissionRate < 0 ||
      this.commissionRate > 100)
  ) {
    throw new Error(
      "Комисионната трябва да бъде между 0 и 100%."
    );
  }

  if (
    this.endDate &&
    this.startDate &&
    this.endDate <= this.startDate
  ) {
    throw new Error(
      "Крайната дата трябва да бъде след началната дата."
    );
  }
});

module.exports = mongoose.model(
  "PromoCode",
  promoCodeSchema
);
