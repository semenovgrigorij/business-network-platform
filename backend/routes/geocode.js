// backend/routes/geocode.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// @route   GET api/geocode
// @desc    Геокодирование адреса (получение координат)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: "Необхідно вказати адресу" });
    }

    // Формирование запроса к API геокодирования (в данном случае, Nominatim)
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "YourAppName/1.0", // Требуется для Nominatim
        },
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Адреса не знайдена" });
    }

    const result = response.data[0];

    res.json({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    });
  } catch (error) {
    console.error("Error geocoding address:", error);

    // Запасные координаты, если геокодирование не удалось
    res.json({
      latitude: 50.450001, // Координаты центра Киева
      longitude: 30.523333,
    });
  }
});

module.exports = router;
