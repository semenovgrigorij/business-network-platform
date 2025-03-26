<template>
  <div class="rating-histogram">
    <div v-for="i in 5" :key="i" class="d-flex align-center mb-1">
      <div class="rating-label">
        {{ 6 - i }} <v-icon small color="amber">mdi-star</v-icon>
      </div>

      <div class="rating-bar">
        <v-progress-linear
          :model-value="calculatePercentage(6 - i)"
          height="8"
          color="amber"
          rounded
          role="progressbar"
          :aria-valuenow="calculatePercentage(6 - i)"
          aria-valuemin="0"
          aria-valuemax="100"
        ></v-progress-linear>
      </div>

      <div class="rating-count ms-2 text-body-2">
        {{ distribution[6 - i] || 0 }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RatingHistogram",

  props: {
    distribution: {
      type: Object,
      default: () => ({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }),
      validator: (value) => {
        return [1, 2, 3, 4, 5].every((key) => key in value);
      },
    },
  },

  methods: {
    calculatePercentage(rating) {
      const total = Object.values(this.distribution).reduce(
        (sum, count) => sum + count,
        0
      );
      if (total === 0 || !this.distribution[rating]) {
        return 0; // Возвращаем 0, если нет данных или рейтинг отсутствует
      }
      return Math.round((this.distribution[rating] / total) * 100);
    },
  },
};
</script>

<style scoped>
.rating-histogram {
  width: 100%;
}

.rating-label {
  width: 45px;
  text-align: center;
}

.rating-bar {
  flex-grow: 1;
  margin: 0 8px;
}

.rating-count {
  width: 30px;
  text-align: right;
}
.rating-bar {
  transition: all 0.3s ease;
}
</style>
