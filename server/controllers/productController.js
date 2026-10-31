
const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true }).sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на продуктите.",
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

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на продукта.",
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
 *
 * Пример:
 *
 * initialMl: 100
 * purchasePrice: 130
 *
 * purchasePricePerMl:
 * 130 / 100 = 1.30 €/ml
 *
 * След добавянето:
 *
 * availableMl = стара наличност + initialMl
 *
 * Старите бутилки не се променят.
 */
const addBottle = async (req, res) => {
  try {
    const { initialMl, purchasePrice, purchaseDate } = req.body;

    const newInitialMl = Number(initialMl);
    const newPurchasePrice = Number(purchasePrice);

    /*
     * Проверка на количеството.
     */
    if (
      !Number.isFinite(newInitialMl) ||
      newInitialMl <= 0
    ) {
      return res.status(400).json({
        message: "Количеството ml трябва да бъде по-голямо от 0.",
      });
    }

    /*
     * Проверка на покупната цена.
     */
    if (
      !Number.isFinite(newPurchasePrice) ||
      newPurchasePrice < 0
    ) {
      return res.status(400).json({
        message: "Покупната цена не е валидна.",
      });
    }

    /*
     * Намираме съществуващия продукт.
     */
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Продуктът не е намерен.",
      });
    }

    /*
     * Изчисляваме себестойността на 1 ml.
     */
    const purchasePricePerMl =
      newPurchasePrice / newInitialMl;

    /*
     * Създаваме новата бутилка.
     *
     * Ако няма подадена дата,
     * Mongoose ще използва текущата дата
     * благодарение на default: Date.now.
     */
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

    /*
     * Добавяме новата бутилка.
     */
    product.bottles.push(newBottle);

    /*
     * Увеличаваме общата наличност.
     */
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
