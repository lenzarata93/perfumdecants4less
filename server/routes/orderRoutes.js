const express = require("express");

const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

const router = express.Router();

// Гости и логнати потребители могат да създават поръчки.
// Ако има валиден JWT → req.user се попълва.
router.post(
  "/",
  optionalAuthMiddleware,
  createOrder
);

router.get("/", getOrders);

router.patch("/:id/status", updateOrderStatus);

module.exports = router;