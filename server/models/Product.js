const mongoose = require("mongoose");

const bottleSchema = new mongoose.Schema(
  {
    initialMl: {
      type: Number,
      required: true,
      min: 0,
    },

    remainingMl: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePricePerMl: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    // Текущите продажни цени.
    // По-късно ще ги изчисляваме автоматично
    // според първата неизчерпана бутилка.
    pricePerMl: {
      type: Number,
      default: 0,
      min: 0,
    },

    price5ml: {
      type: Number,
      default: 0,
      min: 0,
    },

    price10ml: {
      type: Number,
      default: 0,
      min: 0,
    },

    price20ml: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableMl: {
      type: Number,
      default: 0,
      min: 0,
    },

    timesPurchased: {
      type: Number,
      default: 0,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    comments: {
      type: String,
      default: "",
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    // Всички закупени бутилки/партиди.
    //
    // ВАЖНО:
    // Не променяме purchasePrice и purchasePricePerMl
    // на стара бутилка.
    //
    // remainingMl се променя при продажба.
    bottles: {
      type: [bottleSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);