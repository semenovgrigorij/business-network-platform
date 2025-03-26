<template>
  <v-card class="review-item mb-4" variant="outlined">
    <v-card-item>
      <v-card-title>
        <div class="d-flex align-center justify-space-between">
          <div>{{ review.title }}</div>
          <rating-display
            :value="review.rating.overall"
            size="small"
          ></rating-display>
        </div>
      </v-card-title>

      <v-card-subtitle>
        <div class="d-flex align-center">
          <v-avatar size="36" class="mr-2">
            <v-img
              v-if="review.userAvatar"
              :src="review.userAvatar"
              alt="Аватар користувача"
            ></v-img>
            <v-icon v-else>mdi-account</v-icon>
          </v-avatar>
          <div>
            <div>{{ review.userFullName }}</div>
            <div class="text-caption text-grey">{{ formattedDate }}</div>
          </div>
        </div>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <!-- Текст отзыва -->
      <p class="text-body-1 mb-4">{{ review.text }}</p>

      <!-- Преимущества и недостатки -->
      <div v-if="review.pros || review.cons" class="mb-4">
        <div v-if="review.pros" class="d-flex mb-2">
          <v-icon color="success" class="mr-2">mdi-thumb-up</v-icon>
          <div>
            <div class="font-weight-medium">Переваги:</div>
            <div>{{ review.pros }}</div>
          </div>
        </div>

        <div v-if="review.cons" class="d-flex">
          <v-icon color="error" class="mr-2">mdi-thumb-down</v-icon>
          <div>
            <div class="font-weight-medium">Недоліки:</div>
            <div>{{ review.cons }}</div>
          </div>
        </div>
      </div>

      <!-- Подробные рейтинги -->
      <v-expansion-panels v-if="showDetails" variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title> Детальні оцінки </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="d-flex flex-column gap-2">
              <div
                v-for="(criteria, key) in ratingCriteria"
                :key="key"
                class="d-flex align-center justify-space-between"
              >
                <span class="text-body-2">{{ criteria.label }}:</span>
                <rating-display
                  :value="review.rating[key]"
                  size="x-small"
                  :show-value="true"
                ></rating-display>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <div>
        <v-chip
          :color="review.recommended ? 'success' : 'error'"
          variant="outlined"
          size="small"
        >
          <v-icon start>{{
            review.recommended ? "mdi-thumb-up" : "mdi-thumb-down"
          }}</v-icon>
          {{ review.recommended ? "Рекомендує" : "Не Рекомендує" }}
        </v-chip>
      </div>

      <v-spacer></v-spacer>

      <!-- Действия, если пользователь является автором отзыва -->
      <div v-if="isAuthor">
        <v-btn
          variant="text"
          color="primary"
          size="small"
          @click="$emit('edit')"
        >
          <v-icon class="mr-1">mdi-pencil</v-icon>
          Редагувати
        </v-btn>

        <v-btn variant="text" color="error" size="small" @click="confirmDelete">
          <v-icon class="mr-1">mdi-delete</v-icon>
          Видалити
        </v-btn>
      </div>
    </v-card-actions>

    <!-- Діалог підтвердження видалення -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Підтвердження видалення </v-card-title>
        <v-card-text>
          Ви впевнені, що хочете видалити цей відгук? Ця дія не буде скасувати.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">
            Скасування
          </v-btn>
          <v-btn color="error" @click="deleteReview" :loading="isDeleting">
            Видалити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import RatingDisplay from "./RatingDisplay.vue";
import { mapGetters } from "vuex";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";

export default {
  name: "ReviewItem",

  components: {
    RatingDisplay,
  },

  props: {
    review: {
      type: Object,
      required: true,
    },
    showDetails: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      showDeleteDialog: false,
      isDeleting: false,

      // Критерии оценки
      ratingCriteria: {
        quality: { label: "Якість послуг/товарів" },
        reliability: { label: "Надійність" },
        communication: { label: "Комунікація" },
        value: { label: "Співвідношення ціна/якість" },
        overall: { label: "Загальна оцінка" },
      },
    };
  },

  computed: {
    ...mapGetters("auth", ["isAuthenticated", "currentUser"]),

    isAuthor() {
      return (
        this.isAuthenticated &&
        this.currentUser &&
        this.review.userId === this.currentUser.id
      );
    },

    formattedDate() {
      if (!this.review.createdAt) return "";

      try {
        const date = parseISO(this.review.createdAt);
        return format(date, "d MMMM yyyy р.", { locale: uk });
      } catch (error) {
        console.error("Помилка форматування дати:", error);
        return "Невірна дата";
      }
    },
  },

  methods: {
    confirmDelete() {
      this.showDeleteDialog = true;
    },

    async deleteReview() {
      this.isDeleting = true;

      try {
        await this.$store.dispatch("reviews/deleteReview", this.review.id);
        this.showDeleteDialog = false;
        this.$toasted.success("Відгук успішно видалено!");
        this.$emit("deleted");
      } catch (error) {
        console.error("Помилка при видаленні відгуку:", error);
        this.$toasted.error("Не вдалося видалити відгук");
      } finally {
        this.isDeleting = false;
      }
    },
  },
};
</script>

<style scoped>
.text-truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
<style>
.review-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.text-body-1 {
  white-space: pre-wrap;
}
.review-item {
  transition: all 0.3s ease;
}
</style>
