const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Регистрация
router.post("/register", register);

// Вход
router.post("/login", login);

// Текущ потребител
router.get("/me", authMiddleware, getMe);

module.exports = router;