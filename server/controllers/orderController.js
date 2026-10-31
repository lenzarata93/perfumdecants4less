
const Order = require("../models/Order");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

const DELIVERY_PRICES = {
  econt: 4.0,
  speedy: 3.0,
};

const getNextOrderNumber = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "orders",
    {
      $inc: {
        sequenceValue: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return String(counter.sequenceValue).padStart(7, "0");
};

const createOrder = async (req, res) => {
  try {
    const {
      customer,
      delivery,
      payment,
      items,
      notes = "",
    } = req.body;

    // =========================
    // CUSTOMER VALIDATION
    // =========================

    if (!customer) {
      return res.status(400).json({
        message: "Липсват данни за клиента.",
      });
    }

    if (
      !customer.firstName ||
      !customer.lastName ||
      !customer.phone ||
      !customer.email
    ) {
      return res.status(400).json({
        message: "Моля, попълнете всички лични данни.",
      });
    }

    // =========================
    // DELIVERY VALIDATION
    // =========================

    if (!delivery) {
      return res.status(400).json({
        message: "Липсват данни за доставката.",
      });
    }

    if (
      !delivery.method ||
      !delivery.city ||
      !delivery.postalCode ||
      !delivery.address
    ) {
      return res.status(400).json({
        message: "Моля, попълнете всички данни за доставка.",
      });
    }

    if (!DELIVERY_PRICES[delivery.method]) {
      return res.status(400).json({
        message: "Невалиден метод за доставка.",
      });
    }

    // =========================
    // ITEMS VALIDATION
    // =========================

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Поръчката трябва да съдържа поне един продукт.",
      });
    }

    // В количката може да има един и същ продукт
    // в няколко различни размера.
    //
    // Пример:
    // Arabians Tonka 20ml
    // Arabians Tonka 10ml
    // Arabians Tonka 5ml
    //
    // Това е един Product документ, затова премахваме
    // дублиращите се productId преди заявката към MongoDB.

    const productIds = [
      ...new Set(
        items.map((item) => item.productId.toString())
      ),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
      active: true,
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "Един или повече продукти вече не са налични.",
      });
    }

    // =========================
    // BUILD ORDER ITEMS
    // =========================

    const orderItems = [];

    for (const item of items) {
      const product = products.find(
        (product) =>
          product._id.toString() === item.productId.toString()
      );

      if (!product) {
        return res.status(400).json({
          message: `Продуктът не е намерен: ${item.productId}`,
        });
      }

      const size = Number(item.size);
      const quantity = Number(item.quantity);

      // Разрешени размери
      if (![5, 10, 20].includes(size)) {
        return res.status(400).json({
          message: `Невалиден размер за ${product.name}.`,
        });
      }

      // Количеството трябва да е цяло число
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: `Невалидно количество за ${product.name}.`,
        });
      }

      // Избираме правилната цена според размера
      const priceMap = {
        5: product.price5ml,
        10: product.price10ml,
        20: product.price20ml,
      };

      const price = Number(priceMap[size]);

      if (!price || price <= 0) {
        return res.status(400).json({
          message: `${product.name} няма зададена цена за ${size} ml.`,
        });
      }

      const itemTotal = price * quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        brand: product.brand,
        size,
        quantity,
        price,
        total: Number(itemTotal.toFixed(2)),
        image: product.image || "",
      });
    }

    // =========================
    // TOTALS
    // =========================

    const subtotal = orderItems.reduce(
      (total, item) => total + item.total,
      0
    );

    const deliveryPrice = DELIVERY_PRICES[delivery.method];

    const total = subtotal + deliveryPrice;

    // =========================
    // ORDER NUMBER
    // =========================

    // 0000001
    // 0000002
    // 0000003
    // ...

    const orderNumber = await getNextOrderNumber();

    // =========================
    // CREATE ORDER
    // =========================

    const order = await Order.create({
      orderNumber,

      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
      },

      delivery: {
        method: delivery.method,
        price: deliveryPrice,
        city: delivery.city,
        postalCode: delivery.postalCode,
        address: delivery.address,
      },

      payment: {
        method: payment?.method || "cash_on_delivery",
        status: "pending",
      },

      items: orderItems,

      subtotal: Number(subtotal.toFixed(2)),
      deliveryPrice,
      total: Number(total.toFixed(2)),

      status: "pending",
      notes,
    });

    // =========================
    // RESPONSE
    // =========================

    res.status(201).json({
      message: "Поръчката е създадена успешно.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Грешка при създаване на поръчката.",
      error: error.message,
    });
  }
};

// =========================
// GET ORDERS
// =========================

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.productId", "name brand");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на поръчките.",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
};
