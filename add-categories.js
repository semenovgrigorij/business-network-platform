// Скрипт для проверки категорий в базе данных
const { MongoClient } = require("mongodb");

async function addCategories() {
  const uri =
    "mongodb+srv://semenovgrigorij57:Balashova1946r@cluster0.tf5wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Замените "your_database" на имя вашей базы данных
    const database = client.db("test");

    // Замените "categories" на имя вашей коллекции
    const categoriesCollection = database.collection("categories");

    // Список категорий для добавления
    const categoriesToAdd = [
      {
        name: "IT та технології",
        icon: "mdi-laptop",
        description: "Технологічні компанії, IT-послуги, розробка ПЗ",
        createdAt: new Date(),
      },
      {
        name: "Сільське господарство",
        icon: "mdi-tractor",
        description: "Фермерські господарства, агропромислові підприємства",
        createdAt: new Date(),
      },
      {
        name: "Будівництво",
        icon: "mdi-hammer",
        description: "Будівельні компанії, підрядники, архітектурні бюро",
        createdAt: new Date(),
      },
      {
        name: "Фінанси та страхування",
        icon: "mdi-currency-usd",
        description: "Банки, страхові компанії, інвестиційні фонди",
        createdAt: new Date(),
      },
      {
        name: "Транспорт та логістика",
        icon: "mdi-truck",
        description: "Перевезення, логістичні компанії, складські послуги",
        createdAt: new Date(),
      },
      {
        name: "Освіта",
        icon: "mdi-school",
        description: "Навчальні заклади, курси, тренінгові центри",
        createdAt: new Date(),
      },
      {
        name: "Охорона здоров'я",
        icon: "mdi-hospital-box",
        description: "Медичні центри, клініки, аптеки, виробники ліків",
        createdAt: new Date(),
      },
      {
        name: "Туризм та готельний бізнес",
        icon: "mdi-bed",
        description: "Готелі, туристичні агенції, розважальні комплекси",
        createdAt: new Date(),
      },
      {
        name: "Громадське харчування",
        icon: "mdi-food",
        description: "Ресторани, кафе, служби доставки їжі",
        createdAt: new Date(),
      },
      {
        name: "Нерухомість",
        icon: "mdi-home-city",
        description:
          "Агентства нерухомості, будівельні компанії, управління нерухомістю",
        createdAt: new Date(),
      },
      {
        name: "Консалтинг",
        icon: "mdi-account-tie",
        description: "Бізнес-консультування, юридичні послуги, аудит",
        createdAt: new Date(),
      },
    ];

    // Вставляем категории в базу данных
    const result = await categoriesCollection.insertMany(categoriesToAdd);

    console.log(`${result.insertedCount} categories were inserted`);
    console.log("Inserted categories:");

    // Получаем и выводим все категории после вставки
    const categories = await categoriesCollection.find({}).toArray();
    console.log(JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

addCategories();
