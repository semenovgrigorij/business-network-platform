// backend/routes/reviews.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Review = require("../models/Review");
const Business = require("../models/Business");

// @route   GET api/reviews/business/:businessId
// @desc    Получить все отзывы для бизнеса
// @access  Public
router.get("/business/:businessId", async (req, res) => {
  try {
    const reviews = await Review.find({ businessId: req.params.businessId })
      .populate("userId", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Помилка сервера при отриманні відгуків" });
  }
});

// @route   POST api/reviews
// @desc    Добавить отзыв
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { businessId, rating, text } = req.body;

    // Проверяем обязательные поля
    if (!businessId || !rating || !text) {
      return res.status(400).json({ message: "Всі поля обов'язкові" });
    }

    // Проверяем существование бизнеса
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Бізнес не знайдений" });
    }

    // Проверяем, не оставил ли пользователь уже отзыв
    const existingReview = await Review.findOne({
      businessId,
      userId: req.user.id,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Ви вже залишили відгук для цього бізнесу" });
    }

    // Создаем новый отзыв
    const newReview = new Review({
      businessId,
      userId: req.user.id,
      rating: parseInt(rating),
      text,
      createdAt: new Date(),
    });

    const savedReview = await newReview.save();

    // Получаем данные пользователя для отзыва
    const populatedReview = await Review.findById(savedReview._id).populate(
      "userId",
      "firstName lastName avatar"
    );

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Помилка сервера при створенні відгуку" });
  }
});

// @route   PUT api/reviews/:id
// @desc    Обновить отзыв
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Відгук не знайдений" });
    }

    // Проверяем, что отзыв принадлежит пользователю
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    // Обновляем отзыв
    const { rating, text } = req.body;

    if (rating) review.rating = parseInt(rating);
    if (text) review.text = text;

    review.updatedAt = new Date();

    await review.save();

    // Получаем обновленный отзыв с данными пользователя
    const updatedReview = await Review.findById(req.params.id).populate(
      "userId",
      "firstName lastName avatar"
    );

    res.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Помилка сервера при оновленні відгуку" });
  }
});

// @route   DELETE api/reviews/:id
// @desc    Удалить отзыв
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Відгук не знайдений" });
    }

    // Проверяем, что отзыв принадлежит пользователю
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Відгук успішно видалений" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Помилка сервера при видаленні відгуку" });
  }
});

module.exports = router;
