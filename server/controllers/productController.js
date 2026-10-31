const Product = require("../models/Product");
const {
  calculateProductPrices,
} = require("../utils/pricingEngine");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true }).sort({
      createdAt: -1,
    });

    const productsWithPrices = await Promise.all(
      products.map(async (product) => {
        const { prices } = await calculateProductPrices(product);

        return {
          ...product.toObject(),
          pricePerMl: prices.pricePerMl,
          price5ml: prices.price5ml,
          price10ml: prices.price10ml,
          price20ml: prices.price20ml,
        };
      })
    );

    res.status(200).json(productsWithPrices);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на продуктите.",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Продуктът не е намерен.",
      });
    }

    const { prices } = await calculateProductPrices(product);

    const productWithPrices = {
      ...product.toObject(),
      pricePerMl: prices.pricePerMl,
      price5ml: prices.price5ml,
      price10ml: prices.price10ml,
      price20ml: prices.price20ml,
    };

    res.status(200).json(productWithPrices);
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на продукта.",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);

    res.status(400).json({
      message: "Грешка при създаване на продукта.",
      error: error.message,
    });
  }
};

/*
 * Добавя нова бутилка към вече съществуващ продукт.
 */
const addBottle = async (req, res) => {
  try {
    const { initialMl, purchasePrice, purchaseDate } = req.body;

    const newInitialMl = Number(initialMl);
    const newPurchasePrice = Number(purchasePrice);

    if (!Number.isFinite(newInitialMl) || newInitialMl <= 0) {
      return res.status(400).json({
        message: "Количеството ml трябва да бъде по-голямо от 0.",
      });
    }

    if (!Number.isFinite(newPurchasePrice) || newPurchasePrice < 0) {
      return res.status(400).json({
        message: "Покупната цена не е валидна.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Продуктът не е намерен.",
      });
    }

    const purchasePricePerMl =
      newPurchasePrice / newInitialMl;

    const newBottle = {
      initialMl: newInitialMl,
      remainingMl: newInitialMl,
      purchasePrice: newPurchasePrice,
      purchasePricePerMl,
    };

    if (purchaseDate) {
      const parsedDate = new Date(purchaseDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Невалидна дата на покупка.",
        });
      }

      newBottle.purchaseDate = parsedDate;
    }

    product.bottles.push(newBottle);

    product.availableMl =
      Number(product.availableMl || 0) +
      newInitialMl;

    await product.save();

    res.status(201).json({
      message: "Бутилката е добавена успешно.",
      product,
    });
  } catch (error) {
    console.error("Add bottle error:", error);

    res.status(500).json({
      message: "Грешка при добавяне на бутилката.",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  addBottle,
};