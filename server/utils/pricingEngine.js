const PricingSettings = require("../models/PricingSettings");

/**
 * Закръгля цена НАГОРЕ до зададената стъпка.
 *
 * Пример при step = 0.05:
 * 2.32 -> 2.35
 * 2.38 -> 2.40
 * 2.40 -> 2.40
 */
const roundUp = (price, step = 0.05) => {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Невалидна цена за закръгляне.");
  }

  if (!Number.isFinite(step) || step <= 0) {
    throw new Error("Невалидна стъпка за закръгляне.");
  }

  const rounded =
    Math.ceil((price - 0.0000001) / step) * step;

  return Number(rounded.toFixed(2));
};

/**
 * Изчислява цената на ml от конкретна бутилка.
 *
 * Цена на ml = цена на бутилката / ml на бутилката
 */
const calculatePricePerMl = (
  purchasePrice,
  initialMl
) => {
  const price = Number(purchasePrice);
  const ml = Number(initialMl);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Невалидна покупна цена.");
  }

  if (!Number.isFinite(ml) || ml <= 0) {
    throw new Error("Невалидно количество ml.");
  }

  return Number((price / ml).toFixed(6));
};

/**
 * Изчислява продажната цена за конкретен размер.
 *
 * Формула:
 *
 * (цена на ml × размер) × multiplier + consumablesCost
 */
const calculateSizePrice = (
  pricePerMl,
  size,
  settings
) => {
  const mlPrice = Number(pricePerMl);
  const sizeNumber = Number(size);

  if (!Number.isFinite(mlPrice) || mlPrice < 0) {
    throw new Error("Невалидна цена на ml.");
  }

  const sizeSettings =
    settings.sizes?.[sizeNumber];

  if (!sizeSettings) {
    throw new Error(
      `Няма ценова настройка за ${sizeNumber} ml.`
    );
  }

  const multiplier = Number(
    sizeSettings.multiplier
  );

  const consumablesCost = Number(
    sizeSettings.consumablesCost
  );

  const rawPrice =
    mlPrice * sizeNumber * multiplier +
    consumablesCost;

  return roundUp(
    rawPrice,
    Number(settings.roundingStep)
  );
};

/**
 * Изчислява всички продажни цени
 * от конкретна бутилка.
 */
const calculatePricesFromBottle = async (
  bottle
) => {
  if (!bottle) {
    throw new Error("Липсва бутилка.");
  }

  const pricePerMl = calculatePricePerMl(
    bottle.purchasePrice,
    bottle.initialMl
  );

  const settings =
    await PricingSettings.findOne();

  if (!settings) {
    throw new Error(
      "Няма записани PricingSettings в базата данни."
    );
  }

  return {
    pricePerMl,

    price3ml: calculateSizePrice(
      pricePerMl,
      3,
      settings
    ),

    price5ml: calculateSizePrice(
      pricePerMl,
      5,
      settings
    ),

    price10ml: calculateSizePrice(
      pricePerMl,
      10,
      settings
    ),

    price20ml: calculateSizePrice(
      pricePerMl,
      20,
      settings
    ),
  };
};

/**
 * Връща първата неизчерпана бутилка.
 *
 * Това е активната бутилка, която определя
 * текущата продажна цена.
 */
const getActiveBottle = (bottles = []) => {
  return (
    bottles.find(
      (bottle) =>
        Number(bottle.remainingMl) > 0
    ) || null
  );
};

/**
 * Изчислява текущите продажни цени
 * на продукта според първата
 * неизчерпана бутилка.
 */
const calculateProductPrices = async (
  product
) => {
  const activeBottle =
    getActiveBottle(product.bottles);

  if (!activeBottle) {
    return {
      activeBottle: null,

      prices: {
        pricePerMl: 0,
        price3ml: 0,
        price5ml: 0,
        price10ml: 0,
        price20ml: 0,
      },
    };
  }

  const prices =
    await calculatePricesFromBottle(
      activeBottle
    );

  return {
    activeBottle,
    prices,
  };
};

module.exports = {
  roundUp,
  calculatePricePerMl,
  calculateSizePrice,
  calculatePricesFromBottle,
  getActiveBottle,
  calculateProductPrices,
};