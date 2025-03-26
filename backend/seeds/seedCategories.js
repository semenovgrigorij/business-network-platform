const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Настраиваем путь к .env файлу
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Проверяем, загрузилась ли строка подключения
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI не найден в .env файле!");
  console.error("Текущая директория:", __dirname);
  process.exit(1);
}

const Category = require("../models/Category");

console.log("Подключение к MongoDB с URI:", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const categories = [
  {
    name: "ІТ та технології",
    icon: "mdi-laptop",
    description: "Технологічні компанії, IT-послуги, розробка ПЗ",
  },
  {
    name: "Сільске господарство",
    icon: "mdi-laptop",
    description: "Фермерські господарства, агропромислові підприємства.",
  },
  {
    name: "Будівництво",
    icon: "mdi-laptop",
    description: "Будівельні компанії, підрядники, архітектурні бюро.",
  },
  {
    name: "Фінанси та страхування",
    icon: "mdi-laptop",
    description: "Банки, страхові компанії, інвестиційні фонди.",
  },
  {
    name: "Транспорт та логістика",
    icon: "mdi-laptop",
    description: "Перевезення, логістичні компанії, складські послуги.",
  },
  {
    name: "Освіта",
    icon: "mdi-laptop",
    description: "Навчальні заклади, курси, тренінгові центри.",
  },
  {
    name: "Охорона здоров'я",
    icon: "mdi-laptop",
    description: "Медичні центри, клініки, аптеки, виробники ліків.",
  },
  {
    name: "Туризм та готельний бізнес",
    icon: "mdi-laptop",
    description: "Готелі, туристичні агенції, розважальні комплекси.",
  },
  {
    name: "Громадське харчування",
    icon: "mdi-laptop",
    description: "Ресторани, кафе, служби доставки їжі.",
  },
  {
    name: "Нерухомість",
    icon: "mdi-laptop",
    description:
      "Агентства нерухомості, будівельні компанії, управління нерухомістю.",
  },
  {
    name: "Консалтинг",
    icon: "mdi-laptop",
    description: "Бізнес-консультування, юридичні послуги, аудит.",
  },
  // ... остальные категории ...
];

async function seedCategories() {
  try {
    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log("Categories seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
