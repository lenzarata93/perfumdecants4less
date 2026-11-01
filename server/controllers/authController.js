const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Моля, попълнете всички задължителни полета.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Паролата трябва да бъде поне 6 символа.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Вече съществува акаунт с този email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : "",
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Регистрацията е успешна.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bonusPoints: user.bonusPoints,
        totalSpent: user.totalSpent,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Грешка при регистрация.",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Моля, въведете email и парола.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Невалиден email или парола.",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        message: "Този акаунт е деактивиран.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Невалиден email или парола.",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Входът е успешен.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bonusPoints: user.bonusPoints,
        totalSpent: user.totalSpent,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Грешка при вход.",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "Потребителят не е намерен.",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        message: "Този акаунт е деактивиран.",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bonusPoints: user.bonusPoints,
        totalSpent: user.totalSpent,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    res.status(500).json({
      message: "Грешка при зареждане на профила.",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};