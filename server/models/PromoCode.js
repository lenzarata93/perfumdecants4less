
const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    // Самият промокод.
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // Описание на промокода.
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // discount = обикновен промокод
    // partner = партньорски промокод
    type: {
      type: String,
      enum: ["discount", "partner"],
      required: true,
      default: "discount",
    },

    // Потребителят, който получава комисионна.
    // Попълва се само при партньорски код.
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // percent = процентна отстъпка
    // fixed = фиксирана отстъпка
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
      default: "percent",
    },

    // Размер на отстъпката.
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // Комисионна за партньора.
    // По подразбиране е 10%.
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    // Минимална стойност на продуктите.
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Максимален брой използвания.
    // null = без ограничение.
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    // Реален брой използвания.
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Начало на валидност.
    startDate: {
      type: Date,
      default: Date.now,
    },

    // Край на валидност.
    // null = без крайна дата.
    endDate: {
      type: Date,
      default: null,
    },

    // Активен или спрян код.
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Проверки преди запис.
promoCodeSchema.pre("validate", function (next) {
  if (
    this.discountType === "percent" &&
    this.discountValue > 100
  ) {
    return next(
      new Error(
        "Процентната отстъпка не може да бъде над 100%."
      )
    );
  }

  if (
    this.type === "partner" &&
    !this.partnerId
  ) {
    return next(
      new Error(
        "Партньорският код трябва да бъде свързан с потребител."
      )
    );
  }

  if (
    this.type === "discount" &&
    this.partnerId
  ) {
    return next(
      new Error(
        "Обикновеният промокод не трябва да има партньор."
      )
    );
  }

  if (
    this.endDate &&
    this.startDate &&
    this.endDate <= this.startDate
  ) {
    return next(
      new Error(
        "Крайната дата трябва да бъде след началната дата."
      )
    );
  }

  next();
});

module.exports = mongoose.model(
  "PromoCode",
  promoCodeSchema
);
