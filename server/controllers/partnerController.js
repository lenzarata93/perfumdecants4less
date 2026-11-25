
const User = require("../models/User");
const PromoCode = require("../models/PromoCode");
const PartnerCommission = require("../models/PartnerCommission");

// Закръгляне до 2 знака след десетичната запетая
const roundMoney = (value) => {
  return Number((value || 0).toFixed(2));
};

// GET /api/promos/my-dashboard
// Връща статистиката само на влезлия партньор.
const getMyPartnerDashboard = async (req, res) => {
  try {
    // ID-то идва от проверения JWT, а не от frontend.
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "firstName lastName email isPartner partnerActive active"
    );

    if (!user || !user.active) {
      return res.status(403).json({
        message: "Нямате достъп до партньорския профил.",
      });
    }

    if (!user.isPartner || !user.partnerActive) {
      return res.status(403).json({
        message: "Партньорският профил не е активен.",
      });
    }

    // Всички партньорски промокодове на потребителя.
    const promoCodes = await PromoCode.find({
      partnerId: user._id,
      type: "partner",
    })
      .select(
        "code discountType discountValue commissionRate minimumOrderAmount active startDate endDate"
      )
      .sort({ createdAt: -1 })
      .lean();

    // История на комисионните.
    const commissions = await PartnerCommission.find({
      partnerId: user._id,
    })
      .sort({ earnedAt: -1 })
      .lean();

    // Изключваме отменените комисионни от статистиката.
    const validCommissions = commissions.filter(
      (commission) => commission.status !== "cancelled"
    );

    const totalEarned = validCommissions.reduce(
      (sum, commission) => sum + commission.amount,
      0
    );

    const pendingAmount = validCommissions
      .filter((commission) => commission.status === "pending")
      .reduce((sum, commission) => sum + commission.amount, 0);

    const paidAmount = validCommissions
      .filter((commission) => commission.status === "paid")
      .reduce((sum, commission) => sum + commission.amount, 0);

    const referredRevenue = validCommissions.reduce(
      (sum, commission) => sum + commission.orderAmount,
      0
    );

    const ordersCount = validCommissions.length;

    // Подготвяме историята за frontend.
    const commissionHistory = commissions.map((commission) => ({
      id: commission._id,
      orderId: commission.orderId
        ? commission.orderId.toString()
        : null,
      promoCode: commission.promoCode,
      orderAmount: roundMoney(commission.orderAmount),
      commissionRate: commission.commissionRate,
      amount: roundMoney(commission.amount),
      status: commission.status,
      earnedAt: commission.earnedAt,
      paidAt: commission.paidAt,
    }));

    return res.status(200).json({
      isPartner: true,

      partner: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },

      promoCodes,

      stats: {
        totalEarned: roundMoney(totalEarned),
        pendingAmount: roundMoney(pendingAmount),
        paidAmount: roundMoney(paidAmount),
        ordersCount,
        referredRevenue: roundMoney(referredRevenue),
      },

      commissions: commissionHistory,
    });
  } catch (error) {
    console.error("Get partner dashboard error:", error);

    return res.status(500).json({
      message: "Грешка при зареждане на партньорската статистика.",
    });
  }
};

module.exports = {
  getMyPartnerDashboard,
};
