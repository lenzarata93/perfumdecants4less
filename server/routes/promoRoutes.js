
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

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Всички маршрути по-долу изискват администраторски права.
router.use(authMiddleware, adminMiddleware);

// Промокодове
router.get("/", getPromoCodes);
router.post("/", createPromoCode);
router.put("/:id", updatePromoCode);
router.patch("/:id/toggle", togglePromoCode);
router.delete("/:id", deletePromoCode);

// Партньори
router.get("/partners", getPartners);
router.post("/partners/activate", activatePartner);
router.patch("/partners/:id/deactivate", deactivatePartner);

module.exports = router;
