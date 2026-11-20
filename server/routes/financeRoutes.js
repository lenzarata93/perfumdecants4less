
const express = require("express");

const {
  getTransactions,
  getFund,
  addFundExpense,
} = require("../controllers/financeController");

const router = express.Router();

// Съществуваща финансова статистика
router.get("/", getTransactions);

// Фонд за зареждане
router.get("/fund", getFund);

// Добавяне на разход за консумативи
router.post("/fund/expenses", addFundExpense);

module.exports = router;
