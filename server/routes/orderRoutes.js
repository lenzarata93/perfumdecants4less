
const express = require("express");

const {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus,
  getBestSellingProducts,
  validatePromo,
} = require("../controllers/orderController");

const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

const router = express.Router();

// Проверка на промокод.
// Не създава поръчка и не променя наличности.
router.post(
  "/validate-promo",
  validatePromo
);

// Гости и логнати потребители могат да създават поръчки.
// Ако има валиден JWT → req.user се попълва.
router.post(
  "/",
  optionalAuthMiddleware,
  createOrder
);

// Поръчки на текущия потребител.
router.get(
  "/my-orders",
  optionalAuthMiddleware,
  getMyOrders
);

// Най-продавани продукти.
router.get(
  "/best-sellers",
  getBestSellingProducts
);

router.get("/", getOrders);

router.patch("/:id/status", updateOrderStatus);

module.exports = router;
