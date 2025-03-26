// store/modules/groups.js
import axios from "axios";

// Начальное состояние
const state = {
  groups: [],
  userGroups: [],
  currentGroup: null,
  groupMembers: [],
};

// Геттеры
const getters = {
  allGroups: (state) => state.groups,
  userGroups: (state) => state.userGroups,
  groupById: (state) => (id) => state.groups.find((group) => group.id === id),
  currentGroup: (state) => state.currentGroup,
  groupMembers: (state) => state.groupMembers,
  isUserMember: (state, getters, rootState, rootGetters) => {
    if (!state.currentGroup || !rootGetters["auth/isAuthenticated"]) {
      return false;
    }
    const userId = rootGetters["auth/currentUser"].id;
    return state.groupMembers.some((member) => member.id === userId);
  },
};

// Мутации
const mutations = {
  SET_GROUPS(state, groups) {
    state.groups = groups;
  },
  SET_USER_GROUPS(state, groups) {
    state.userGroups = groups;
  },
  SET_CURRENT_GROUP(state, group) {
    state.currentGroup = group;
  },
  SET_GROUP_MEMBERS(state, members) {
    state.groupMembers = members;
  },
  ADD_GROUP(state, group) {
    state.groups.push(group);
  },
  UPDATE_GROUP(state, updatedGroup) {
    const index = state.groups.findIndex((g) => g.id === updatedGroup.id);
    if (index !== -1) {
      state.groups.splice(index, 1, updatedGroup);
    }

    const userIndex = state.userGroups.findIndex(
      (g) => g.id === updatedGroup.id
    );
    if (userIndex !== -1) {
      state.userGroups.splice(userIndex, 1, updatedGroup);
    }

    if (state.currentGroup && state.currentGroup.id === updatedGroup.id) {
      state.currentGroup = updatedGroup;
    }
  },
  REMOVE_GROUP(state, id) {
    state.groups = state.groups.filter((g) => g.id !== id);
    state.userGroups = state.userGroups.filter((g) => g.id !== id);

    if (state.currentGroup && state.currentGroup.id === id) {
      state.currentGroup = null;
    }
  },
  ADD_GROUP_MEMBER(state, member) {
    state.groupMembers.push(member);
  },
  REMOVE_GROUP_MEMBER(state, userId) {
    state.groupMembers = state.groupMembers.filter(
      (member) => member.id !== userId
    );
  },
};

// Действия
const actions = {
  // Получение всех групп
  async fetchGroups({ commit, dispatch }) {
    try {
      dispatch("setLoading", true, { root: true });

      const response = await axios.get("/api/groups");
      commit("SET_GROUPS", response.data);

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        dispatch("setError", "Сессия истекла. Пожалуйста, войдите снова.", {
          root: true,
        });
      } else if (error.response && error.response.status === 404) {
        dispatch("setError", "Группы не найдены", { root: true });
      } else {
        dispatch("setError", "Не удалось загрузить группы", { root: true });
      }
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Получение групп текущего пользователя
  async fetchUserGroups({ commit, dispatch, rootGetters }) {
    try {
      dispatch("setLoading", true, { root: true });

      const userId = rootGetters["auth/currentUser"].id;
      const token = rootGetters["auth/userToken"];

      const response = await axios.get(`/api/users/${userId}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      commit("SET_USER_GROUPS", response.data);

      return response.data;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Получение конкретной группы по ID
  async fetchGroupById({ commit, dispatch }, id) {
    try {
      dispatch("setLoading", true, { root: true });

      const response = await axios.get(`/api/groups/${id}`);
      commit("SET_CURRENT_GROUP", response.data);

      return response.data;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Получение участников группы
  async fetchGroupMembers({ commit, dispatch }, groupId) {
    try {
      dispatch("setLoading", true, { root: true });

      const response = await axios.get(`/api/groups/${groupId}/members`);
      commit("SET_GROUP_MEMBERS", response.data);

      return response.data;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Создание новой группы
  async createGroup({ commit, dispatch, rootGetters }, groupData) {
    try {
      dispatch("setLoading", true, { root: true });

      const token = rootGetters["auth/userToken"];
      const response = await axios.post("/api/groups", groupData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      commit("ADD_GROUP", response.data);

      return response.data;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Обновление группы
  async updateGroup({ commit, dispatch, rootGetters }, { id, data }) {
    try {
      dispatch("setLoading", true, { root: true });

      const token = rootGetters["auth/userToken"];
      const response = await axios.put(`/api/groups/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      commit("UPDATE_GROUP", response.data);

      return response.data;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Удаление группы
  async deleteGroup({ commit, dispatch, rootGetters }, id) {
    try {
      dispatch("setLoading", true, { root: true });

      const token = rootGetters["auth/userToken"];
      await axios.delete(`/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      commit("REMOVE_GROUP", id);

      return true;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Присоединение к группе
  async joinGroup({ commit, dispatch, rootGetters, state }, groupId) {
    try {
      dispatch("setLoading", true, { root: true });

      const token = rootGetters["auth/userToken"];
      const userId = rootGetters["auth/currentUser"].id;

      await axios.post(
        `/api/groups/${groupId}/members`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Обновляем список групп пользователя
      dispatch("fetchUserGroups");

      // Если мы находимся в контексте группы, добавляем пользователя в список участников
      if (state.currentGroup && state.currentGroup.id === groupId) {
        const user = rootGetters["auth/currentUser"];
        commit("ADD_GROUP_MEMBER", user);
      }

      return true;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  // Выход из группы
  async leaveGroup({ commit, dispatch, rootGetters, state }, groupId) {
    try {
      dispatch("setLoading", true, { root: true });

      const token = rootGetters["auth/userToken"];
      const userId = rootGetters["auth/currentUser"].id;

      await axios.delete(`/api/groups/${groupId}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Обновляем список групп пользователя
      dispatch("fetchUserGroups");

      // Если мы находимся в контексте группы, удаляем пользователя из списка участников
      if (state.currentGroup && state.currentGroup.id === groupId) {
        commit("REMOVE_GROUP_MEMBER", userId);
      }

      return true;
    } catch (error) {
      dispatch("setError", error.message, { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
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
