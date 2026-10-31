const mongoose = require("mongoose");

const bottleSchema = new mongoose.Schema(
  {
    // Количество, с което е закупена бутилката
    initialMl: {
      type: Number,
      required: true,
      min: 0,
    },

    // Оставащо количество от конкретната бутилка
    remainingMl: {
      type: Number,
      required: true,
      min: 0,
    },

    // Сума, платена за цялата бутилка
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Цена на 1 ml при покупката
    purchasePricePerMl: {
      type: Number,
      required: true,
      min: 0,
    },

    // Кога е закупена
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    // Основна информация
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

    // Снимка
    image: {
      type: String,
      default: "",
      trim: true,
    },

    // Продажни цени
    pricePerMl: {
      type: Number,
      required: true,
      min: 0,
    },

    price5ml: {
      type: Number,
      required: true,
      min: 0,
    },

    price10ml: {
      type: Number,
      required: true,
      min: 0,
    },

    price20ml: {
      type: Number,
      required: true,
      min: 0,
    },

    // Общо количество от всички активни бутилки
    availableMl: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Колко пъти е купуван продуктът
    timesPurchased: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Оценка и коментари
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

    // Дали продуктът се показва в магазина
    active: {
      type: Boolean,
      default: true,
    },

    // История на закупените бутилки
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