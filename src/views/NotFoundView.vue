<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h1 mb-4">404</h1>
        <h2 class="text-h4 mb-6">Сторінку не знайдено</h2>
        <p class="mb-8">Запитувана сторінка не існує або була переміщена.</p>
        <v-btn color="primary" :to="{ name: 'home' }" large>
          Повернутися на головну
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "NotFoundView",
};
</script>
