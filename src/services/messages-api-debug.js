/**
 * Проверка запроса создания беседы перед отправкой на сервер
 * @param {Object} conversationData - Данные для создания беседы
 * @returns {Object} Проверенные данные с соответствующими исправлениями
 */
export function validateConversationData(conversationData) {
  console.log("🔍 Проверка данных беседы:", conversationData);

  const validatedData = { ...conversationData };
  const errors = [];

  // Проверяем наличие recipientId
  if (!validatedData.recipientId) {
    errors.push("recipientId обязателен для создания беседы");
  }

  // Проверяем формат recipientId для групп
  if (
    validatedData.recipientType === "group" &&
    !String(validatedData.recipientId).startsWith("group_")
  ) {
    console.warn(
      '⚠️ recipientId для группы должен иметь префикс "group_", добавляем префикс'
    );
    validatedData.recipientId = `group_${validatedData.recipientId}`;
  }

  // Проверяем тип получателя
  if (!validatedData.recipientType) {
    console.warn('⚠️ recipientType не указан, используем "user" по умолчанию');
    validatedData.recipientType = "user";
  }

  // Проверяем, является ли recipientId числом для типа user
  if (
    validatedData.recipientType === "user" &&
    !validatedData.recipientId.toString().match(/^\d+$/)
  ) {
    errors.push(
      `recipientId для пользователя должен быть числом, получено: ${validatedData.recipientId}`
    );
  }

  // Проверяем, есть ли начальное сообщение
  if (!validatedData.initialMessage) {
    console.warn("⚠️ initialMessage отсутствует, используем пустую строку");
    validatedData.initialMessage = "";
  }

  // Выводим результаты проверки
  if (errors.length > 0) {
    console.error("❌ Ошибки в данных беседы:", errors);
    throw new Error(errors.join("; "));
  }

  console.log("✅ Данные проверены и исправлены:", validatedData);
  return validatedData;
}

/**
 * Перехватчик для отладки ошибок API сообщений
 * @param {Error} error - Объект ошибки
 */
export function handleMessagesApiError(error) {
  console.error("❌ Ошибка API сообщений:", error);

  if (error.response) {
    const { status, data } = error.response;
    console.error(`Статус ошибки: ${status}`);

    if (status === 400) {
      console.error("Ошибка валидации данных:");

      if (typeof data === "string") {
        console.error(`- ${data}`);
      } else if (typeof data === "object") {
        Object.entries(data).forEach(([field, message]) => {
          console.error(`- ${field}: ${message}`);
        });

        // Особая обработка для recipientId
        if (data.recipientId) {
          console.error("Рекомендуемый формат recipientId:");
          console.error("- Для пользователей: просто ID (число)");
          console.error('- Для групп: "group_" + ID (например, "group_123")');
        }
      }
    }
  } else if (error.request) {
    console.error("Запрос был отправлен, но ответ не получен:", error.request);
    console.error("Возможно проблема с соединением или сервер не отвечает");
  } else {
    console.error("Ошибка настройки запроса:", error.message);
  }

  // Возвращаем ошибку для дальнейшей обработки
  return error;
}
