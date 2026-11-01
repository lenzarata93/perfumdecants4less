const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    /*
     * Клиентът, написал отзива.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Поръчката, от която идва отзивът.
     *
     * Използва се, за да проверим дали клиентът
     * действително е закупил продукта.
     */
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    /*
     * Продуктът, за който е отзивът.
     */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    /*
     * Оценка от 1 до 5 звезди.
     */
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    /*
     * Коментар на клиента.
     */
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    /*
     * Позволява на админа по-късно да скрива
     * неподходящи отзиви.
     */
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Един клиент може да остави само един отзив
 * за даден продукт от дадена поръчка.
 *
 * Например:
 *
 * User A + Order 123 + Naxos = един Review
 *
 * Не може да изпрати втори същия отзив.
 */
reviewSchema.index(
  {
    userId: 1,
    orderId: 1,
    productId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Review",
  reviewSchema
);