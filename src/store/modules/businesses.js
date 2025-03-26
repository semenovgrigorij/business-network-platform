import api from "@/services/api";

// Начальное состояние
const state = {
  businesses: [],
  business: null,
  categories: [],
  filters: {
    category: null,
    location: null,
    query: "",
    radius: 10, // Радиус поиска в км
    coordinates: null, // Координаты для поиска поблизости
  },
  nearbyBusinesses: [], // Результаты поиска поблизости
};

// Геттеры
const getters = {
  loading: (state) => state.loading,
  allBusinesses: (state) => state.businesses,
  businessById: (state) => (id) =>
    state.businesses.find((business) => business.id === id),
  currentBusiness: (state) => state.business,
  allCategories: (state) => state.categories,
  currentFilters: (state) => state.filters,
  nearbyBusinesses: (state) => state.nearbyBusinesses,

  filteredBusinesses: (state) => {
    let result = [...state.businesses];

    if (state.filters.category) {
      result = result.filter((business) =>
        business.categories.includes(state.filters.category)
      );
    }

    if (state.filters.location) {
      const location = state.filters.location.toLowerCase();
      result = result.filter((business) =>
        business.location.toLowerCase().includes(location)
      );
    }

    if (state.filters.query) {
      const query = state.filters.query.toLowerCase();
      result = result.filter(
        (business) =>
          business.name.toLowerCase().includes(query) ||
          business.description.toLowerCase().includes(query)
      );
    }

    // Если заданы координаты и радиус, фильтруем по расстоянию
    if (state.filters.coordinates) {
      const { latitude, longitude } = state.filters.coordinates;
      const radius = state.filters.radius || 10; // По умолчанию 10 км

      result = result.filter((business) => {
        if (!business.coordinates) return false;

        const distance = calculateDistance(
          latitude,
          longitude,
          business.coordinates.latitude,
          business.coordinates.longitude
        );

        return distance <= radius;
      });
    }

    return result;
  },
};

// Мутации
const mutations = {
  SET_BUSINESSES(state, business) {
    console.log("Setting business in state:", business);
    state.businesses = business;
  },
  SET_BUSINESS(state, business) {
    state.business = business;
  },
  ADD_BUSINESS(state, business) {
    state.businesses.push(business);
  },
  UPDATE_BUSINESS(state, updatedBusiness) {
    const index = state.businesses.findIndex(
      (b) => b.id === updatedBusiness.id
    );
    if (index !== -1) {
      state.businesses.splice(index, 1, updatedBusiness);
    }
    if (state.business && state.business.id === updatedBusiness.id) {
      state.business = updatedBusiness;
    }
  },
  REMOVE_BUSINESS(state, id) {
    state.businesses = state.businesses.filter((b) => b.id !== id);
    if (state.business && state.business.id === id) {
      state.business = null;
    }
  },
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  RESET_FILTERS(state) {
    state.filters = {
      category: null,
      location: null,
      query: "",
      radius: 10,
      coordinates: null,
    };
  },
  SET_NEARBY_BUSINESSES(state, businesses) {
    state.nearbyBusinesses = businesses;
  },
};

// Действия
const actions = {
  // Получение всех бизнесов
  async fetchBusinesses({ commit, dispatch }) {
    try {
      dispatch("setLoading", true, { root: true });

      const response = await api.get("/businesses");
      commit("SET_BUSINESSES", response.data);

      return response.data;
    } catch (error) {
      console.error("Помилка під час завантаження бізнесів:", error);
      dispatch("setError", "Не вдалося завантажити список бізнесів", {
        root: true,
      });
      return [];
    } finally {
      dispatch("setLoading", false, { root: true }); // Убедитесь, что эта линия всегда выполняется
    }
  },

  // Получение конкретного бизнеса по ID
  async fetchBusinessById({ commit, dispatch, state }, id) {
    const normalizedId = String(id);

    // Предотвращаем повторные запросы для одного и того же бизнеса
    if (state.business && String(state.business.id) === normalizedId) {
      console.log("Business already loaded, returning cached data");
      return state.business;
    }

    try {
      dispatch("setLoading", true, { root: true });

      console.log("Fetching business with ID:", id);
      const response = await api.get(`/businesses/${id}`);
      console.log("API Response:", response.data);

      if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error("API returned empty or invalid data");
      }

      commit("SET_BUSINESS", response.data);
      console.log("State after mutation:", state.business);

      return response.data;
    } catch (error) {
      console.error("Error in fetchBusinessById:", error.message);
      dispatch("setError", `Не вдалося знайти бізнес з ID ${id}`, {
        root: true,
      });
      return null;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },
  // Создание нового бизнеса
  async createBusiness({ commit, dispatch }, businessData) {
    try {
      dispatch("setLoading", true, { root: true });

      // Добавляем геокодирование, если есть адрес, но нет координат
      if (businessData.location && !businessData.coordinates) {
        businessData.coordinates = await dispatch(
          "geocodeAddress",
          businessData.location
        );
      }

      const response = await api.post("/businesses", businessData);
      commit("ADD_BUSINESS", response.data);

      return response.data;
    } catch (error) {
      dispatch("setError", "Не вдалося створити бізнес", { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Обновление бизнеса
  async updateBusiness({ commit, dispatch, rootGetters }, { id, data }) {
    try {
      dispatch("setLoading", true, { root: true });

      // Добавляем геокодирование, если адрес изменился
      if (data.location) {
        const currentBusiness = rootGetters["businesses/businessById"](id);
        if (
          !currentBusiness ||
          !currentBusiness.coordinates ||
          currentBusiness.location !== data.location
        ) {
          data.coordinates = await dispatch("geocodeAddress", data.location);
        }
      }

      const response = await api.put(`/businesses/${id}`, data);
      commit("UPDATE_BUSINESS", response.data);

      return response.data;
    } catch (error) {
      dispatch("setError", "Не вдалося оновити бізнес", { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Удаление бизнеса
  async searchBusinesses({ dispatch }, searchParams) {
    try {
      dispatch("setLoading", true, { root: true });

      // Добавьте проверку, какие параметры переданы, и выберите соответствующий API-эндпоинт
      const endpoint = searchParams.advanced
        ? "/businesses/search"
        : "/businesses";
      const response = await api.get(endpoint, { params: searchParams });

      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      dispatch("setError", "Не вдалося виконати пошук", { root: true });
      return [];
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Получение всех категорий
  // store/modules/businesses.js
  async fetchCategories({ commit }) {
    try {
      const response = await api.get("/categories");

      // Проверьте структуру ответа API
      console.log("API response for categories:", response.data);

      // Возможно, требуется преобразование данных
      const categories = response.data.map((category) => ({
        id: category.id,
        name: category.name,
        // Другие необходимые поля
      }));

      commit("SET_CATEGORIES", categories);
      return categories;
    } catch (error) {
      console.error("API error while fetching categories:", error);
      // Возможно, стоит вернуть моковые данные как запасной вариант
      const mockCategories = [
        // Ваши моковые категории
      ];
      commit("SET_CATEGORIES", mockCategories);
      return mockCategories;
    }
  },

  async advancedSearch({ dispatch }, searchParams) {
    try {
      dispatch("setLoading", true, { root: true });

      const response = await api.get("/businesses/search", {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      dispatch("setError", "Не вдалося виконати пошук", { root: true });
      return [];
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Установка фильтров
  setFilters({ commit }, filters) {
    commit("SET_FILTERS", filters);
  },

  // Сброс фильтров
  resetFilters({ commit }) {
    commit("RESET_FILTERS");
  },

  // Получение бизнесов поблизости
  async fetchNearbyBusinesses({ commit, dispatch, state }) {
    try {
      dispatch("setLoading", true, { root: true });

      if (!state.filters.coordinates) {
        throw new Error("Координати не вказані");
      }

      const { latitude, longitude } = state.filters.coordinates;
      const radius = state.filters.radius || 10; // По умолчанию 10 км

      // В API запрос с параметрами
      const response = await api.get("/businesses/nearby", {
        params: {
          latitude,
          longitude,
          radius,
        },
      });

      commit("SET_NEARBY_BUSINESSES", response.data);
      return response.data;
    } catch (error) {
      dispatch("setError", "Не вдалося знайти бізнеси поблизу", { root: true });
      return [];
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Геокодирование адреса (конвертация адреса в координаты)
  async geocodeAddress({ dispatch }, address) {
    try {
      console.log(`Геокодування адреси: ${address}`);

      // Вызов реального API для геокодирования
      const response = await api.get("/geocode", {
        params: { address },
      });

      return response.data;
    } catch (error) {
      dispatch("setError", `Помилка геокодування: ${error.message}`, {
        root: true,
      });

      // Возвращаем координаты центра Киева по умолчанию
      return {
        latitude: 50.450001,
        longitude: 30.523333,
      };
    }
  },
};

// Вспомогательная функция для расчета расстояния между двумя точками (формула гаверсинуса)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Перевод градусов в радианы
function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
