// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

// @route   POST api/auth/register
// @desc    Регистрация пользователя
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Проверка наличия обязательных полей
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Усі поля обов'язкові" });
    }

    // Проверка существования пользователя
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "Користувач з такою електронною адресою вже існує" });
    }

    // Создание нового пользователя
    user = new User({
      firstName,
      lastName,
      email,
      password,
      avatar: "/images/placeholders/user-avatar.jpg", // Аватар по умолчанию
    });

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Сохранение пользователя
    await user.save();

    // Создание JWT токена
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
          },
        });
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Помилка сервера під час реєстрації" });
  }
});

// @route   POST api/auth/login
// @desc    Авторизация пользователя
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка наличия обязательных полей
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Введіть електронну адресу та пароль" });
    }

    // Поиск пользователя
    const user = await User.findOne({ email });

    // Проверка существования пользователя
    if (!user) {
      return res
        .status(400)
        .json({ message: "Невірна електронна адреса або пароль" });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Невірна електронна адреса або пароль" });
    }

    // Создание JWT токена
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Помилка сервера під час авторизації" });
  }
});

// @route   GET api/auth/user
// @desc    Получение данных текущего пользователя
// @access  Private
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -passwordResetToken -passwordResetExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "Користувач не знайдений" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні даних користувача" });
  }
});

module.exports = router;
