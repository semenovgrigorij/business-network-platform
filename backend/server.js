console.log("Server startup - ENVIRONMENT:", process.env.NODE_ENV);
console.log("API Routes:", [
  "/api/auth",
  "/api/users",
  "/api/businesses",
  "/api/categories",
  "/api/reviews",
  "/api/geocode",
  "/api/messages",
]);
// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Загрузка переменных окружения
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("Current environment:", process.env.NODE_ENV);
console.log("Static files path:", path.join(__dirname, "../dist"));

// Статическая раздача фронтенда для продакшена
if (process.env.NODE_ENV === "production") {
  // Путь к статическим файлам
  app.use(express.static(path.join(__dirname, "../dist")));

  // Для всех остальных маршрутов отдаем index.html (для SPA)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

// Инициализация приложения Express
const app = express();

// Настройка CORS
app.use(
  cors({
    origin: [
      "http://localhost:5001",
      "http://127.0.0.1:5001",
      "https://business-network-platform-kolabora.onrender.com/",
    ],
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

// Статическая раздача фронтенда для продакшена
if (process.env.NODE_ENV === "production") {
  // Путь к статическим файлам Vue
  app.use(express.static(path.join(__dirname, "../dist")));

  // Для всех остальных маршрутов отдаем index.html (для SPA)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// Определение маршрутов API
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/businesses", require("./routes/businesses"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/geocode", require("./routes/geocode"));
app.use("/api/messages", require("./routes/messages"));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// В server.js
app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

console.log("Server startup - ENVIRONMENT:", process.env.NODE_ENV);
console.log("Current directory:", __dirname);
console.log("Resolved dist path:", path.resolve(__dirname, "../dist"));
