<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <div>
        Відгуки ({{ reviews.length }})
        <rating-display
          v-if="reviews.length > 0"
          :value="averageRating"
          size="small"
          :show-value="true"
          class="ml-2"
        ></rating-display>
      </div>

      <v-btn
        v-if="isAuthenticated && !hasUserReview"
        color="primary"
        size="small"
        @click="showAddReviewDialog = true"
      >
        Залишити відгук
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text v-if="isLoading">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
        <p>Завантаження відгуків...</p>
      </div>
    </v-card-text>

    <v-card-text v-else-if="reviews.length > 0">
      <div v-for="review in adaptedReviews" :key="review.id">
        <!-- Используйте компонент ReviewItem, если он доступен -->
        <review-item
          v-if="$options.components.ReviewItem"
          :review="review"
          @edit="editReview"
          @deleted="fetchBusinessReviews(businessId)"
        ></review-item>

        <!-- Резервное отображение, если компонент ReviewItem недоступен -->
        <v-card v-else class="mb-4">
          <v-card-title>{{ review.title || "Відгук" }}</v-card-title>
          <v-card-subtitle>
            <div class="d-flex align-center">
              <v-avatar size="36" class="mr-2">
                <v-img
                  v-if="review.userAvatar"
                  :src="review.userAvatar"
                ></v-img>
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              <div>{{ review.userFullName || "Користувач" }}</div>
            </div>
          </v-card-subtitle>
          <v-card-text>
            <p>{{ review.text }}</p>
            <div class="mt-2">
              <v-rating
                :model-value="review.rating?.overall || review.rating"
                color="amber"
                density="compact"
                readonly
              ></v-rating>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
    <template v-else>
      <div>
        <div v-if="reviews.length > 0">
          <!-- Здесь можно добавить RatingHistogram -->
          <rating-histogram
            v-if="ratingDistribution"
            :distribution="ratingDistribution"
            class="mb-4"
          ></rating-histogram>

          <!-- Список отзывов -->
          <review-item
            v-for="review in adaptedReviews"
            :key="review.id"
            :review="review"
            @edit="editReview(review)"
            @deleted="fetchBusinessReviews(businessId)"
          ></review-item>
        </div>

        <!-- Форма добавления отзыва -->
        <review-form
          v-if="$options.components.ReviewForm"
          :business-id="businessId"
          :is-edit="editMode"
          :review-data="editedReview"
          @saved="onReviewSaved"
          @cancel="onReviewCancelled"
        ></review-form>

        <v-btn
          v-else-if="isAuthenticated && !hasUserReview"
          color="primary"
          @click="showAddReviewForm = true"
        >
          Залишити відгук
        </v-btn>
      </div>
    </template>
    <!-- Диалог для добавления отзыва -->
    <v-dialog v-model="showAddReviewDialog" max-width="500px">
      <v-card>
        <v-card-title>Залишити відгук</v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-rating
              v-model="newReview.rating"
              color="amber"
              hover
              length="5"
              size="large"
              :rules="[(v) => !!v || 'Рейтинг обов\'язковий']"
            ></v-rating>

            <v-textarea
              v-model="newReview.text"
              label="Ваш відгук"
              rows="4"
              counter="500"
              :rules="[
                (v) => !!v || 'Текст відгуку обов\'язковий',
                (v) => v.length >= 10 || 'Відгук має бути не менше 10 символів',
                (v) =>
                  v.length <= 500 || 'Відгук має бути не більше 500 символів',
              ]"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddReviewDialog = false">Скасувати</v-btn>
          <v-btn
            color="primary"
            :disabled="!valid || submitLoading"
            @click="submitReview"
          >
            <v-progress-circular
              v-if="submitLoading"
              indeterminate
              size="20"
              width="2"
              class="mr-2"
            ></v-progress-circular>
            Відправити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог для редактирования отзыва -->
    <v-dialog v-model="showEditReviewDialog" max-width="500px">
      <v-card>
        <v-card-title>Редагувати відгук</v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="editValid">
            <v-rating
              v-model="editedReview.rating"
              color="amber"
              hover
              length="5"
              size="large"
            ></v-rating>

            <v-textarea
              v-model="editedReview.text"
              label="Ваш відгук"
              rows="4"
              counter="500"
              :rules="[
                (v) => !!v || 'Текст відгуку обов\'язковий',
                (v) => v.length >= 10 || 'Відгук має бути не менше 10 символів',
                (v) =>
                  v.length <= 500 || 'Відгук має бути не більше 500 символів',
              ]"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showEditReviewDialog = false"
            >Скасувати</v-btn
          >
          <v-btn
            color="primary"
            :disabled="!editValid || submitLoading"
            @click="updateReviewSubmit"
          >
            <v-progress-circular
              v-if="submitLoading"
              indeterminate
              size="20"
              width="2"
              class="mr-2"
            ></v-progress-circular>
            Зберегти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Видалити відгук?</v-card-title>

        <v-card-text>
          Ви впевнені, що хочете видалити цей відгук? Цю дію неможливо
          скасувати.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false"
            >Скасувати</v-btn
          >
          <v-btn
            color="error"
            :loading="submitLoading"
            @click="deleteReviewConfirmed"
          >
            Видалити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import ReviewItem from "./reviews/ReviewItem.vue";
import ReviewForm from "./reviews/ReviewForm.vue";
import RatingHistogram from "./reviews/RatingHistogram.vue";
import RatingDisplay from "./reviews/RatingDisplay.vue";

export default {
  props: {
    businessId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      showAddReviewDialog: false,
      showEditReviewDialog: false,
      showDeleteDialog: false,
      valid: false,
      editValid: false,
      submitLoading: false,
      newReview: {
        rating: 0,
        text: "",
      },
      editedReview: {
        id: null,
        rating: 0,
        text: "",
      },
      reviewToDelete: null,
      showAddReviewForm: false,
      editMode: false,
    };
  },

  computed: {
    ...mapGetters(["isLoading"]),
    ...mapGetters("auth", ["isAuthenticated", "currentUser"]),
    ...mapGetters("reviews", ["getBusinessReviews", "getAverageRating"]),

    reviews() {
      return this.getBusinessReviews(this.businessId);
    },

    averageRating() {
      return this.getAverageRating(this.businessId);
    },

    hasUserReview() {
      if (!this.isAuthenticated || !this.currentUser) return false;

      return this.reviews.some(
        (review) =>
          review.userId &&
          (review.userId.id === this.currentUser.id ||
            review.userId._id === this.currentUser.id)
      );
    },

    adaptedReviews() {
      return this.reviews.map((review) => this.adaptReview(review));
    },

    ratingDistribution() {
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      this.reviews.forEach((review) => {
        const rating = Math.round(review.rating?.overall || review.rating || 0);
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++;
        }
      });

      return distribution;
    },
  },
  created() {
    console.log(
      "BusinessReviews component created with businessId:",
      this.businessId
    );
    // Проверяем, что businessId задан и передаём его
    if (this.businessId) {
      this.fetchBusinessReviews(this.businessId);
    } else {
      console.error("BusinessId not provided to BusinessReviews component");
    }
  },

  watch: {
    // Отслеживаем изменение businessId для перезагрузки отзывов при навигации между страницами
    businessId: {
      handler(newVal) {
        console.log("BusinessId changed to:", newVal);
        if (newVal) {
          this.fetchBusinessReviews(newVal);
        }
      },
      immediate: true,
    },

    reviews: {
      handler(newVal) {
        console.log("Reviews changed:", newVal);
        console.log("Adapted reviews:", this.adaptedReviews); // если у вас есть такое свойство
      },
    },
  },

  methods: {
    ...mapActions("reviews", [
      "fetchBusinessReviews",
      "createReview",
      "updateReview",
      "deleteReview",
    ]),

    formatDate(dateString) {
      if (!dateString) return "";

      const date = new Date(dateString);
      return new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    },

    isUserReview(review) {
      if (!this.currentUser || !review.userId) return false;

      // Проверяем оба варианта id
      return (
        review.userId.id === this.currentUser.id ||
        review.userId._id === this.currentUser.id
      );
    },
    async submitReview() {
      if (!this.$refs.form || !this.$refs.form.validate()) return;

      try {
        this.submitLoading = true;
        console.log("Submitting review for business:", this.businessId);

        // Отправляем запрос на создание отзыва
        await this.createReview({
          businessId: this.businessId,
          rating: this.newReview.rating,
          text: this.newReview.text,
        });

        // Закрываем диалог и сбрасываем форму
        this.showAddReviewDialog = false;
        this.newReview = { rating: 0, text: "" };

        if (this.$refs.form) {
          this.$refs.form.reset();
        }

        // Показываем уведомление об успехе
        if (this.$toasted) {
          this.$toasted.success("Дякуємо за ваш відгук!");
        } else {
          console.log("Success: Отзыв успешно добавлен");
        }
      } catch (error) {
        console.error("Помилка при створенні відгуку:", error);

        // Показываем уведомление об ошибке
        if (this.$toasted) {
          this.$toasted.error("Не вдалося залишити відгук");
        }
      } finally {
        this.submitLoading = false;
      }
    },

    editReview(review) {
      // Копируем данные отзыва для редактирования
      this.editedReview = {
        id: review.id || review._id,
        rating: review.rating,
        text: review.text,
      };
      this.showEditReviewDialog = true;
    },

    confirmDeleteReview(review) {
      this.reviewToDelete = review;
      this.showDeleteDialog = true;
    },
    async updateReviewSubmit() {
      if (!this.$refs.editForm || !this.$refs.editForm.validate()) return;

      try {
        this.submitLoading = true;

        await this.updateReview({
          id: this.editedReview.id,
          businessId: this.businessId,
          rating: this.editedReview.rating,
          text: this.editedReview.text,
        });

        this.showEditReviewDialog = false;

        // Показываем уведомление об успехе
        if (this.$toasted) {
          this.$toasted.success("Відгук оновлено успішно!");
        } else {
          console.log("Success: Отзыв успешно обновлен");
        }
      } catch (error) {
        console.error("Помилка при оновленні відгуку:", error);

        if (this.$toasted) {
          this.$toasted.error("Не вдалося оновити відгук");
        }
      } finally {
        this.submitLoading = false;
      }
    },

    async deleteReviewConfirmed() {
      if (!this.reviewToDelete) return;

      try {
        this.submitLoading = true;

        await this.deleteReview({
          id: this.reviewToDelete.id || this.reviewToDelete._id,
          businessId: this.businessId,
        });

        this.showDeleteDialog = false;
        this.reviewToDelete = null;

        if (this.$toasted) {
          this.$toasted.success("Відгук видалено успішно!");
        } else {
          console.log("Success: Отзыв успешно удален");
        }
      } catch (error) {
        console.error("Помилка при видаленні відгуку:", error);

        if (this.$toasted) {
          this.$toasted.error("Не вдалося видалити відгук");
        }
      } finally {
        this.submitLoading = false;
      }
    },

    adaptReview(review) {
      return {
        id: review.id || review._id,
        title: review.title || "Відгук", // Значение по умолчанию
        text: review.text,
        rating: review.rating || {
          overall: review.rating,
          quality: review.rating,
          reliability: review.rating,
          communication: review.rating,
          value: review.rating,
        },
        recommended:
          review.recommended !== undefined ? review.recommended : true,
        pros: review.pros || "",
        cons: review.cons || "",
        createdAt: review.createdAt,
        userId: review.userId && (review.userId.id || review.userId._id),
        userFullName: review.userId
          ? `${review.userId.firstName} ${review.userId.lastName}`
          : "Користувач",
        userAvatar: review.userId && review.userId.avatar,
      };
    },

    onReviewSaved() {
      this.showAddReviewForm = false;
      this.editMode = false;
      this.editedReview = null;
      this.fetchBusinessReviews(this.businessId);
    },

    onReviewCancelled() {
      this.showAddReviewForm = false;
      this.editMode = false;
      this.editedReview = null;
    },
  },

  components: {
    ReviewItem,
    ReviewForm,
    RatingHistogram,
    RatingDisplay,
  },
};
</script>

<style scoped>
.v-rating .v-icon {
  padding: 0 2px;
}
</style>
