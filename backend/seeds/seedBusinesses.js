// seeds/seedBusinesses.js
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const Business = require("../models/Business");
const User = require("../models/User");
const Category = require("../models/Category");

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

async function seedBusinesses() {
  try {
    // Получаем пользователей и категории
    const users = await User.find().select("_id");
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.error("No users found! Please run seedUsers.js first.");
      process.exit(1);
    }

    // Получаем категории и выводим их для отладки
    const categories = await Category.find().select("_id name");
    console.log(
      `Found ${categories.length} categories:`,
      categories.map((c) => ({ id: c._id, name: c.name }))
    );

    if (categories.length === 0) {
      console.error("No categories found! Please run seedCategories.js first.");
      process.exit(1);
    }

    // Используем только существующие категории
    // Проверяем, есть ли нужные нам категории
    const itCategory = categories.find((c) => c.name === "ІТ та технології");
    const agriCategory = categories.find(
      (c) => c.name === "Сільське господарство"
    );
    const serviceCategory = categories.find((c) => c.name === "Послуги");
    const designCategory = categories.find(
      (c) => c.name === "Творчість та дизайн"
    );
    const productionCategory = categories.find((c) => c.name === "Виробництво");

    // Подготавливаем массив категорий для каждого бизнеса
    const techStartupCategories = [];
    const ecoFarmCategories = [];
    const designStudioCategories = [];

    if (itCategory) techStartupCategories.push(itCategory._id);
    if (serviceCategory) techStartupCategories.push(serviceCategory._id);

    if (agriCategory) ecoFarmCategories.push(agriCategory._id);
    if (productionCategory) ecoFarmCategories.push(productionCategory._id);

    if (designCategory) designStudioCategories.push(designCategory._id);
    if (serviceCategory) designStudioCategories.push(serviceCategory._id);

    // Подготавливаем бизнесы с реальными ID пользователей и категорий
    const businesses = [
      {
        name: "ТехСтартап",
        description:
          "Ми розробляємо інноваційні рішення для автоматизації бізнес-процесів.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
        location: "Київ, вул. Хрещатик",
        ownerId: users[0]._id,
        categories: techStartupCategories,
        email: "info@techstartup.ua",
        phone: "+380991234567",
        website: "https://techstartup.ua",
        coordinates: { latitude: 50.450001, longitude: 30.523333 },
      },
      {
        name: "ЕкоФерма",
        description: "Виробництво та доставка органічних продуктів харчування.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
        location: "Київська область, с. Нові Петрівці",
        ownerId: users[1]._id,
        categories: ecoFarmCategories,
        email: "contact@ecofarm.ua",
        phone: "+380997654321",
        website: "https://ecofarm.ua",
        coordinates: { latitude: 50.387278, longitude: 30.266418 },
      },
      {
        name: "ДизайнСтудія",
        description: "Креативна студія спеціалізується на графічному дизайні.",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
        location: "Київ, вул. Саксаганського",
        ownerId: users[2]._id,
        categories: designStudioCategories,
        email: "hello@designstudio.ua",
        phone: "+380998765432",
        website: "https://designstudio.ua",
        coordinates: { latitude: 50.43816, longitude: 30.515236 },
      },
    ];

    // Удаляем все бизнесы и добавляем новые
    await Business.deleteMany({});
    const result = await Business.insertMany(businesses);
    console.log(
      `Businesses seeded successfully: ${result.length} businesses created`
    );
    process.exit(0);
  } catch (error) {
    console.error("Error seeding businesses:", error);
    process.exit(1);
  }
}

seedBusinesses();
