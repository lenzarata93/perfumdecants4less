
const User = require("../models/User");
const PromoCode = require("../models/PromoCode");
const PartnerCommission = require("../models/PartnerCommission");

const roundMoney = (value) =>
  Number((Number(value) || 0).toFixed(2));

// GET /api/promos/my-dashboard
// Партньорът вижда само собствената си статистика.
const getMyPartnerDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "firstName lastName email isPartner partnerActive active"
    );

    if (!user || !user.active || !user.isPartner || !user.partnerActive) {
      return res.status(403).json({
        message: "Нямате достъп до партньорския профил.",
      });
    }

    const promoCodes = await PromoCode.find({
      partnerId: user._id,
      type: "partner",
    })
      .select(
        "code discountType discountValue commissionRate minimumOrderAmount active startDate endDate"
      )
      .sort({ createdAt: -1 })
      .lean();

    const commissions = await PartnerCommission.find({
      partnerId: user._id,
    })
      .sort({ earnedAt: -1 })
      .lean();

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
        ordersCount: validCommissions.length,
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

// GET /api/promos/admin/commissions
// Само администратор може да вижда общата справка.
const getAdminPartnerCommissions = async (req, res) => {
  try {
    const commissions = await PartnerCommission.find()
      .populate("partnerId", "firstName lastName email")
      .sort({ earnedAt: -1 })
      .lean();

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

    const commissionHistory = commissions.map((commission) => ({
      id: commission._id,
      partner: commission.partnerId
        ? {
            id: commission.partnerId._id,
            firstName: commission.partnerId.firstName,
            lastName: commission.partnerId.lastName,
            email: commission.partnerId.email,
          }
        : null,
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
      stats: {
        totalEarned: roundMoney(totalEarned),
        pendingAmount: roundMoney(pendingAmount),
        paidAmount: roundMoney(paidAmount),
        referredRevenue: roundMoney(referredRevenue),
        ordersCount: validCommissions.length,
        pendingCount: validCommissions.filter(
          (commission) => commission.status === "pending"
        ).length,
      },
      commissions: commissionHistory,
    });
  } catch (error) {
    console.error("Get admin partner commissions error:", error);

    return res.status(500).json({
      message: "Грешка при зареждане на партньорските комисионни.",
    });
  }
};

// PATCH /api/promos/admin/commissions/:id/paid
// Маркира неплатена комисионна като реално изплатена.
const markPartnerCommissionAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Невалиден идентификатор на комисионната.",
      });
    }

    const commission = await PartnerCommission.findById(id);

    if (!commission) {
      return res.status(404).json({
        message: "Комисионната не е намерена.",
      });
    }

    if (commission.status === "paid") {
      return res.status(400).json({
        message: "Тази комисионна вече е маркирана като изплатена.",
      });
    }

    if (commission.status !== "pending") {
      return res.status(400).json({
        message: "Може да се изплащат само неплатени комисионни.",
      });
    }

    commission.status = "paid";
    commission.paidAt = new Date();

    await commission.save();

    return res.status(200).json({
      message: "Комисионната е маркирана като изплатена.",
      commission: {
        id: commission._id,
        status: commission.status,
        paidAt: commission.paidAt,
        amount: roundMoney(commission.amount),
      },
    });
  } catch (error) {
    console.error("Mark partner commission as paid error:", error);

    return res.status(500).json({
      message: "Грешка при маркиране на комисионната като изплатена.",
    });
  }
};

module.exports = {
  getMyPartnerDashboard,
  getAdminPartnerCommissions,
  markPartnerCommissionAsPaid,
};
