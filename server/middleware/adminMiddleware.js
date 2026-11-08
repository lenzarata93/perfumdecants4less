
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Необходим е вход в акаунта.",
      });
    }

    const user = await User.findById(
      req.user.userId
    ).select("isAdmin active");

    if (!user || !user.active) {
      return res.status(401).json({
        message: "Потребителят не е намерен или е деактивиран.",
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        message: "Нямате администраторски права.",
      });
    }

    req.admin = user;

    next();
  } catch (error) {
    console.error(
      "Admin middleware error:",
      error
    );

    return res.status(500).json({
      message: "Грешка при проверка на администраторските права.",
    });
  }
};

module.exports = adminMiddleware;
