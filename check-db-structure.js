// Скрипт для проверки структуры базы данных
const { MongoClient } = require("mongodb");

async function checkDatabaseStructure() {
  const uri =
    "mongodb+srv://semenovgrigorij57:Balashova1946r@cluster0.tf5wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Получаем список всех баз данных
    const databasesList = await client.db().admin().listDatabases();

    console.log("Список баз данных:");
    databasesList.databases.forEach((db) => {
      console.log(` - ${db.name}`);
    });

    // Для каждой базы данных выводим список коллекций
    for (const dbInfo of databasesList.databases) {
      const dbName = dbInfo.name;

      // Пропускаем системные базы данных
      if (dbName === "admin" || dbName === "local" || dbName === "config") {
        continue;
      }

      console.log(`\nКоллекции в базе данных "${dbName}":`);

      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();

      if (collections.length === 0) {
        console.log(" - Коллекций не найдено");
      } else {
        collections.forEach((collection) => {
          console.log(` - ${collection.name}`);
        });

        // Проверим количество документов в каждой коллекции
        for (const collection of collections) {
          const count = await db.collection(collection.name).countDocuments();
          console.log(`   * ${collection.name}: ${count} документов`);
        }
      }
    }
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    await client.close();
    console.log("\nСоединение закрыто");
  }
}

// Запускаем функцию
checkDatabaseStructure();
