// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Получаем токен из заголовка
  const token = req.header("Authorization");

  // Проверяем наличие токена
  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Немає токена авторизації, доступ заборонено" });
  }

  // Извлекаем токен из строки "Bearer [token]"
  const tokenValue = token.split(" ")[1];

  try {
    // Верифицируем токен
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Добавляем информацию о пользователе в объект запроса
    req.user = decoded.user;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    // Обработка различных ошибок JWT
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Токен авторизації прострочений" });
    }

    res.status(401).json({ message: "Недійсний токен авторизації" });
  }
};
