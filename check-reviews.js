// Скрипт для проверки отзывов в базе данных
const { MongoClient } = require("mongodb");

async function checkReviews() {
  const uri =
    "mongodb+srv://semenovgrigorij57:Balashova1946r@cluster0.tf5wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Замените "your_database" на имя вашей базы данных
    const database = client.db("test");

    // Замените "reviews" на имя вашей коллекции отзывов
    const reviewsCollection = database.collection("reviews");

    // ID бизнеса, для которого ищем отзывы
    const businessId = "67e01d6d48a284cce64b3820";

    // Получаем все отзывы для конкретного бизнеса
    const reviews = await reviewsCollection
      .find({ businessId: businessId })
      .toArray();

    console.log(`Found ${reviews.length} reviews for business ${businessId}:`);
    console.log(JSON.stringify(reviews, null, 2));

    // Если отзывов нет, вы можете добавить тестовый отзыв
    if (reviews.length === 0) {
      console.log(
        "No reviews found. Would you like to add a test review? (y/n)"
      );
      // Здесь можно добавить логику для ввода с консоли
      // Пример добавления тестового отзыва:
      /*
      const testReview = {
        businessId: businessId,
        userId: {
          _id: "user123",
          firstName: "Тестовий",
          lastName: "Користувач",
          avatar: "/images/placeholders/user-avatar.jpg"
        },
        rating: 4.5,
        title: "Відмінний сервіс",
        text: "Дуже хороший бізнес! Рекомендую всім.",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await reviewsCollection.insertOne(testReview);
      console.log(`Test review inserted with id: ${result.insertedId}`);
      */
    }

    // Проверяем структуру коллекции для понимания схемы данных
    if (reviews.length > 0) {
      console.log("\nReview structure example:");
      console.log(Object.keys(reviews[0]));

      // Проверяем формат идентификаторов
      console.log("\nID formats:");
      console.log("Review ID:", reviews[0]._id, typeof reviews[0]._id);
      if (reviews[0].userId) {
        console.log(
          "User ID:",
          reviews[0].userId._id || reviews[0].userId.id,
          typeof (reviews[0].userId._id || reviews[0].userId.id)
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

checkReviews();
