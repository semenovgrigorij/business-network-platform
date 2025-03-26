// Скрипт для получения ID пользователей из MongoDB
const { MongoClient } = require("mongodb");

async function getUserIds() {
  const uri =
    "mongodb+srv://semenovgrigorij57:Balashova1946r@cluster0.tf5wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Замените "your_database" на имя вашей базы данных
    const database = client.db("test");

    // Замените "users" на имя коллекции с пользователями
    const usersCollection = database.collection("users");

    // Получаем всех пользователей
    const users = await usersCollection.find({}).toArray();

    console.log(`Найдено ${users.length} пользователей:`);

    // Выводим ID и базовую информацию о каждом пользователе
    users.forEach((user) => {
      console.log(
        `ID: ${user._id}, Имя: ${user.name || "Не указано"}, Email: ${
          user.email || "Не указано"
        }`
      );
    });

    // Можно также вернуть только ID пользователей
    const userIds = users.map((user) => user._id);
    console.log("\nСписок всех ID пользователей:");
    console.log(userIds);

    return users;
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    await client.close();
    console.log("Соединение закрыто");
  }
}

// Запускаем функцию
getUserIds();
