// store/modules/auth.js
import axios from "axios";

// store/modules/auth.js

// Исходное состояние
const state = {
  token: null,
  user: null,
};

// Геттеры
const getters = {
  isAuthenticated: (state) => !!state.token,
  token: (state) => state.token,
  currentUser: (state) => state.user,
};

// Мутации
const mutations = {
  SET_AUTH(state, { token, user }) {
    state.token = token;
    state.user = user;
  },
};

// Действия
const actions = {
  // Вход пользователя (ваш существующий код)
  async login({ commit, dispatch }, credentials) {
    try {
      dispatch("setLoading", true, { root: true });

      // Пытаемся сделать запрос к API
      try {
        const response = await axios.post("/api/auth/login", credentials);

        // Сохраняем токен в localStorage
        localStorage.setItem("token", response.data.token);

        commit("SET_AUTH", {
          token: response.data.token,
          user: response.data.user,
        });

        return response.data;
      } catch (error) {
        console.error("Ошибка при отправке запроса на вход:", error);

        // Моковые пользователи для тестирования
        const mockUsers = [
          {
            id: 1,
            email: "user@example.com",
            password: "password",
            firstName: "Олександр",
            lastName: "Петренко",
            avatar: null,
            role: "user",
          },
          {
            id: 2,
            email: "admin@example.com",
            password: "admin",
            firstName: "Адміністратор",
            lastName: "Системи",
            avatar: null,
            role: "admin",
          },
        ];

        // Проверяем, есть ли пользователь с такими данными
        const user = mockUsers.find((u) => u.email === credentials.email);

        if (user) {
          // В реальном приложении здесь была бы проверка пароля
          // Для демо считаем, что любой пароль подходит

          const mockToken = `mock-token-${Date.now()}-${user.id}`;

          // Удаляем пароль из данных пользователя перед сохранением
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;

          // Сохраняем токен в localStorage
          localStorage.setItem("token", mockToken);

          commit("SET_AUTH", {
            token: mockToken,
            user: userWithoutPassword,
          });

          return { token: mockToken, user: userWithoutPassword };
        } else {
          // Если пользователь не найден, возвращаем ошибку
          throw new Error("Неверный email или пароль");
        }
      }
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Выход пользователя
  async logout({ commit }) {
    // Удаляем токен из localStorage
    localStorage.removeItem("token");

    // Очищаем данные пользователя в хранилище
    commit("SET_AUTH", {
      token: null,
      user: null,
    });
  },

  // Инициализация аутентификации - ДОБАВЬТЕ ЭТОТ МЕТОД
  async initAuth({ commit, dispatch }) {
    try {
      // Получаем токен из localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Токен не найден в localStorage");
        return;
      }

      console.log(
        "Найден токен в localStorage, пытаемся получить данные пользователя"
      );

      try {
        // В реальном приложении здесь был бы запрос к API для получения данных пользователя
        // const response = await axios.get('/api/auth/me', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // commit('SET_AUTH', { token, user: response.data });

        // Для демо версии просто устанавливаем токен с минимальными данными пользователя
        commit("SET_AUTH", {
          token,
          user: {
            id: 1,
            firstName: "Демо",
            lastName: "Користувач",
            role: "user",
          },
        });

        console.log("Аутентификация восстановлена из сохраненного токена");
      } catch (error) {
        console.error("Ошибка при восстановлении аутентификации:", error);

        // Если токен невалидный, удаляем его
        localStorage.removeItem("token");
        commit("SET_AUTH", { token: null, user: null });
      }
    } catch (error) {
      console.error("Ошибка при инициализации аутентификации:", error);
      dispatch("setError", "Ошибка при инициализации аутентификации", {
        root: true,
      });
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
