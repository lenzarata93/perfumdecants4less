const express = require("express");

const {
  getPricingSettings,
} = require("../controllers/pricingController");

const router = express.Router();

router.get("/", getPricingSettings);

module.exports = router;