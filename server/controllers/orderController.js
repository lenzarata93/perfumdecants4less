const Order = require("../models/Order");
const Product = require("../models/Product");
const Counter = require("../models/Counter");
const mongoose = require("mongoose");
const User = require("../models/User");
const BonusTransaction = require("../models/BonusTransaction");

const {
  calculatePricesFromBottle,
  getActiveBottle,
} = require("../utils/pricingEngine");

/**
 * Генерира следващ номер на поръчката.
 */
const generateOrderNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orders" },
    { $inc: { sequenceValue: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `ORD-${String(counter.sequenceValue).padStart(6, "0")}`;
};

/**
 * FIFO приспадане от бутилките.
 *
 * Връща информация за реално използваните бутилки,
 * без да променя още Product.
 */
const calculateInventoryUsage = (bottles, requestedMl) => {
  let remainingToDeduct = requestedMl;

  const inventoryUsage = [];

  for (const bottle of bottles) {
    const bottleRemaining = Number(
      bottle.remainingMl || 0
    );

    if (bottleRemaining <= 0) {
      continue;
    }

    if (remainingToDeduct <= 0) {
      break;
    }

    const usedMl = Math.min(
      bottleRemaining,
      remainingToDeduct
    );

    const purchasePricePerMl = Number(
      bottle.purchasePricePerMl
    );

    const cost = Number(
      (usedMl * purchasePricePerMl).toFixed(2)
    );

    inventoryUsage.push({
      bottleId: bottle._id,
      ml: usedMl,
      purchasePricePerMl,
      cost,
    });

    remainingToDeduct -= usedMl;
  }

  if (remainingToDeduct > 0) {
    throw new Error(
      "Недостатъчна наличност при FIFO приспадане."
    );
  }

  return inventoryUsage;
};

/**
 * Прилага FIFO приспадането върху Product.
 */
const deductInventory = (product, requestedMl) => {
  let remainingToDeduct = requestedMl;

  for (const bottle of product.bottles) {
    const bottleRemaining = Number(
      bottle.remainingMl || 0
    );

    if (bottleRemaining <= 0) {
      continue;
    }

    if (remainingToDeduct <= 0) {
      break;
    }

    const deduction = Math.min(
      bottleRemaining,
      remainingToDeduct
    );

    bottle.remainingMl =
      bottleRemaining - deduction;

    remainingToDeduct -= deduction;
  }

  if (remainingToDeduct > 0) {
    throw new Error(
      "Грешка при приспадане на наличността."
    );
  }

  product.availableMl = product.bottles.reduce(
    (sum, bottle) =>
      sum + Number(bottle.remainingMl || 0),
    0
  );

  if (product.availableMl < 0.000001) {
    product.availableMl = 0;
  }
};

/**
 * Обработва един продукт от поръчката.
 *
 * ВАЖНО:
 *
 * 1. Активната бутилка в началото определя
 *    продажната цена.
 *
 * 2. FIFO определя от кои бутилки физически
 *    се взима парфюмът.
 *
 * 3. Реалната себестойност се записва
 *    за всяка използвана бутилка.
 */
const processOrderItem = async (item) => {
  const product = await Product.findById(
    item.productId
  );

  if (!product) {
    throw new Error(
      `Продуктът "${item.name || item.productId}" не е намерен.`
    );
  }

  const size = Number(item.size);
  const quantity = Number(item.quantity);

  if (![3, 5, 10, 20].includes(size)) {
    throw new Error(
      `Невалиден размер за "${product.name}".`
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      `Невалидно количество за "${product.name}".`
    );
  }

  const requestedMl = size * quantity;

  if (
    Number(product.availableMl || 0) <
    requestedMl
  ) {
    throw new Error(
      `Недостатъчна наличност за "${product.name}". Налични: ${product.availableMl} ml, заявени: ${requestedMl} ml.`
    );
  }

  /*
   * Активната бутилка в началото определя
   * продажната цена.
   */
  const activeBottle = getActiveBottle(
    product.bottles
  );

  if (!activeBottle) {
    throw new Error(
      `Няма активна бутилка за "${product.name}".`
    );
  }

  const prices = await calculatePricesFromBottle(
    activeBottle
  );

  let unitPrice;

  if (size === 3) {
    unitPrice = prices.price3ml;
  }

  if (size === 5) {
    unitPrice = prices.price5ml;
  }

  if (size === 10) {
    unitPrice = prices.price10ml;
  }

  if (size === 20) {
    unitPrice = prices.price20ml;
  }

  /*
   * Изчисляваме FIFO употребата ПРЕДИ
   * да променяме наличността.
   */
  const inventoryUsage =
    calculateInventoryUsage(
      product.bottles,
      requestedMl
    );

  /*
   * Реална себестойност на позицията.
   */
  const costTotal = Number(
    inventoryUsage
      .reduce(
        (sum, usage) => sum + usage.cost,
        0
      )
      .toFixed(2)
  );

  /*
   * Продажна стойност.
   */
  const total = Number(
    (unitPrice * quantity).toFixed(2)
  );

  /*
   * Реално приспадане от Product.
   */
  deductInventory(
    product,
    requestedMl
  );

  /*
   * Брой продадени отливки.
   */
  product.timesPurchased =
    Number(product.timesPurchased || 0) +
    quantity;

  await product.save();

  return {
    product,

    item: {
      productId: product._id,
      name: product.name,
      brand: product.brand,
      size,
      quantity,
      price: unitPrice,
      total,
      image: product.image,

      /*
       * Бутилката, която е определила
       * продажната цена.
       */
      pricingBottleId: activeBottle._id,

      pricingPurchasePricePerMl:
        prices.pricePerMl,

      /*
       * Реалните бутилки, използвани
       * за тази продажба.
       */
      inventoryUsage,

      /*
       * Обща себестойност.
       */
      costTotal,
    },
  };
};

/**
 * Създава поръчка.
 */
const createOrder = async (req, res) => {
  try {
    const {
      customer,
      delivery,
      payment,
      items,
      notes,
    } = req.body;

    /*
     * Ако потребителят е логнат,
     * optionalAuthMiddleware е поставил
     * неговия JWT payload в req.user.
     *
     * Ако е гост → userId = null.
     */
    const userId = req.user?.userId || null;

    /*
     * -------------------------
     * ВАЛИДАЦИЯ
     * -------------------------
     */

    if (
      !customer ||
      !customer.firstName ||
      !customer.lastName ||
      !customer.phone ||
      !customer.email
    ) {
      return res.status(400).json({
        message:
          "Моля, попълнете данните на клиента.",
      });
    }

    if (
      !delivery ||
      !delivery.method ||
      !delivery.city ||
      !delivery.postalCode ||
      !delivery.address
    ) {
      return res.status(400).json({
        message:
          "Моля, попълнете данните за доставка.",
      });
    }

    if (
      !["econt", "speedy"].includes(
        delivery.method
      )
    ) {
      return res.status(400).json({
        message:
          "Невалиден метод за доставка.",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Поръчката трябва да съдържа поне един продукт.",
      });
    }

    /*
     * -------------------------
     * ПРЕДВАРИТЕЛНА ПРОВЕРКА
     * -------------------------
     *
     * Проверяваме всички продукти,
     * преди да започнем да променяме
     * наличностите.
     */

    for (const item of items) {
      const product = await Product.findById(
        item.productId
      );

      if (!product) {
        return res.status(404).json({
          message:
            `Продуктът "${item.name || item.productId}" не е намерен.`,
        });
      }

      const size = Number(item.size);
      const quantity = Number(item.quantity);

      if (![3, 5, 10, 20].includes(size)) {
        return res.status(400).json({
          message:
            `Невалиден размер за "${product.name}".`,
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message:
            `Невалидно количество за "${product.name}".`,
        });
      }

      const requestedMl =
        size * quantity;

      if (
        Number(product.availableMl || 0) <
        requestedMl
      ) {
        return res.status(400).json({
          message:
            `Недостатъчна наличност за "${product.name}". Налични: ${product.availableMl} ml, заявени: ${requestedMl} ml.`,
        });
      }

      if (
        !getActiveBottle(
          product.bottles
        )
      ) {
        return res.status(400).json({
          message:
            `Няма активна бутилка за "${product.name}".`,
        });
      }
    }

    /*
     * -------------------------
     * ОБРАБОТКА НА ПРОДУКТИТЕ
     * -------------------------
     */

    const processedItems = [];

    for (const item of items) {
      const processed =
        await processOrderItem(item);

      processedItems.push(
        processed.item
      );
    }

    /*
     * -------------------------
     * ФИНАНСОВИ СУМИ
     * -------------------------
     */

    const subtotal = Number(
      processedItems
        .reduce(
          (sum, item) =>
            sum + item.total,
          0
        )
        .toFixed(2)
    );

    const totalCost = Number(
      processedItems
        .reduce(
          (sum, item) =>
            sum + item.costTotal,
          0
        )
        .toFixed(2)
    );

    const grossProfit = Number(
      (subtotal - totalCost).toFixed(2)
    );

    /*
     * -------------------------
     * ДОСТАВКА
     * -------------------------
     */

    let deliveryPrice = 0;

    if (delivery.method === "econt") {
      deliveryPrice = 4;
    }

    if (delivery.method === "speedy") {
      deliveryPrice = 3;
    }

    const total = Number(
      (subtotal + deliveryPrice).toFixed(2)
    );

    /*
     * -------------------------
     * НОМЕР НА ПОРЪЧКА
     * -------------------------
     */

    const orderNumber =
      await generateOrderNumber();

    /*
     * -------------------------
     * СЪЗДАВАНЕ НА ORDER
     * -------------------------
     */

    const order = await Order.create({
      orderNumber,

      /*
       * Връзка с потребителя.
       *
       * Логнат потребител → неговият userId.
       * Гост → null.
       */
      userId,

      customer: {
        firstName:
          customer.firstName,
        lastName:
          customer.lastName,
        phone:
          customer.phone,
        email:
          customer.email,
      },

      delivery: {
        method:
          delivery.method,
        price:
          deliveryPrice,
        city:
          delivery.city,
        postalCode:
          delivery.postalCode,
        address:
          delivery.address,
      },

      payment: {
        method:
          payment?.method ||
          "cash_on_delivery",

        status:
          payment?.status ||
          "pending",
      },

      items: processedItems,

      subtotal,

      deliveryPrice,

      total,

      totalCost,

      grossProfit,

      status: "pending",

      notes: notes || "",
    });

    /*
     * -------------------------
     * RESPONSE
     * -------------------------
     */

    res.status(201).json({
      message:
        "Поръчката е създадена успешно.",

      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Грешка при създаване на поръчката.",

      error: error.message,
    });
  }
};

/**
 * Връща всички поръчки.
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      message:
        "Грешка при зареждане на поръчките.",

      error: error.message,
    });
  }
};

/**
 * Връща поръчките на текущия потребител.
 */
const getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Моля, влезте в профила си.",
      });
    }

    const orders = await Order.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    res.status(500).json({
      message: "Грешка при зареждане на вашите поръчки.",
      error: error.message,
    });
  }
};

/**
 * Променя статуса на поръчка и начислява бонус точки.
 */
const updateOrderStatus = async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();

    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Невалиден статус на поръчката.",
      });
    }

    let updatedOrder = null;
    let awardedPoints = 0;

    await session.withTransaction(async () => {
      const order = await Order.findById(
        req.params.id
      ).session(session);

      if (!order) {
        const error = new Error(
          "Поръчката не е намерена."
        );
        error.statusCode = 404;
        throw error;
      }

      // Завършена или отказана поръчка не може
      // повече да променя статуса си.
      if (
        order.status === "completed" ||
        order.status === "cancelled"
      ) {
        const error = new Error(
          "Тази поръчка е с финален статус и повече не може да бъде променяна."
        );
        error.statusCode = 400;
        throw error;
      }

      order.status = status;

      /*
       * Бонус точки се начисляват само:
       * - при статус completed;
       * - на регистриран потребител;
       * - ако точките не са начислявани вече.
       */
      if (
        status === "completed" &&
        order.userId &&
        !order.pointsAwarded
      ) {
        /*
         * 1 точка за всеки 10 € от subtotal.
         * Доставката не участва.
         *
         * Използваме отрязване до втория знак,
         * а не стандартно закръгляне.
         *
         * 19.99 € = 1.99 точки.
         */
        const points =
          Math.floor(
            (Number(order.subtotal) / 10) * 100
          ) / 100;

        if (points > 0) {
          const user = await User.findById(
            order.userId
          ).session(session);

          if (!user) {
            throw new Error(
              "Потребителят на поръчката не е намерен."
            );
          }

          const newBalance = Number(
            (
              Number(user.bonusPoints || 0) +
              points
            ).toFixed(2)
          );

          user.bonusPoints = newBalance;

          await user.save({ session });

          await BonusTransaction.create(
            [
              {
                userId: user._id,
                type: "earned",
                points,
                balanceAfter: newBalance,
                description:
                  `Бонус точки от поръчка ${order.orderNumber}`,
                orderId: order._id,
              },
            ],
            { session }
          );

          order.pointsEarned = points;
          order.pointsAwarded = true;
          order.pointsAwardedAt = new Date();

          awardedPoints = points;
        }
      }

      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      message:
        awardedPoints > 0
          ? `Статусът е променен. Начислени са ${awardedPoints.toFixed(2)} бонус точки.`
          : "Статусът на поръчката е променен.",
      order: updatedOrder,
      awardedPoints,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Грешка при промяна на статуса.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


/**
 * Връща 8-те най-продавани продукта.
 *
 * Класацията включва само завършени поръчки.
 * Броим продадените отливки, а не милилитрите.
 */
const getBestSellingProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          soldQuantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $sort: { soldQuantity: -1, revenue: -1 } },
      {
        $lookup: {
          from: Product.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.active": true } },
      { $sort: { soldQuantity: -1, revenue: -1 } },
      { $limit: 10 },
    ]);

    const productsWithPrices = await Promise.all(
      products.map(async (item) => {
        const product = item.product;

        const activeBottle = getActiveBottle(
          product.bottles
        );

        let prices = {
          pricePerMl: 0,
          price3ml: 0,
          price5ml: 0,
          price10ml: 0,
          price20ml: 0,
        };

        if (activeBottle) {
          prices = await calculatePricesFromBottle(
            activeBottle
          );
        }

        return {
          _id: product._id,
          name: product.name,
          brand: product.brand,
          description: product.description,
          gender: product.gender,
          category: product.category,
          image: product.image,

          pricePerMl: prices.pricePerMl,
          price3ml: prices.price3ml,
          price5ml: prices.price5ml,
          price10ml: prices.price10ml,
          price20ml: prices.price20ml,

          availableMl: product.availableMl,
          active: product.active,

          soldQuantity: item.soldQuantity,
          revenue: item.revenue,
        };
      })
    );

    return res.status(200).json(productsWithPrices);
  } catch (error) {
    console.error("Get best-selling products error:", error);

    return res.status(500).json({
      message: "Грешка при зареждане на най-продаваните продукти.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus,
  getBestSellingProducts,
};