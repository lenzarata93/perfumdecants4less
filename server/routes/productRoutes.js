
const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  addBottle,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", createProduct);

router.post("/:id/bottles", addBottle);

module.exports = router;
