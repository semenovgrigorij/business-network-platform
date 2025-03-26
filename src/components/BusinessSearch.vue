<!-- src/components/BusinessSearch.vue -->
<template>
  <v-card class="mb-4">
    <v-card-title>Пошук бізнесів</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchParams.query"
            label="Ключове слово"
            prepend-icon="mdi-magnify"
            @keyup.enter="search"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="searchParams.category"
            :items="categories"
            item-text="name"
            item-value="id"
            label="Категорія"
            prepend-icon="mdi-tag"
          ></v-select>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchParams.location"
            label="Розташування"
            prepend-icon="mdi-map-marker"
            @keyup.enter="search"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <v-slider
            v-model="searchParams.minRating"
            label="Мінімальний рейтинг"
            min="0"
            max="5"
            step="0.5"
            thumb-label
            ticks
          ></v-slider>
        </v-col>

        <v-col cols="12" md="4">
          <v-switch v-model="useLocation" label="Шукати поруч"></v-switch>

          <v-slider
            v-if="useLocation"
            v-model="searchParams.maxDistance"
            label="Максимальна відстань (км)"
            min="1"
            max="50"
            thumb-label
            :disabled="!useLocation"
          ></v-slider>
        </v-col>

        <v-col cols="12" md="4" class="d-flex align-center">
          <v-btn color="primary" block @click="search"> Шукати </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <div v-if="isLoading" class="text-center">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
    <p>Пошук...</p>
  </div>

  <div v-else>
    <div
      v-if="searchResults.length === 0 && hasSearched"
      class="text-center my-5"
    >
      <v-icon x-large color="grey">mdi-alert-circle-outline</v-icon>
      <p class="text-h6 grey--text">Бізнесів не знайдено</p>
    </div>

    <business-list v-else :businesses="searchResults"></business-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import BusinessList from "@/components/BusinessList.vue";

export default {
  components: {
    BusinessList,
  },

  data() {
    return {
      searchParams: {
        query: "",
        category: null,
        location: "",
        minRating: 0,
        maxDistance: 10,
      },
      useLocation: false,
      searchResults: [],
      hasSearched: false,
    };
  },

  computed: {
    ...mapGetters(["isLoading"]),
    ...mapGetters("businesses", ["allCategories"]),

    categories() {
      return [{ name: "Всі категорії", id: null }].concat(this.allCategories);
    },
  },

  created() {
    this.fetchCategories();
  },

  methods: {
    ...mapActions("businesses", ["searchBusinesses", "fetchCategories"]),

    async search() {
      try {
        if (this.useLocation) {
          await this.getUserLocation();
        }

        this.searchResults = await this.searchBusinesses(this.searchParams);
        this.hasSearched = true;
      } catch (error) {
        console.error("Search error:", error);
      }
    },

    async getUserLocation() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.searchParams.latitude = position.coords.latitude;
              this.searchParams.longitude = position.coords.longitude;
              resolve();
            },
            (error) => {
              console.error("Geolocation error:", error);
              reject(error);
            }
          );
        } else {
          alert("Геолокація не підтримується вашим браузером");
          reject(new Error("Geolocation not supported"));
        }
      });
    },
  },
};
</script>
