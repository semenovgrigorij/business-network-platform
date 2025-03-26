// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Загрузка переменных окружения
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Инициализация приложения Express
const app = express();

// Настройка CORS
app.use(
  cors({
    origin: ["http://localhost:5001", "http://127.0.0.1:5001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Настройка middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    // Логирование для вывода имени базы данных
    const db = mongoose.connection;
    console.log("Connected to database:", db.name);
    console.log("DB host:", db.host);
    console.log("DB port:", db.port);
    // Логирование для модели и коллекции
    console.log("Mongoose models:", Object.keys(mongoose.models));
    console.log("Collections:");
    db.db
      .listCollections()
      .toArray()
      .then((collections) => {
        collections.forEach((collection) => {
          console.log(" -", collection.name);
        });
      })
      .catch((err) => console.error("Error listing collections:", err));
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Определение маршрутов API
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/businesses", require("./routes/businesses"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/geocode", require("./routes/geocode"));
app.use("/api/messages", require("./routes/messages"));

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Обработка ошибок
app.use((err, req, res) => {
  // Добавлен параметр next
  console.error(err.stack);
  res.status(500).json({ message: "Server error", details: err.message });
});

// Определение порта
const PORT = process.env.PORT || 5000;

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
