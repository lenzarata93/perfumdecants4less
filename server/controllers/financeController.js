
const Product = require("../models/Product");
const Order = require("../models/Order");

const getTransactions = async (req, res) => {
  try {
    // Обща стойност на всички закупени бутилки
    const investmentResult = await Product.aggregate([
      { $unwind: "$bottles" },
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
              $subtract: ["$subtotal", "$totalCost"],
            },
          },
          completedOrders: {
            $sum: 1,
          },
        },
      },
    ]);

    const investment = investmentResult[0] || {};
    const orders = ordersResult[0] || {};

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

      bottleCount: investment.bottleCount || 0,
      completedOrders: orders.completedOrders || 0,
    });

  } catch (error) {
    console.error("Finance error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на финансите",
      error: error.message,
    });
  }
};

module.exports = {
  getTransactions,
};
