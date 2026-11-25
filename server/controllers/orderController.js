const Order = require("../models/Order");
const Product = require("../models/Product");
const Counter = require("../models/Counter");
const mongoose = require("mongoose");
const User = require("../models/User");
const BonusTransaction = require("../models/BonusTransaction");
const PromoCode = require("../models/PromoCode");
const PartnerCommission = require("../models/PartnerCommission");

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
 */
const calculateInventoryUsage = (bottles, requestedMl) => {
  let remainingToDeduct = requestedMl;
  const inventoryUsage = [];

  for (const bottle of bottles) {
    const bottleRemaining = Number(bottle.remainingMl || 0);

    if (bottleRemaining <= 0) continue;
    if (remainingToDeduct <= 0) break;

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
    const bottleRemaining = Number(bottle.remainingMl || 0);

    if (bottleRemaining <= 0) continue;
    if (remainingToDeduct <= 0) break;

    const deduction = Math.min(
      bottleRemaining,
      remainingToDeduct
    );

    bottle.remainingMl = bottleRemaining - deduction;
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
 */
const processOrderItem = async (item) => {
  const product = await Product.findById(item.productId);

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

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      `Невалидно количество за "${product.name}".`
    );
  }

  const requestedMl = size * quantity;

  if (Number(product.availableMl || 0) < requestedMl) {
    throw new Error(
      `Недостатъчна наличност за "${product.name}". Налични: ${product.availableMl} ml, заявени: ${requestedMl} ml.`
    );
  }

  const activeBottle = getActiveBottle(product.bottles);

  if (!activeBottle) {
    throw new Error(
      `Няма активна бутилка за "${product.name}".`
    );
  }

  const prices = await calculatePricesFromBottle(
    activeBottle
  );

  let unitPrice;

  if (size === 3) unitPrice = prices.price3ml;
  if (size === 5) unitPrice = prices.price5ml;
  if (size === 10) unitPrice = prices.price10ml;
  if (size === 20) unitPrice = prices.price20ml;

  const inventoryUsage = calculateInventoryUsage(
    product.bottles,
    requestedMl
  );

  const costTotal = Number(
    inventoryUsage
      .reduce((sum, usage) => sum + usage.cost, 0)
      .toFixed(2)
  );

  const total = Number(
    (unitPrice * quantity).toFixed(2)
  );

  deductInventory(product, requestedMl);

  product.timesPurchased =
    Number(product.timesPurchased || 0) + quantity;

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

      pricingBottleId: activeBottle._id,
      pricingPurchasePricePerMl: prices.pricePerMl,

      inventoryUsage,
      costTotal,
    },
  };
};

/**
 * Проверява промокод.
 */
const validatePromoCode = async (code, subtotal) => {
  if (!code) {
    return {
      promo: null,
      discountAmount: 0,
      discountedSubtotal: subtotal,
      commissionRate: 0,
      commissionAmount: 0,
    };
  }

  const promo = await PromoCode.findOne({
    code: String(code).trim().toUpperCase(),
    active: true,
  });

  if (!promo) {
    throw new Error(
      "Промокодът не съществува или е неактивен."
    );
  }

  const now = new Date();

  if (promo.startDate && now < new Date(promo.startDate)) {
    throw new Error(
      "Промокодът все още не е валиден."
    );
  }

  if (promo.endDate && now > new Date(promo.endDate)) {
    throw new Error("Срокът на промокода е изтекъл.");
  }

  if (
    promo.usageLimit !== null &&
    promo.usageLimit !== undefined &&
    promo.usageCount >= promo.usageLimit
  ) {
    throw new Error(
      "Промокодът е достигнал лимита си на използване."
    );
  }

  if (promo.type === "partner") {
    const partner = await User.findOne({
      _id: promo.partnerId,
      isPartner: true,
      partnerActive: true,
      active: true,
    });

    if (!partner) {
      throw new Error(
        "Партньорският код вече не е активен."
      );
    }
  }

  let discountAmount = 0;

  if (promo.discountType === "percent") {
    discountAmount =
      (subtotal * Number(promo.discountValue)) / 100;
  } else {
    discountAmount = Number(promo.discountValue);
  }

  discountAmount = Number(
    Math.min(
      Math.max(discountAmount, 0),
      subtotal
    ).toFixed(2)
  );

  const discountedSubtotal = Number(
    (subtotal - discountAmount).toFixed(2)
  );

  const commissionRate =
    promo.type === "partner"
      ? Number(promo.commissionRate || 10)
      : 0;

  const commissionAmount =
    promo.type === "partner"
      ? Number(
          (
            (discountedSubtotal * commissionRate) /
            100
          ).toFixed(2)
        )
      : 0;

  return {
    promo,
    discountAmount,
    discountedSubtotal,
    commissionRate,
    commissionAmount,
  };
};

/**
 * Изчислява реалната стойност на количката.
 * Не променя наличностите.
 */
const calculateCartSubtotal = async (items) => {
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);

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

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(
        `Невалидно количество за "${product.name}".`
      );
    }

    const requestedMl = size * quantity;

    if (Number(product.availableMl || 0) < requestedMl) {
      throw new Error(
        `Недостатъчна наличност за "${product.name}".`
      );
    }

    const activeBottle = getActiveBottle(product.bottles);

    if (!activeBottle) {
      throw new Error(
        `Няма активна бутилка за "${product.name}".`
      );
    }

    const prices = await calculatePricesFromBottle(
      activeBottle
    );

    const priceMap = {
      3: prices.price3ml,
      5: prices.price5ml,
      10: prices.price10ml,
      20: prices.price20ml,
    };

    const unitPrice = Number(priceMap[size]);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(
        `Невалидна цена за "${product.name}".`
      );
    }

    subtotal += unitPrice * quantity;
  }

  return Number(subtotal.toFixed(2));
};

/**
 * Проверява промокод при checkout.
 */
const validatePromo = async (req, res) => {
  try {
    const code = String(req.body.promoCode || "")
      .trim()
      .toUpperCase();

    const { items } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Въведи промокод.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Количката е празна.",
      });
    }

    const subtotal = await calculateCartSubtotal(items);

    const promoData = await validatePromoCode(
      code,
      subtotal
    );

    return res.status(200).json({
      message: "Промокодът е приложен успешно.",
      promoCode: promoData.promo.code,
      discountAmount: promoData.discountAmount,
      discountedSubtotal: promoData.discountedSubtotal,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error.message ||
        "Промокодът не може да бъде приложен.",
    });
  }
};

/**
 * Увеличава броя използвания на промокод.
 */
const incrementPromoUsage = async (promoId) => {
  const promo = await PromoCode.findOneAndUpdate(
    {
      _id: promoId,
      active: true,

      $or: [
        { usageLimit: null },
        { usageLimit: { $exists: false } },
        {
          $expr: {
            $lt: ["$usageCount", "$usageLimit"],
          },
        },
      ],
    },
    {
      $inc: { usageCount: 1 },
    },
    {
      new: true,
    }
  );

  if (!promo) {
    throw new Error(
      "Промокодът вече не е наличен или е достигнал лимита си."
    );
  }

  return promo;
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
      promoCode,
    } = req.body;

    const userId = req.user?.userId || null;

    if (
      !customer ||
      !customer.firstName ||
      !customer.lastName ||
      !customer.phone ||
      !customer.email
    ) {
      return res.status(400).json({
        message: "Моля, попълнете данните на клиента.",
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
        message: "Моля, попълнете данните за доставка.",
      });
    }

    if (
      ![
        "econt",
        "speedy",
        "econtAddress",
        "speedyAddress",
      ].includes(delivery.method)
    ) {
      return res.status(400).json({
        message: "Невалиден метод за доставка.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message:
          "Поръчката трябва да съдържа поне един продукт.",
      });
    }

    let subtotal;

    try {
      subtotal = await calculateCartSubtotal(items);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    const promoCodeInput = String(promoCode || "")
      .trim()
      .toUpperCase();

    let promoData = {
      promo: null,
      discountAmount: 0,
      discountedSubtotal: subtotal,
      commissionRate: 0,
      commissionAmount: 0,
    };

    if (promoCodeInput) {
      try {
        promoData = await validatePromoCode(
          promoCodeInput,
          subtotal
        );
      } catch (promoError) {
        return res.status(400).json({
          message: promoError.message,
        });
      }
    }

    const {
      promo,
      discountAmount,
      discountedSubtotal,
      commissionRate,
      commissionAmount,
    } = promoData;

    const processedItems = [];

    for (const item of items) {
      const processed = await processOrderItem(item);
      processedItems.push(processed.item);
    }

    const totalCost = Number(
      processedItems
        .reduce((sum, item) => sum + item.costTotal, 0)
        .toFixed(2)
    );

    const grossProfit = Number(
      (discountedSubtotal - totalCost).toFixed(2)
    );

    const deliveryPrices = {
      speedy: 5.0,
      econt: 5.0,
      speedyAddress: 8.0,
      econtAddress: 8.0,
    };

    const deliveryPrice = deliveryPrices[delivery.method];

    const total = Number(
      (discountedSubtotal + deliveryPrice).toFixed(2)
    );

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId,

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
        status: payment?.status || "pending",
      },

      items: processedItems,

      subtotal,
      discountedSubtotal,
      discountAmount,

      promoCode: {
        code: promo?.code || "",
        promoCodeId: promo?._id || null,
        type: promo?.type || null,

        partnerId:
          promo?.type === "partner"
            ? promo.partnerId
            : null,

        discountType: promo?.discountType || null,
        discountValue: Number(promo?.discountValue || 0),
        discountAmount,
        commissionRate,
        commissionAmount,
      },

      deliveryPrice,
      total,
      totalCost,
      grossProfit,

      status: "pending",
      notes: notes || "",
    });

    if (promo) {
      try {
        await incrementPromoUsage(promo._id);
      } catch (usageError) {
        await Order.findByIdAndDelete(order._id);
        throw usageError;
      }
    }

    return res.status(201).json({
      message: "Поръчката е създадена успешно.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
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
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на поръчките.",
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
    console.error("Get my orders error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на вашите поръчки.",
      error: error.message,
    });
  }
};

/**
 * Възстановява милилитрите в оригиналните бутилки
 * според записания inventoryUsage.
 *
 * Използва се само в MongoDB транзакция.
 */
const restoreOrderInventory = async (order, session) => {
  const usageByProduct = new Map();

  for (const item of order.items) {
    if (
      !Array.isArray(item.inventoryUsage) ||
      item.inventoryUsage.length === 0
    ) {
      throw new Error(
        `Не може да се възстанови наличността за "${item.name}". Липсва информация за използваните бутилки.`
      );
    }

    const productId = String(item.productId);

    if (!usageByProduct.has(productId)) {
      usageByProduct.set(productId, new Map());
    }

    const bottleUsage = usageByProduct.get(productId);

    for (const usage of item.inventoryUsage) {
      const bottleId = String(usage.bottleId);
      const usedMl = Number(usage.ml);

      if (!Number.isFinite(usedMl) || usedMl <= 0) {
        throw new Error(
          `Невалидно количество за възстановяване на "${item.name}".`
        );
      }

      bottleUsage.set(
        bottleId,
        (bottleUsage.get(bottleId) || 0) + usedMl
      );
    }
  }

  for (const [productId, bottleUsage] of usageByProduct) {
    const product = await Product.findById(productId).session(
      session
    );

    if (!product) {
      throw new Error(
        `Продуктът с ID ${productId} не е намерен.`
      );
    }

    for (const [bottleId, usedMl] of bottleUsage) {
      const bottle = product.bottles.id(bottleId);

      if (!bottle) {
        throw new Error(
          `Бутилка с ID ${bottleId} не е намерена за "${product.name}".`
        );
      }

      bottle.remainingMl =
        Number(bottle.remainingMl || 0) + usedMl;
    }

    product.availableMl = product.bottles.reduce(
      (sum, bottle) =>
        sum + Number(bottle.remainingMl || 0),
      0
    );

    await product.save({ session });
  }
};

/**
 * Променя статуса на поръчка и начислява
 * бонус точки и партньорска комисионна.
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
    let inventoryWasRestored = false;

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

      /*
       * -------------------------
       * ВЪЗСТАНОВЯВАНЕ НА НАЛИЧНОСТ
       * -------------------------
       *
       * При отказана поръчка връщаме милилитрите
       * в оригиналните бутилки.
       *
       * inventoryRestored предпазва от повторно
       * възстановяване.
       */

      if (
        status === "cancelled" &&
        !order.inventoryRestored
      ) {
        await restoreOrderInventory(order, session);

        order.inventoryRestored = true;
        inventoryWasRestored = true;
      }

      order.status = status;

      /*
       * -------------------------
       * ОБЩО ПОХАРЧЕНО
       * -------------------------
       *
       * Използваме сумата след отстъпката.
       * Доставката не участва.
       */

      const eligibleAmount = Number(
        order.discountAmount > 0
          ? order.discountedSubtotal
          : order.subtotal || 0
      );

      if (status === "completed" && order.userId) {
        const spendingUser = await User.findById(
          order.userId
        ).session(session);

        if (!spendingUser) {
          throw new Error(
            "Потребителят на поръчката не е намерен."
          );
        }

        spendingUser.totalSpent = Number(
          (
            Number(spendingUser.totalSpent || 0) +
            eligibleAmount
          ).toFixed(2)
        );

        await spendingUser.save({ session });
      }

      /*
       * -------------------------
       * БОНУС ТОЧКИ
       * -------------------------
       *
       * 1 точка за всеки 10 € след отстъпката.
       */

      if (
        status === "completed" &&
        order.userId &&
        !order.pointsAwarded
      ) {
        const points =
          Math.floor((eligibleAmount / 10) * 100) /
          100;

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
              Number(user.bonusPoints || 0) + points
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
                description: `Бонус точки от поръчка ${order.orderNumber}`,
                orderId: order._id,
              },
            ],
            { session }
          );

          order.pointsEarned = points;
          order.pointsAwarded = true;
          order.pointsAwardedAt = new Date();

          awardedPoints = points;
        } else {
          order.pointsAwarded = true;
          order.pointsEarned = 0;
          order.pointsAwardedAt = new Date();
        }
      }

      /*
       * -------------------------
       * ПАРТНЬОРСКА КОМИСИОННА
       * -------------------------
       *
       * Начислява се само при completed.
       */

      if (
        status === "completed" &&
        order.promoCode?.type === "partner" &&
        order.promoCode?.partnerId &&
        Number(order.promoCode.commissionAmount) > 0
      ) {
        const existingCommission =
          await PartnerCommission.findOne({
            orderId: order._id,
          }).session(session);

        if (!existingCommission) {
          await PartnerCommission.create(
            [
              {
                partnerId: order.promoCode.partnerId,
                orderId: order._id,
                promoCodeId: order.promoCode.promoCodeId,
                promoCode: order.promoCode.code,
                orderAmount: order.discountedSubtotal,
                commissionRate:
                  order.promoCode.commissionRate,
                amount: order.promoCode.commissionAmount,
                status: "pending",
                earnedAt: new Date(),
              },
            ],
            { session }
          );
        }
      }

      await order.save({ session });

      updatedOrder = order;
    });

    let message = "Статусът на поръчката е променен.";

    if (awardedPoints > 0) {
      message += ` Начислени са ${awardedPoints.toFixed(2)} бонус точки.`;
    }

    if (inventoryWasRestored) {
      message += " Милилитрите са възстановени в наличността.";
    }

    return res.status(200).json({
      message,
      order: updatedOrder,
      awardedPoints,
      inventoryRestored: inventoryWasRestored,
    });
  } catch (error) {
    console.error("Update order status error:", error);

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
 * Връща 10-те най-продавани продукта.
 *
 * Класацията включва само завършени поръчки.
 * Броим продадените отливки, а не милилитрите.
 */
const getBestSellingProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      {
        $match: {
          status: "completed",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",
          soldQuantity: {
            $sum: "$items.quantity",
          },
          revenue: {
            $sum: "$items.total",
          },
        },
      },
      {
        $sort: {
          soldQuantity: -1,
          revenue: -1,
        },
      },
      {
        $lookup: {
          from: Product.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $match: {
          "product.active": true,
        },
      },
      {
        $sort: {
          soldQuantity: -1,
          revenue: -1,
        },
      },
      {
        $limit: 10,
      },
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
    console.error(
      "Get best-selling products error:",
      error
    );

    return res.status(500).json({
      message:
        "Грешка при зареждане на най-продаваните продукти.",
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
  validatePromo,
};