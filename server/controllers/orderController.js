const Order = require("../models/Order");
const Product = require("../models/Product");
const Counter = require("../models/Counter");

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
const calculateInventoryUsage = (
  bottles,
  requestedMl
) => {
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
const deductInventory = (
  product,
  requestedMl
) => {
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

  if (![5, 10, 20].includes(size)) {
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

      if (![5, 10, 20].includes(size)) {
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

module.exports = {
  createOrder,
  getOrders,
};