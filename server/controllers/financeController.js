
const Product = require("../models/Product");
const Order = require("../models/Order");
const FundTransaction = require("../models/FundTransaction");

// 10.11.2026 г., 00:00 часа българско време.
const FUND_START_DATE = new Date(
  "2026-11-09T22:00:00.000Z"
);

/*
 * Създава движение във фонда само ако
 * същият sourceKey все още не съществува.
 *
 * Така една поръчка или бутилка няма
 * да бъде отчетена два пъти.
 */
const createFundTransaction = async ({
  type,
  direction,
  amount,
  description,
  date,
  sourceKey,
}) => {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount < 0
  ) {
    return;
  }

  await FundTransaction.updateOne(
    {
      sourceKey,
    },
    {
      $setOnInsert: {
        type,
        direction,
        amount: Number(
          numericAmount.toFixed(2)
        ),
        description,
        date,
        sourceKey,
      },
    },
    {
      upsert: true,
    }
  );
};

/*
 * Синхронизира историческите движения
 * от 10.11.2026 г. нататък.
 *
 * 1. Завършени поръчки:
 *    subtotal - totalCost
 *
 * 2. Закупени бутилки:
 *    purchasePrice
 *
 * Не се включват:
 * - чакащи поръчки;
 * - потвърдени поръчки;
 * - обработващи се поръчки;
 * - изпратени поръчки;
 * - отказани поръчки.
 */
const syncFundTransactions = async () => {
  /*
   * -------------------------
   * ПОРЪЧКИ
   * -------------------------
   */

  const orders = await Order.find({
    status: "completed",
    createdAt: {
      $gte: FUND_START_DATE,
    },
  }).select(
    "_id orderNumber subtotal totalCost grossProfit createdAt"
  );

  for (const order of orders) {
    const profit = Number(
      order.grossProfit ??
      (
        Number(order.subtotal || 0) -
        Number(order.totalCost || 0)
      )
    );

    if (!Number.isFinite(profit)) {
      continue;
    }

    await createFundTransaction({
      type: "order_profit",

      direction:
        profit >= 0
          ? "income"
          : "expense",

      amount: Math.abs(profit),

      description:
        `Печалба от поръчка ${order.orderNumber}`,

      date: order.createdAt,

      sourceKey:
        `order:${order._id}`,
    });
  }

  /*
   * -------------------------
   * ПОКУПКИ НА БУТИЛКИ
   * -------------------------
   */

  const products = await Product.find({
    "bottles.0": {
      $exists: true,
    },
  }).select(
    "name brand bottles createdAt"
  );

  for (const product of products) {
    for (const bottle of product.bottles) {
      const purchaseDate = new Date(
        bottle.purchaseDate ||
        product.createdAt
      );

      if (
        Number.isNaN(purchaseDate.getTime()) ||
        purchaseDate < FUND_START_DATE
      ) {
        continue;
      }

      await createFundTransaction({
        type: "bottle_purchase",

        direction: "expense",

        amount: Number(
          bottle.purchasePrice || 0
        ),

        description:
          `Покупка на ${product.brand} ${product.name}`,

        date: purchaseDate,

        sourceKey:
          `bottle:${bottle._id}`,
      });
    }
  }
};

/*
 * -------------------------
 * СЪЩЕСТВУВАЩА ФИНАНСОВА СТАТИСТИКА
 * -------------------------
 *
 * Запазена е оригиналната логика.
 */
const getTransactions = async (req, res) => {
  try {
    // Обща стойност на всички закупени бутилки
    const investmentResult = await Product.aggregate([
      {
        $unwind: "$bottles",
      },
      {
        $group: {
          _id: null,

          totalInvestment: {
            $sum: "$bottles.purchasePrice",
          },

          bottleCount: {
            $sum: 1,
          },
        },
      },
    ]);

    // Печалба само от завършени поръчки
    const ordersResult = await Order.aggregate([
      {
        $match: {
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$subtotal",
          },

          totalCost: {
            $sum: "$totalCost",
          },

          totalProfit: {
            $sum: {
              $subtract: [
                "$subtotal",
                "$totalCost",
              ],
            },
          },

          completedOrders: {
            $sum: 1,
          },
        },
      },
    ]);

    const investment =
      investmentResult[0] || {};

    const orders =
      ordersResult[0] || {};

    res.json({
      totalInvestment: Number(
        (investment.totalInvestment || 0).toFixed(2)
      ),

      totalProfit: Number(
        (orders.totalProfit || 0).toFixed(2)
      ),

      totalRevenue: Number(
        (orders.totalRevenue || 0).toFixed(2)
      ),

      totalCost: Number(
        (orders.totalCost || 0).toFixed(2)
      ),

      bottleCount:
        investment.bottleCount || 0,

      completedOrders:
        orders.completedOrders || 0,
    });
  } catch (error) {
    console.error(
      "Finance error:",
      error
    );

    res.status(500).json({
      message:
        "Грешка при зареждане на финансите",

      error: error.message,
    });
  }
};

/*
 * -------------------------
 * ФОНД ЗА ЗАРЕЖДАНЕ
 * -------------------------
 *
 * Връща:
 * - баланс;
 * - обща натрупана печалба;
 * - общи разходи;
 * - история на движенията.
 */
const getFund = async (req, res) => {
  try {
    // Първо синхронизираме автоматичните движения.
    await syncFundTransactions();

    const transactions =
      await FundTransaction.find({
        date: {
          $gte: FUND_START_DATE,
        },
      }).sort({
        date: -1,
        createdAt: -1,
      });

    const totals = transactions.reduce(
      (result, transaction) => {
        const amount = Number(
          transaction.amount || 0
        );

        if (
          transaction.direction === "income"
        ) {
          result.income += amount;
        } else {
          result.expenses += amount;
        }

        return result;
      },
      {
        income: 0,
        expenses: 0,
      }
    );

    const totalIncome = Number(
      totals.income.toFixed(2)
    );

    const totalExpenses = Number(
      totals.expenses.toFixed(2)
    );

    const balance = Number(
      (
        totalIncome -
        totalExpenses
      ).toFixed(2)
    );

    res.json({
      startDate: FUND_START_DATE,

      balance,

      totalIncome,

      totalExpenses,

      transactionCount:
        transactions.length,

      transactions,
    });
  } catch (error) {
    console.error(
      "Get fund error:",
      error
    );

    res.status(500).json({
      message:
        "Грешка при зареждане на фонда.",

      error: error.message,
    });
  }
};

/*
 * -------------------------
 * ДОБАВЯНЕ НА КОНСУМАТИВИ
 * -------------------------
 *
 * Разходът се записва като отделно
 * движение във фонда.
 */
const addFundExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      date,
    } = req.body;

    const expenseAmount = Number(amount);

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message:
          "Въведи описание на разхода.",
      });
    }

    if (
      !Number.isFinite(expenseAmount) ||
      expenseAmount <= 0
    ) {
      return res.status(400).json({
        message:
          "Въведи валидна сума.",
      });
    }

    if (!date) {
      return res.status(400).json({
        message:
          "Датата на покупката е задължителна.",
      });
    }

    /*
     * Запазваме датата като местна дата
     * за България, без изместване към
     * предходния календарен ден.
     */
    const expenseDate = new Date(
      `${date}T12:00:00.000Z`
    );

    if (
      Number.isNaN(expenseDate.getTime())
    ) {
      return res.status(400).json({
        message:
          "Невалидна дата.",
      });
    }

    if (
      expenseDate < FUND_START_DATE
    ) {
      return res.status(400).json({
        message:
          "Разходът трябва да бъде от 10.11.2026 г. нататък.",
      });
    }

    const transaction =
      await FundTransaction.create({
        type: "consumables",

        direction: "expense",

        amount: Number(
          expenseAmount.toFixed(2)
        ),

        description:
          description.trim(),

        date: expenseDate,
      });

    res.status(201).json({
      message:
        "Разходът е добавен успешно.",

      transaction,
    });
  } catch (error) {
    console.error(
      "Add fund expense error:",
      error
    );

    res.status(500).json({
      message:
        "Грешка при добавяне на разхода.",

      error: error.message,
    });
  }
};

module.exports = {
  getTransactions,
  getFund,
  addFundExpense,
};
