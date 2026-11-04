const express = require("express");

const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Гости и регистрирани потребители могат да създават поръчки.
router.post(
  "/",
  optionalAuthMiddleware,
  createOrder
);

// Само администратор може да вижда всички поръчки.
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getOrders
);

// Само администратор може да променя статуса.
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

module.exports = router;