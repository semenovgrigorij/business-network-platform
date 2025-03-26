// services/api.js

import axios from "axios";
import store from "@/store"; // Импортируем хранилище
import router from "@/router"; // Импортируем роутер для перенаправления

// Определяем базовый URL в зависимости от окружения
const getBaseURL = () => {
  // В продакшене берем URL из переменной окружения
  if (process.env.NODE_ENV === "production") {
    return process.env.VUE_APP_API_URL || "/api";
  }

  // Для разработки используем локальный сервер
  return process.env.VUE_APP_API_URL || "http://localhost:5000/api";
};

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем перехватчик запросов для добавления токена
api.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage (предпочтительнее) или из Vuex
    const token = localStorage.getItem("token") || store.getters["auth/token"];

    if (token) {
      // Добавляем токен к заголовку Authorization
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Токен добавлен к запросу:", config.url);
    } else {
      console.warn("Токен не найден при отправке запроса к:", config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки ошибок аутентификации
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // В продакшене не выводим подробные сообщения об ошибках
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ API Error:", error);

      if (error.response) {
        // Выводим информацию об ошибке
        console.error(`Status: ${error.response.status}`);
        console.error("Response headers:", error.response.headers);
        console.error("Response data:", error.response.data);
      }
    } else {
      // В продакшене выводим только минимальную информацию
      console.error("API Error:", error.message);
    }

    if (error.response && error.response.status === 401) {
      console.warn(
        "🔒 Ошибка авторизации. Перенаправление на страницу входа..."
      );

      // Выход пользователя из системы
      store.dispatch("auth/logout");

      // Перенаправление на страницу входа с сохранением текущего пути для возврата
      const currentPath = router.currentRoute.fullPath;
      router.push({
        name: "Login",
        query: {
          redirect: currentPath !== "/login" ? currentPath : undefined,
        },
      });
    }

    return Promise.reject(error);
  }
);

export default api;
