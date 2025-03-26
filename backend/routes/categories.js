// backend/routes/categories.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// @route   GET api/categories
// @desc    Получить все категории
// @access  Public
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні категорій" });
  }
});

// @route   GET api/categories/:id
// @desc    Получить категорию по ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Категорія не знайдена" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні категорії" });
  }
});

module.exports = router;
