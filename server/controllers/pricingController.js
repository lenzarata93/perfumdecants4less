const PricingSettings = require("../models/PricingSettings");

const getPricingSettings = async (req, res) => {
  try {
    let settings = await PricingSettings.findOne();

    if (!settings) {
      settings = await PricingSettings.create({});
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Get pricing settings error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на ценовите настройки.",
      error: error.message,
    });
  }
};

module.exports = {
  getPricingSettings,
};