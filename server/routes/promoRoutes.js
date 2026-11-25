
const express = require("express");

const {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  togglePromoCode,
  deletePromoCode,
  getPartners,
  activatePartner,
  deactivatePartner,
} = require("../controllers/promoController");

const {
  getMyPartnerDashboard,
  getAdminPartnerCommissions,
  markPartnerCommissionAsPaid,
} = require("../controllers/partnerController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Партньорът вижда само собствената си справка.
router.get("/my-dashboard", authMiddleware, getMyPartnerDashboard);

// Всички маршрути след тази точка изискват администраторски права.
router.use(authMiddleware, adminMiddleware);

// Администраторска справка за комисионните.
router.get("/admin/commissions", getAdminPartnerCommissions);

// Маркиране на комисионна като изплатена.
router.patch(
  "/admin/commissions/:id/paid",
  markPartnerCommissionAsPaid
);

// Промокодове.
router.get("/", getPromoCodes);
router.post("/", createPromoCode);
router.put("/:id", updatePromoCode);
router.patch("/:id/toggle", togglePromoCode);
router.delete("/:id", deletePromoCode);

// Партньори.
router.get("/partners", getPartners);
router.post("/partners/activate", activatePartner);
router.patch("/partners/:id/deactivate", deactivatePartner);

module.exports = router;
