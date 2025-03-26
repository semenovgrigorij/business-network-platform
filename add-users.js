// Скрипт для добавления тестовых пользователей

const { MongoClient } = require("mongodb");

async function addUsers() {
  const uri =
    "mongodb+srv://semenovgrigorij57:Balashova1946r@cluster0.tf5wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Используйте реальное имя вашей базы данных вместо "your_database"
    const database = client.db("test");

    // Используйте "users" или другое подходящее имя коллекции
    const usersCollection = database.collection("users");

    // Список тестовых пользователей для добавления
    const usersToAdd = [
      {
        name: "Олександр Петров",
        email: "oleksandr.petrov@example.com",
        phone: "+380501234567",
        password:
          "$2a$10$8KcMH2Bz6FU.yYN0J8qy8Oav5L8L5LCRcCYAI5MDvymMD3h5JkJSe", // хешированный пароль "password123"
        company: "IT Solutions Ukraine",
        position: "Директор",
        avatar: null,
        bio: "Підприємець з 10-річним досвідом в IT галузі",
        website: "https://it-solutions.ua",
        social: {
          linkedin: "https://linkedin.com/in/oleksandr-petrov",
          facebook: "https://facebook.com/oleksandr.petrov",
        },
        location: {
          city: "Київ",
          region: "Київська область",
          country: "Україна",
          address: "вул. Хрещатик, 10",
        },
        interests: ["IT технології", "Інновації", "Стартапи"],
        active: true,
        emailVerified: true,
        role: "business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Марія Коваленко",
        email: "maria.kovalenko@example.com",
        phone: "+380672345678",
        password:
          "$2a$10$8KcMH2Bz6FU.yYN0J8qy8Oav5L8L5LCRcCYAI5MDvymMD3h5JkJSe",
        company: "Агро Інвест",
        position: "Фінансовий директор",
        avatar: null,
        bio: "Фахівець з фінансового управління в аграрному секторі",
        website: "https://agroinvest.ua",
        social: {
          linkedin: "https://linkedin.com/in/maria-kovalenko",
        },
        location: {
          city: "Львів",
          region: "Львівська область",
          country: "Україна",
          address: "вул. Личаківська, 45",
        },
        interests: ["Аграрний бізнес", "Фінанси", "Інвестиції"],
        active: true,
        emailVerified: true,
        role: "business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Іван Мельник",
        email: "ivan.melnyk@example.com",
        phone: "+380633456789",
        password:
          "$2a$10$8KcMH2Bz6FU.yYN0J8qy8Oav5L8L5LCRcCYAI5MDvymMD3h5JkJSe",
        company: "Будівельна Компанія 'Основа'",
        position: "Керівник проектів",
        avatar: null,
        bio: "Будівельник з 15-річним досвідом, спеціаліст з управління великими проектами",
        website: "https://osnova-bud.ua",
        social: {
          linkedin: "https://linkedin.com/in/ivan-melnyk",
          facebook: "https://facebook.com/ivan.melnyk",
        },
        location: {
          city: "Одеса",
          region: "Одеська область",
          country: "Україна",
          address: "вул. Дерибасівська, 12",
        },
        interests: ["Будівництво", "Архітектура", "Управління проектами"],
        active: true,
        emailVerified: true,
        role: "business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Наталія Шевченко",
        email: "natalia.shevchenko@example.com",
        phone: "+380954567890",
        password:
          "$2a$10$8KcMH2Bz6FU.yYN0J8qy8Oav5L8L5LCRcCYAI5MDvymMD3h5JkJSe",
        company: "MeдЦентр Здоров'я",
        position: "Головний лікар",
        avatar: null,
        bio: "Лікар вищої категорії, керівник медичного центру",
        website: "https://med-health.ua",
        social: {
          linkedin: "https://linkedin.com/in/natalia-shevchenko",
          facebook: "https://facebook.com/natalia.shevchenko",
        },
        location: {
          city: "Дніпро",
          region: "Дніпропетровська область",
          country: "Україна",
          address: "просп. Гагаріна, 28",
        },
        interests: ["Медицина", "Охорона здоров'я", "Інновації в медицині"],
        active: true,
        emailVerified: true,
        role: "business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Юрій Ткаченко",
        email: "yurii.tkachenko@example.com",
        phone: "+380965678901",
        password:
          "$2a$10$8KcMH2Bz6FU.yYN0J8qy8Oav5L8L5LCRcCYAI5MDvymMD3h5JkJSe",
        company: "Логістик Плюс",
        position: "Директор з розвитку",
        avatar: null,
        bio: "Експерт з логістики та управління ланцюгами поставок",
        website: "https://logistic-plus.ua",
        social: {
          linkedin: "https://linkedin.com/in/yurii-tkachenko",
        },
        location: {
          city: "Харків",
          region: "Харківська область",
          country: "Україна",
          address: "вул. Сумська, 15",
        },
        interests: [
          "Логістика",
          "Міжнародні перевезення",
          "Оптимізація поставок",
        ],
        active: true,
        emailVerified: true,
        role: "business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        phone: "+380991234567",
        password:
          "$2a$10$8KcMH2Bz6FU.yYN0J8qy8Oav5L8L5LCRcCYAI5MDvymMD3h5JkJSe",
        company: "Business Network Platform",
        position: "Адміністратор системи",
        avatar: null,
        bio: "Адміністратор платформи",
        website: "",
        social: {},
        location: {
          city: "Київ",
          region: "Київська область",
          country: "Україна",
          address: "",
        },
        interests: ["Адміністрування", "Розробка ПЗ"],
        active: true,
        emailVerified: true,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Вставляем пользователей в базу данных
    const result = await usersCollection.insertMany(usersToAdd);

    console.log(`${result.insertedCount} пользователей добавлено`);
    console.log("Список добавленных пользователей:");

    // Получаем и выводим всех пользователей после вставки
    const users = await usersCollection.find({}).toArray();

    // Выводим основную информацию о каждом пользователе
    users.forEach((user) => {
      console.log(`ID: ${user._id}`);
      console.log(`Имя: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Роль: ${user.role}`);
      console.log(`Компания: ${user.company}`);
      console.log("---------------------------");
    });
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    await client.close();
    console.log("Соединение закрыто");
  }
}

// Запускаем функцию
addUsers();
