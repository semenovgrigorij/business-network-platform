// src/store/modules/reviews.js
import api from "@/services/api";

const state = {
  businessReviews: {},
  userReviews: [],
};

const getters = {
  getBusinessReviews: (state) => (businessId) => {
    console.log("Getting reviews for business:", businessId);
    console.log("Available business reviews:", state.businessReviews);
    const reviews = state.businessReviews[businessId] || [];
    console.log("Found reviews:", reviews);
    return reviews;
    // return state.businessReviews[businessId] || [];
  },

  getAverageRating: (state) => (businessId) => {
    const reviews = state.businessReviews[businessId] || [];
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  },

  getUserReviews: (state) => state.userReviews,

  hasUserReviewedBusiness: (state) => (businessId, userId) => {
    const reviews = state.businessReviews[businessId] || [];
    return reviews.some(
      (review) => review.userId && review.userId._id === userId
    );
  },
};

const mutations = {
  SET_BUSINESS_REVIEWS(state, { businessId, reviews }) {
    state.businessReviews = {
      ...state.businessReviews,
      [businessId]: reviews,
    };
  },

  SET_USER_REVIEWS(state, reviews) {
    state.userReviews = reviews;
  },

  ADD_REVIEW(state, { businessId, review }) {
    const reviews = state.businessReviews[businessId] || [];
    state.businessReviews = {
      ...state.businessReviews,
      [businessId]: [review, ...reviews],
    };
  },

  UPDATE_REVIEW(state, { businessId, updatedReview }) {
    const reviews = state.businessReviews[businessId] || [];
    const index = reviews.findIndex((r) => r._id === updatedReview._id);

    if (index !== -1) {
      const newReviews = [...reviews];
      newReviews[index] = updatedReview;

      state.businessReviews = {
        ...state.businessReviews,
        [businessId]: newReviews,
      };
    }
  },

  REMOVE_REVIEW(state, { businessId, reviewId }) {
    const reviews = state.businessReviews[businessId] || [];

    state.businessReviews = {
      ...state.businessReviews,
      [businessId]: reviews.filter((r) => r._id !== reviewId),
    };
  },
};

const actions = {
  async fetchBusinessReviews({ commit, dispatch }, businessId) {
    try {
      dispatch("setLoading", true, { root: true });
      console.log("Fetching reviews from API for business:", businessId);

      const response = await api.get(`/reviews/business/${businessId}`);
      console.log("API response for reviews:", response.data);
      commit("SET_BUSINESS_REVIEWS", { businessId, reviews: response.data });
      console.log("Reviews saved to store:", response.data);

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        dispatch("setError", "Сесія закінчилася. Будь ласка, увійдіть знову.", {
          root: true,
        });
      } else if (error.response && error.response.status === 404) {
        dispatch("setError", "Відгуки не знайдено", { root: true });
      } else {
        dispatch("setError", "Неможливо завантажити відгук", { root: true });
      }
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  async createReview({ commit, dispatch }, reviewData) {
    try {
      dispatch("setLoading", true, { root: true });
      console.log("Sending API request with data:", reviewData);

      const response = await api.post("/reviews", reviewData);
      commit("ADD_REVIEW", {
        businessId: reviewData.businessId,
        review: response.data,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }

      if (error.response && error.response.status === 400) {
        dispatch("setError", error.response.data.message, { root: true });
      } else {
        dispatch("setError", "Не вдалося створити відгук", { root: true });
      }

      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  async updateReview(
    { commit, dispatch },
    { reviewId, businessId, reviewData }
  ) {
    try {
      dispatch("setLoading", true, { root: true });

      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      commit("UPDATE_REVIEW", {
        businessId,
        updatedReview: response.data,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      dispatch("setError", "Не вдалося оновити відгук", { root: true });
      throw error;
    } finally {
      dispatch("setLoading", false, { root: true });
    }
  },

  async deleteReview({ commit, dispatch }, { reviewId, businessId }) {
    try {
      dispatch("setLoading", true, { root: true });

      await api.delete(`/reviews/${reviewId}`);
      commit("REMOVE_REVIEW", { businessId, reviewId });

      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      dispatch("setError", "Не вдалося видалити відгук", { root: true });
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
