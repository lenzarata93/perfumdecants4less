const mongoose = require("mongoose");

const inventoryUsageSchema = new mongoose.Schema(
  {
    bottleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    ml: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePricePerMl: {
      type: Number,
      required: true,
      min: 0,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

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

    size: {
      type: Number,
      required: true,
      enum: [5, 10, 20],
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    /*
     * Бутилката, която е определила продажната цена.
     *
     * Например:
     * Bottle 1 = 0.725 €/ml
     *
     * Дори ако част от поръчката физически
     * е взета от Bottle 2, продажната цена
     * остава тази на Bottle 1.
     */
    pricingBottleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    pricingPurchasePricePerMl: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Реално използваните количества от всяка бутилка.
     *
     * Пример:
     *
     * 80 ml × 0.725 € = 58 €
     * 40 ml × 1.30 € = 52 €
     */
    inventoryUsage: {
      type: [inventoryUsageSchema],
      default: [],
    },

    /*
     * Общата реална себестойност на тази позиция.
     */
    costTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },

    delivery: {
      method: {
        type: String,
        required: true,
        enum: ["econt", "speedy"],
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    payment: {
      method: {
        type: String,
        enum: ["cash_on_delivery"],
        default: "cash_on_delivery",
      },

      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },

    items: {
      type: [orderItemSchema],

      required: true,

      validate: {
        validator: (items) => items.length > 0,

        message:
          "Поръчката трябва да съдържа поне един продукт.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Обща себестойност на всички продукти
     * в поръчката.
     */
    totalCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    /*
     * Брутна печалба преди други разходи.
     *
     * subtotal - totalCost
     */
    grossProfit: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],

      default: "pending",
    },

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

module.exports = mongoose.model(
  "Order",
  orderSchema
);