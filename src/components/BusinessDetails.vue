<template>
  <v-container v-if="business">
    <v-row>
      <v-col cols="12">
        <!-- Лоадер -->
        <div class="d-flex justify-center" v-if="isLoading">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>

        <!-- Ошибка -->
        <v-alert v-else-if="hasError" type="error" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <!-- Детали бизнеса -->
        <template v-else>
          <v-btn icon class="mb-4" @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>

          <v-card>
            <v-img
              v-if="business.image"
              :src="business.image"
              height="300"
              cover
            ></v-img>
            <v-img
              v-else
              src="@/assets/business-placeholder.jpg"
              height="300"
              cover
            ></v-img>

            <v-card-title class="text-h4">{{ business.name }}</v-card-title>

            <v-card-subtitle class="text-subtitle-1">
              <v-icon class="me-1">mdi-map-marker</v-icon>
              {{ business.location }}
            </v-card-subtitle>

            <v-card-text>
              <v-chip-group class="mb-4">
                <v-chip
                  v-for="categoryId in business.categories"
                  :key="categoryId"
                  color="primary"
                  variant="outlined"
                >
                  {{ getCategoryName(categoryId) }}
                </v-chip>
              </v-chip-group>

              <div class="my-4">
                <h3 class="text-h6 mb-2">Описание</h3>
                <p>{{ business.description }}</p>
              </div>

              <div class="my-4">
                <h3 class="text-h6 mb-2">Контактная информация</h3>
                <p v-if="business.email">
                  <v-icon class="me-1">mdi-email</v-icon>
                  {{ business.email }}
                </p>
                <p v-if="business.phone">
                  <v-icon class="me-1">mdi-phone</v-icon>
                  {{ business.phone }}
                </p>
                <p v-if="business.website">
                  <v-icon class="me-1">mdi-web</v-icon>
                  <a :href="business.website" target="_blank">{{
                    business.website
                  }}</a>
                </p>
              </div>
            </v-card-text>

            <v-card-actions v-if="isAuthenticated">
              <v-btn color="primary" variant="text" @click="startConversation">
                <v-icon class="me-1">mdi-message</v-icon>
                Написать сообщение
              </v-btn>

              <v-spacer></v-spacer>

              <v-btn
                v-if="isOwner"
                color="info"
                variant="text"
                @click="editBusiness"
              >
                <v-icon class="me-1">mdi-pencil</v-icon>
                Редактировать
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"; // eslint-disable-line no-unused-vars
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

// Получаем доступ к хранилищу, маршруту и роутеру
const store = useStore();
const route = useRoute();
const router = useRouter();

// Получаем id бизнеса из параметров маршрута
const businessId = computed(() => route.params.id);

// Состояния из хранилища
const business = computed(() => store.getters["businesses/currentBusiness"]);
const categories = computed(() => store.state.businesses.categories);
const isLoading = computed(() => store.getters.isLoading);
const hasError = computed(() => store.getters.hasError);
const errorMessage = computed(() => store.getters.errorMessage);
const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
const currentUser = computed(() => store.getters["auth/currentUser"]);

// Вычисляемое свойство для проверки, является ли текущий пользователь владельцем бизнеса
const isOwner = computed(() => {
  if (!isAuthenticated.value || !business.value || !currentUser.value) {
    return false;
  }
  return business.value.ownerId === currentUser.value.id;
});

// Методы
const getCategoryName = (categoryId) => {
  const category = categories.value.find((cat) => cat.id === categoryId);
  return category ? category.name : "Категорія";
};

const goBack = () => {
  router.back();
};

const startConversation = async () => {
  try {
    if (!business.value.ownerId) {
      store.dispatch(
        "setError",
        "Неможливо розпочати діалог: власник бізнесу не вказано"
      );
      return;
    }

    // Создаем новую беседу с владельцем бизнеса
    const conversation = await store.dispatch("messages/createConversation", {
      recipientId: business.value.ownerId,
      initialMessage: `Привіт! Хочу дізнатися більше про"${business.value.name}"`,
    });

    // Переходим к созданной беседе
    router.push({ name: "messages", params: { id: conversation.id } });
  } catch (error) {
    console.error("Ошибка при создании беседы:", error);
  }
};

const editBusiness = () => {
  router.push({ name: "edit-business", params: { id: businessId.value } });
};

// Хук жизненного цикла
onMounted(async () => {
  // Загружаем детали бизнеса и категории при монтировании компонента
  await store.dispatch("businesses/fetchBusinessById", businessId.value);

  if (!categories.value.length) {
    await store.dispatch("businesses/fetchCategories");
  }
});
</script>
