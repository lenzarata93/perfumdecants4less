const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  addBottle,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Публични маршрути
router.get("/", getProducts);
router.get("/:id", getProductById);

// Само за администратор
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);

router.post(
  "/:id/bottles",
  authMiddleware,
  adminMiddleware,
  addBottle
);

module.exports = router;