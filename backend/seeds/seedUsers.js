// seeds/seedUsers.js
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const dotenv = require("dotenv");

// Настраиваем путь к .env файлу
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Проверяем, загрузилась ли строка подключения
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI не найден в .env файле!");
  console.error("Текущая директория:", __dirname);
  process.exit(1);
}

console.log("Подключение к MongoDB с URI:", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Функция для хеширования пароля
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function seedUsers() {
  try {
    // Хешируем пароль для всех пользователей
    const hashedPassword = await hashPassword("password123");

    const users = [
      {
        firstName: "Іван",
        lastName: "Петренко",
        email: "ivan@example.com",
        password: hashedPassword,
        avatar: "/images/placeholders/user-avatar-1.jpg",
        location: "Київ",
        bio: "Досвідчений розробник програмного забезпечення",
        jobTitle: "Senior Developer",
        phone: "+380991234567",
        skills: ["JavaScript", "React", "Node.js"],
        experience: [
          {
            title: "Senior Developer",
            company: "ТехСтартап",
            from: "Січень 2020",
            current: true,
            description: "Розробка та підтримка веб-додатків",
          },
        ],
      },
      {
        firstName: "Марія",
        lastName: "Коваленко",
        email: "maria@example.com",
        password: hashedPassword,
        avatar: "/images/placeholders/user-avatar-2.jpg",
        location: "Львів",
        bio: "Підприємець та власник органічної ферми",
        jobTitle: "Директор",
        phone: "+380992345678",
        skills: ["Управління бізнесом", "Органічне фермерство"],
        experience: [
          {
            title: "Директор",
            company: "ЕкоФерма",
            from: "Лютий 2019",
            current: true,
            description: "Управління органічним господарством",
          },
        ],
      },
      {
        firstName: "Олег",
        lastName: "Сидоренко",
        email: "oleg@example.com",
        password: hashedPassword,
        avatar: "/images/placeholders/user-avatar-3.jpg",
        location: "Київ",
        bio: "Креативний дизайнер з досвідом у графічному дизайні",
        jobTitle: "Art Director",
        phone: "+380993456789",
        skills: ["Adobe Photoshop", "Illustrator", "UI/UX"],
        experience: [
          {
            title: "Art Director",
            company: "ДизайнСтудія",
            from: "Березень 2018",
            current: true,
            description: "Керівництво дизайн-проектами",
          },
        ],
      },
    ];

    // Удаляем всех пользователей и добавляем новых
    await User.deleteMany({});
    await User.insertMany(users);
    console.log("Users seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
