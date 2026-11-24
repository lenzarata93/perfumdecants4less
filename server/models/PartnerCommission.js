
const mongoose = require("mongoose");

const partnerCommissionSchema = new mongoose.Schema(
  {
    // Партньорът, който получава комисионната.
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Поръчката, от която е генерирана.
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    // Използваният партньорски код.
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      required: true,
    },

    promoCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // Стойност на продуктите след отстъпката.
    orderAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Процент на комисионната.
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Начислена комисионна.
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Статус на комисионната.
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // Дата на начисляване.
    earnedAt: {
      type: Date,
      default: Date.now,
    },

    // Дата на изплащане.
    paidAt: {
      type: Date,
      default: null,
    },

    // Допълнителни бележки.
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

partnerCommissionSchema.index({
  partnerId: 1,
  status: 1,
  earnedAt: -1,
});

module.exports = mongoose.model(
  "PartnerCommission",
  partnerCommissionSchema
);
