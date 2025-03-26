<template>
  <div class="review-form">
    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitReview">
      <h3 class="text-h6 mb-3">
        {{ isEdit ? "Редагування відгуку" : "Написати відгук" }}
      </h3>

      <!-- Оценки по критериям -->
      <div class="rating-criteria mb-4">
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="4"
            v-for="(criteria, key) in ratingCriteria"
            :key="key"
          >
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">{{ criteria.label }}:</span>
              <v-rating
                v-model="rating[key]"
                color="amber"
                hover
                :length="5"
                :size="28"
                aria-label="Оцінка за критерієм"
              ></v-rating>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Поле для текста отзыва -->
      <v-textarea
        v-model="text"
        label="Ваш відгук"
        placeholder="Поділіться своїм досвідом роботи з цим бізнесом."
        :rules="textRules"
        counter="1000"
        auto-grow
        rows="4"
        variant="outlined"
        class="mb-4"
      ></v-textarea>

      <!-- Заголовок отзыва -->
      <v-text-field
        v-model="title"
        label="Заголовок відгуку"
        placeholder="Коротко опишіть свій досвід"
        :rules="titleRules"
        variant="outlined"
        class="mb-4"
      ></v-text-field>

      <!-- Рекомендация -->
      <div class="mb-4">
        <label class="text-subtitle-1 mb-2 d-block"
          >Чи рекомендуєте ви цей бізнес?</label
        >
        <v-btn-toggle
          v-model="recommended"
          color="primary"
          mandatory
          variant="outlined"
        >
          <v-btn :value="true" prepend-icon="mdi-thumb-up"> Так </v-btn>
          <v-btn :value="false" prepend-icon="mdi-thumb-down"> Ні </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Переваги та недоліки -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="pros"
            label="Переваги"
            placeholder="Що вам сподобалось?"
            variant="outlined"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="cons"
            label="недоліки"
            placeholder="Що можна покращити?"
            variant="outlined"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Кнопки действий -->
      <div class="d-flex justify-end mt-4">
        <v-btn variant="outlined" class="me-2" @click="$emit('cancel')">
          Скасування
        </v-btn>

        <v-btn
          color="primary"
          type="submit"
          :loading="isSubmitting"
          :disabled="!isFormValid"
        >
          {{ isEdit ? "Зберегти зміни" : "Опублікувати відгук" }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
export default {
  name: "ReviewForm",

  props: {
    businessId: {
      type: [Number, String],
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    reviewData: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      isFormValid: false,
      isSubmitting: false,

      // Данные отзыва
      title: "",
      text: "",
      recommended: true,
      pros: "",
      cons: "",

      // Рейтинги
      rating: {
        quality: 5,
        reliability: 5,
        communication: 5,
        value: 5,
        overall: 5,
      },

      // Критерии оценки
      ratingCriteria: {
        quality: { label: "Якість послуг/товарів" },
        reliability: { label: "Надійність" },
        communication: { label: "Комунікація" },
        value: { label: "Співвідношення ціна/якість" },
        overall: { label: "Загальна оцінка" },
      },

      // Правила валидации
      titleRules: [
        (v) => !!v || "Заголовок обов'язковий",
        (v) => v.length >= 5 || "Заголовок має містити не менше 5 символів",
        (v) => v.length <= 100 || "Заголовок має бути коротшим за 100 символів",
      ],
      textRules: [
        (v) => !!v || "Текст відгуку є обов'язковим",
        (v) =>
          v.length >= 20 || "Відгук повинен містити щонайменше 20 символів",
        (v) =>
          v.length <= 1000 || "Відгук повинен бути коротшим за 1000 символів",
      ],
    };
  },

  watch: {
    reviewData: {
      immediate: true,
      handler(data) {
        if (data) {
          this.title = data.title || "";
          this.text = data.text || "";
          this.recommended =
            data.recommended !== undefined ? data.recommended : true;
          this.pros = data.pros || "";
          this.cons = data.cons || "";

          // Заполняем рейтинги
          if (data.rating) {
            this.rating = { ...this.rating, ...data.rating };
          }
        }
      },
    },
  },

  methods: {
    async submitReview() {
      if (!this.$refs.form.validate()) {
        this.$toasted.error("Будь ласка, заповніть всі обов'язкові поля");
        return;
      }

      this.isSubmitting = true;

      try {
        const reviewData = {
          businessId: this.businessId,
          title: this.title,
          text: this.text,
          rating: this.rating,
          recommended: this.recommended,
          pros: this.pros,
          cons: this.cons,
        };

        console.log(
          "Sending review data:",
          JSON.stringify(reviewData, null, 2)
        );

        // Проверяем, редактирование или создание
        if (this.isEdit && this.reviewData && this.reviewData.id) {
          await this.$store.dispatch("reviews/updateReview", {
            reviewId: this.reviewData.id,
            reviewData,
          });
          this.$toasted.success("Відгук успішно оновлено!");
        } else {
          await this.$store.dispatch("reviews/createReview", reviewData);
          this.$toasted.success("Відгук успішно опубліковано!");
        }

        // Очищаем форму
        if (!this.isEdit) {
          this.resetForm();
        }

        // Отправляем событие успешного сохранения
        this.$emit("saved");
      } catch (error) {
        console.error("Помилка при збереженні відгуку:", error);
        const errorMessage =
          error.response?.data?.message || "Не вдалося зберегти відгук";
        this.$toasted.error(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.title = "";
      this.text = "";
      this.recommended = true;
      this.pros = "";
      this.cons = "";
      this.rating = {
        quality: 5,
        reliability: 5,
        communication: 5,
        value: 5,
        overall: 5,
      };

      this.$refs.form.reset();
    },
  },
};
</script>
<style>
.review-form {
  max-width: 600px;
  margin: 0 auto;
}

.rating-criteria {
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 8px;
}
.rating-criteria {
  transition: all 0.3s ease;
}
</style>
