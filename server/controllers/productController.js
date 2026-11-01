
const Product = require("../models/Product");

const {
  calculateProductPrices,
  calculatePricesFromBottle,
} = require("../utils/pricingEngine");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      active: true,
    }).sort({
      createdAt: -1,
    });

    const productsWithPrices = await Promise.all(
      products.map(async (product) => {
        const { prices } =
          await calculateProductPrices(product);

        return {
          ...product.toObject(),

          pricePerMl: prices.pricePerMl,

          price3ml: prices.price3ml,

          price5ml: prices.price5ml,

          price10ml: prices.price10ml,

          price20ml: prices.price20ml,
        };
      })
    );

    res.status(200).json(productsWithPrices);
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      message:
        "Грешка при зареждане на продуктите.",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Продуктът не е намерен.",
      });
    }

    const { prices } =
      await calculateProductPrices(product);

    const productWithPrices = {
      ...product.toObject(),

      pricePerMl: prices.pricePerMl,

      price3ml: prices.price3ml,

      price5ml: prices.price5ml,

      price10ml: prices.price10ml,

      price20ml: prices.price20ml,
    };

    res.status(200).json(productWithPrices);
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    res.status(500).json({
      message:
        "Грешка при зареждане на продукта.",
      error: error.message,
    });
  }
};

/*
 * Създава чисто нов продукт
 * + първата закупена бутилка.
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      description,
      gender,
      category,
      image,
      initialMl,
      purchasePrice,
      purchaseDate,
    } = req.body;

    /* =========================
       ОСНОВНА ВАЛИДАЦИЯ
    ========================= */

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        message:
          "Името на парфюма е задължително.",
      });
    }

    if (
      typeof brand !== "string" ||
      !brand.trim()
    ) {
      return res.status(400).json({
        message:
          "Марката е задължителна.",
      });
    }

    /*
     * Превръщаме входните стойности
     * изрично в Number.
     */
    const newInitialMl =
      Number(initialMl);

    const newPurchasePrice =
      Number(purchasePrice);

    if (
      !Number.isFinite(newInitialMl) ||
      newInitialMl <= 0
    ) {
      return res.status(400).json({
        message:
          "Количеството на първата бутилка трябва да бъде по-голямо от 0 ml.",
      });
    }

    if (
      !Number.isFinite(newPurchasePrice) ||
      newPurchasePrice < 0
    ) {
      return res.status(400).json({
        message:
          "Покупната цена не е валидна.",
      });
    }

    /* =========================
       ПЪРВА БУТИЛКА
    ========================= */

    const purchasePricePerMl =
      newPurchasePrice /
      newInitialMl;

    const firstBottle = {
      initialMl: newInitialMl,

      remainingMl: newInitialMl,

      purchasePrice:
        newPurchasePrice,

      purchasePricePerMl:
        Number(
          purchasePricePerMl.toFixed(6)
        ),
    };

    /* =========================
       ДАТА НА ПОКУПКА
    ========================= */

    if (purchaseDate) {
      const parsedDate =
        new Date(purchaseDate);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Невалидна дата на покупка.",
        });
      }

      firstBottle.purchaseDate =
        parsedDate;
    }

    /* =========================
       ЦЕНИ
       От PricingSettings
    ========================= */

    const prices =
      await calculatePricesFromBottle(
        firstBottle
      );

    /* =========================
       СЪЗДАВАНЕ НА ПРОДУКТА
    ========================= */

    const product =
      await Product.create({
        name: name.trim(),

        brand: brand.trim(),

        description:
          typeof description === "string"
            ? description.trim()
            : "",

        gender:
          gender || "unisex",

        category:
          typeof category === "string"
            ? category.trim()
            : "",

        image:
          typeof image === "string"
            ? image.trim()
            : "",

        availableMl:
          newInitialMl,

        bottles: [
          firstBottle,
        ],

        timesPurchased: 0,

        rating: 0,

        comments: "",

        active: true,

        pricePerMl:
          prices.pricePerMl,

        price3ml:
          prices.price3ml,

        price5ml:
          prices.price5ml,

        price10ml:
          prices.price10ml,

        price20ml:
          prices.price20ml,
      });

    res.status(201).json({
      message:
        "Парфюмът беше добавен успешно.",

      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    res.status(400).json({
      message:
        "Грешка при създаване на продукта.",

      error: error.message,
    });
  }
};

/*
 * Добавя нова бутилка към
 * вече съществуващ продукт.
 */
const addBottle = async (req, res) => {
  try {
    const {
      initialMl,
      purchasePrice,
      purchaseDate,
    } = req.body;

    const newInitialMl =
      Number(initialMl);

    const newPurchasePrice =
      Number(purchasePrice);

    if (
      !Number.isFinite(newInitialMl) ||
      newInitialMl <= 0
    ) {
      return res.status(400).json({
        message:
          "Количеството ml трябва да бъде по-голямо от 0.",
      });
    }

    if (
      !Number.isFinite(newPurchasePrice) ||
      newPurchasePrice < 0
    ) {
      return res.status(400).json({
        message:
          "Покупната цена не е валидна.",
      });
    }

    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Продуктът не е намерен.",
      });
    }

    const purchasePricePerMl =
      newPurchasePrice /
      newInitialMl;

    const newBottle = {
      initialMl:
        newInitialMl,

      remainingMl:
        newInitialMl,

      purchasePrice:
        newPurchasePrice,

      purchasePricePerMl:
        Number(
          purchasePricePerMl.toFixed(6)
        ),
    };

    if (purchaseDate) {
      const parsedDate =
        new Date(purchaseDate);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Невалидна дата на покупка.",
        });
      }

      newBottle.purchaseDate =
        parsedDate;
    }

    product.bottles.push(
      newBottle
    );

    product.availableMl =
      Number(
        product.availableMl || 0
      ) + newInitialMl;

    await product.save();

    res.status(201).json({
      message:
        "Бутилката е добавена успешно.",

      product,
    });
  } catch (error) {
    console.error(
      "Add bottle error:",
      error
    );

    res.status(500).json({
      message:
        "Грешка при добавяне на бутилката.",

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
