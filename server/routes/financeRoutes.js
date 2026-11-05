
const express = require("express");
const { getTransactions } = require("../controllers/financeController");

const router = express.Router();

router.get("/", getTransactions);

module.exports = router;
