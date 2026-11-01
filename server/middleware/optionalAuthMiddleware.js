const jwt = require("jsonwebtoken");

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Няма токен → продължаваме като гост.
    if (!authHeader) {
      req.user = null;
      return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Невалиден формат на токена.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Липсва токен.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Optional auth middleware error:",
      error.message
    );

    return res.status(401).json({
      message: "Невалиден или изтекъл токен.",
    });
  }
};

module.exports = optionalAuthMiddleware;