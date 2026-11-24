
const PromoCode = require("../models/PromoCode");
const PartnerCommission = require("../models/PartnerCommission");
const User = require("../models/User");

// Всички промокодове
const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find()
      .populate("partnerId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ promoCodes });
  } catch (error) {
    console.error("Get promo codes error:", error);
    res.status(500).json({
      message: "Грешка при зареждане на промокодовете.",
    });
  }
};

// Създаване на промокод
const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      partnerId,
      discountType,
      discountValue,
      commissionRate,
      minimumOrderAmount,
      usageLimit,
      startDate,
      endDate,
      active,
    } = req.body;

    if (!code || discountValue === undefined || discountValue === "") {
      return res.status(400).json({
        message: "Въведете код и размер на отстъпката.",
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
      return res.status(400).json({
        message: "Кодът може да съдържа само латински букви, цифри, тире и долна черта.",
      });
    }

    const existingCode = await PromoCode.findOne({
      code: normalizedCode,
    });

    if (existingCode) {
      return res.status(409).json({
        message: "Този промокод вече съществува.",
      });
    }

    const promoType = type || "discount";

    let linkedPartner = null;

    if (promoType === "partner") {
      if (!partnerId) {
        return res.status(400).json({
          message: "Изберете партньор за този промокод.",
        });
      }

      linkedPartner = await User.findById(partnerId);

      if (
        !linkedPartner ||
        !linkedPartner.active ||
        !linkedPartner.isPartner ||
        !linkedPartner.partnerActive
      ) {
        return res.status(400).json({
          message: "Избраният потребител не е активен партньор.",
        });
      }
    }

    const promoCode = await PromoCode.create({
      code: normalizedCode,
      description: description || "",
      type: promoType,
      partnerId: promoType === "partner" ? partnerId : null,
      discountType: discountType || "percent",
      discountValue: Number(discountValue),
      commissionRate:
        promoType === "partner"
          ? Number(commissionRate ?? 10)
          : 0,
      minimumOrderAmount: Number(minimumOrderAmount || 0),
      usageLimit:
        usageLimit === "" || usageLimit === null || usageLimit === undefined
          ? null
          : Number(usageLimit),
      startDate: startDate || new Date(),
      endDate: endDate || null,
      active: active !== false,
    });

    await promoCode.populate(
      "partnerId",
      "firstName lastName email"
    );

    res.status(201).json({
      message: "Промокодът е създаден успешно.",
      promoCode,
    });
  } catch (error) {
    console.error("Create promo code error:", error);

    res.status(400).json({
      message: error.message || "Грешка при създаване на промокода.",
    });
  }
};

// Редактиране на промокод
const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await PromoCode.findById(id);

    if (!promoCode) {
      return res.status(404).json({
        message: "Промокодът не е намерен.",
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      commissionRate,
      minimumOrderAmount,
      usageLimit,
      startDate,
      endDate,
      active,
    } = req.body;

    if (code !== undefined) {
      const normalizedCode = String(code).trim().toUpperCase();

      if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
        return res.status(400).json({
          message: "Невалиден формат на промокода.",
        });
      }

      const duplicate = await PromoCode.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Този промокод вече съществува.",
        });
      }

      promoCode.code = normalizedCode;
    }

    if (description !== undefined) promoCode.description = description;
    if (discountType !== undefined) promoCode.discountType = discountType;
    if (discountValue !== undefined) promoCode.discountValue = Number(discountValue);
    if (commissionRate !== undefined) promoCode.commissionRate = Number(commissionRate);
    if (minimumOrderAmount !== undefined) {
      promoCode.minimumOrderAmount = Number(minimumOrderAmount);
    }

    if (usageLimit !== undefined) {
      promoCode.usageLimit =
        usageLimit === "" || usageLimit === null
          ? null
          : Number(usageLimit);
    }

    if (startDate !== undefined) promoCode.startDate = startDate;
    if (endDate !== undefined) promoCode.endDate = endDate || null;
    if (active !== undefined) promoCode.active = Boolean(active);

    await promoCode.save();

    await promoCode.populate(
      "partnerId",
      "firstName lastName email"
    );

    res.status(200).json({
      message: "Промокодът е актуализиран.",
      promoCode,
    });
  } catch (error) {
    console.error("Update promo code error:", error);

    res.status(400).json({
      message: error.message || "Грешка при редактиране на промокода.",
    });
  }
};

// Активиране / деактивиране
const togglePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        message: "Промокодът не е намерен.",
      });
    }

    promoCode.active = !promoCode.active;
    await promoCode.save();

    res.status(200).json({
      message: promoCode.active
        ? "Промокодът е активиран."
        : "Промокодът е деактивиран.",
      promoCode,
    });
  } catch (error) {
    console.error("Toggle promo code error:", error);
    res.status(500).json({
      message: "Грешка при промяна на статуса.",
    });
  }
};

// Изтриване само ако кодът не е използван
const deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        message: "Промокодът не е намерен.",
      });
    }

    const hasCommissions = await PartnerCommission.exists({
      promoCodeId: promoCode._id,
    });

    if (promoCode.usageCount > 0 || hasCommissions) {
      return res.status(400).json({
        message: "Този промокод вече е използван. Деактивирайте го вместо да го изтривате.",
      });
    }

    await promoCode.deleteOne();

    res.status(200).json({
      message: "Промокодът е изтрит.",
    });
  } catch (error) {
    console.error("Delete promo code error:", error);
    res.status(500).json({
      message: "Грешка при изтриване на промокода.",
    });
  }
};

// Списък с активни партньори
const getPartners = async (req, res) => {
  try {
    const partners = await User.find({
      isPartner: true,
      partnerActive: true,
      active: true,
    })
      .select("firstName lastName email phone createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ partners });
  } catch (error) {
    console.error("Get partners error:", error);
    res.status(500).json({
      message: "Грешка при зареждане на партньорите.",
    });
  }
};

// Активиране на съществуващ клиент като партньор по имейл
const activatePartner = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Въведете имейл адрес.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Не е намерен регистриран потребител с този имейл.",
      });
    }

    if (!user.active) {
      return res.status(400).json({
        message: "Този потребителски акаунт е деактивиран.",
      });
    }

    if (user.isAdmin) {
      return res.status(400).json({
        message: "Администраторски акаунт не може да бъде добавен като партньор.",
      });
    }

    if (user.isPartner && user.partnerActive) {
      return res.status(409).json({
        message: "Този потребител вече е активен партньор.",
      });
    }

    user.isPartner = true;
    user.partnerActive = true;

    await user.save();

    res.status(200).json({
      message: "Потребителят е активиран като партньор.",
      partner: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Activate partner error:", error);
    res.status(500).json({
      message: "Грешка при активиране на партньора.",
    });
  }
};

// Деактивиране на партньор
const deactivatePartner = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isPartner: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "Партньорът не е намерен.",
      });
    }

    user.partnerActive = false;
    await user.save();

    res.status(200).json({
      message: "Партньорът е деактивиран.",
    });
  } catch (error) {
    console.error("Deactivate partner error:", error);
    res.status(500).json({
      message: "Грешка при деактивиране на партньора.",
    });
  }
};

module.exports = {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  togglePromoCode,
  deletePromoCode,
  getPartners,
  activatePartner,
  deactivatePartner,
};
