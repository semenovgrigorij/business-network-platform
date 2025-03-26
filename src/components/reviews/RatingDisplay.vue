<template>
  <div class="rating-display">
    <!-- Отображение рейтинга звездами -->
    <div class="d-flex align-center">
      <v-rating
        v-model="displayValue"
        :length="5"
        readonly
        :size="size"
        color="amber"
        half-increments
        density="compact"
        aria-label="Рейтинг"
      ></v-rating>

      <div v-if="showValue" class="ml-2 text-subtitle-1 font-weight-medium">
        {{ formattedValue }}
      </div>

      <div v-if="label" class="ms-2 text-caption text-medium-emphasis">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RatingDisplay",

  props: {
    value: {
      type: [Number, String],
      default: 0,
    },
    size: {
      type: String,
      default: "small",
    },
    showValue: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: "",
    },
  },

  computed: {
    formattedValue() {
      const value = parseFloat(this.value);
      if (isNaN(value) || value < 0 || value > 5) {
        return "0.0"; // Возвращаем значение по умолчанию для некорректных данных
      }
      return value.toFixed(1);
    },
  },
};
</script>
<style>
.rating-display {
  transition: opacity 0.3s ease;
}
</style>
