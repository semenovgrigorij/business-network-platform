// backend/routes/businesses.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Business = require("../models/Business");
const Review = require("../models/Review");

// @route   GET api/businesses
// @desc    Получить все бизнесы
// @access  Public
router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("ownerId", "firstName lastName")
      .populate("categories", "name")
      .sort({ createdAt: -1 });

    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні списку бізнесів" });
  }
});

// @route   GET api/businesses/:id
// @desc    Получить бизнес по ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Проверка валидности ID
    if (!id || id === "undefined") {
      return res.status(400).json({ message: "Невірний ID бізнесу" });
    }
    const business = await Business.findById(req.params.id)
      .populate("ownerId", "firstName lastName")
      .populate("categories", "name");

    if (!business) {
      return res.status(404).json({ message: "Бізнес не знайдений" });
    }

    res.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ message: "Помилка сервера при отриманні бізнесу" });
  }
});

// @route   POST api/businesses
// @desc    Создать новый бизнес
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      categories,
      image,
      email,
      phone,
      website,
      coordinates,
    } = req.body;

    // Проверяем обязательные поля
    if (!name || !description || !location) {
      return res
        .status(400)
        .json({ message: "Вкажіть назву, опис та місцезнаходження бізнесу" });
    }

    // Создаем новый бизнес
    const newBusiness = new Business({
      name,
      description,
      location,
      coordinates,
      categories: categories || [],
      image,
      email,
      phone,
      website,
      ownerId: req.user.id,
      createdAt: new Date(),
    });

    const savedBusiness = await newBusiness.save();

    // Получаем заполненный объект бизнеса с данными о категориях и владельце
    const populatedBusiness = await Business.findById(savedBusiness._id)
      .populate("ownerId", "firstName lastName")
      .populate("categories", "name");

    res.status(201).json(populatedBusiness);
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(500).json({ message: "Помилка сервера при створенні бізнесу" });
  }
});

// @route   PUT api/businesses/:id
// @desc    Обновить бизнес
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Бізнес не знайдений" });
    }

    // Проверяем, что пользователь является владельцем
    if (business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Доступ заборонено: ви не є власником цього бізнесу",
      });
    }

    // Обновляем все поля, которые были переданы
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate("ownerId", "firstName lastName")
      .populate("categories", "name");

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ message: "Помилка сервера при оновленні бізнесу" });
  }
});

// @route   DELETE api/businesses/:id
// @desc    Удалить бизнес
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Бізнес не знайдений" });
    }

    // Проверяем, что пользователь является владельцем
    if (business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Доступ заборонено: ви не є власником цього бізнесу",
      });
    }

    await Business.findByIdAndDelete(req.params.id);

    // Удаляем также все отзывы для этого бизнеса
    await Review.deleteMany({ businessId: req.params.id });

    res.json({ message: "Бізнес успішно видалений" });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Помилка сервера при видаленні бізнесу" });
  }
});

// @route   GET api/businesses/search
// @desc    Поиск бизнесов
// @access  Public
// backend/routes/businesses.js - добавьте или обновите этот маршрут
router.get("/search", async (req, res) => {
  try {
    const { query, category, location, minRating, maxDistance } = req.query;

    // Создаем поисковый запрос
    const searchFilter = {};

    // Поиск по ключевому слову в имени или описании
    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Фильтр по категории
    if (category) {
      searchFilter.categories = category;
    }

    // Фильтр по местоположению
    if (location) {
      searchFilter.location = { $regex: location, $options: "i" };
    }

    // Поиск по координатам
    if (req.query.latitude && req.query.longitude && maxDistance) {
      const { latitude, longitude } = req.query;
      searchFilter.coordinates = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(maxDistance) * 1000, // км в метры
        },
      };
    }

    // Поиск с учетом среднего рейтинга
    let businesses = await Business.find(searchFilter)
      .populate("ownerId", "firstName lastName")
      .populate("categories", "name");

    // Фильтрация по рейтингу (делаем после запроса, так как требует аггрегации данных отзывов)
    if (minRating) {
      const reviewsMap = await Review.aggregate([
        { $group: { _id: "$businessId", avgRating: { $avg: "$rating" } } },
      ]);

      // Создаем Map для быстрого поиска
      const ratingsMap = new Map();
      reviewsMap.forEach((item) =>
        ratingsMap.set(item._id.toString(), item.avgRating)
      );

      // Фильтруем бизнесы по рейтингу
      businesses = businesses.filter((business) => {
        const avgRating = ratingsMap.get(business._id.toString()) || 0;
        return avgRating >= parseFloat(minRating);
      });
    }

    res.json(businesses);
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({ message: "Помилка сервера при пошуку" });
  }
});
module.exports = router;
