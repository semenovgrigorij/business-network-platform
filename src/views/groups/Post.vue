<template>
  <v-container>
    <div v-if="isLoading" class="d-flex justify-center my-10">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>

    <v-alert v-else-if="hasError" type="error" class="mb-6">
      {{ errorMessage }}
    </v-alert>

    <template v-else-if="post">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-btn icon variant="text" @click="$router.back()" class="mr-3">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="text-h4">{{ post.title }}</h1>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center mb-4">
                <v-avatar size="40" class="mr-3">
                  <v-img
                    v-if="post.authorAvatar"
                    :src="post.authorAvatar"
                    alt="Author"
                  ></v-img>
                  <v-icon v-else>mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ post.authorName }}
                  </div>
                  <div class="text-caption">
                    {{ formatDate(post.createdAt) }}
                  </div>
                </div>
              </div>

              <div class="text-body-1 mb-6" style="white-space: pre-line">
                {{ post.content }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Секция комментариев будет здесь -->
    </template>

    <v-alert v-else type="info" class="mb-6">
      Повідомлення не знайдено. Можливо, воно було видалено або переміщено.
    </v-alert>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "GroupPost",

  props: {
    groupId: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      post: null,
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    /**
     * Генерирует MongoDB ObjectId
     * @param {number} index - индекс для генерации уникального ID
     * @returns {string} - ObjectId в виде строки
     */
    generateObjectId(index = 0) {
      // Создаем ObjectId в формате MongoDB
      const timestamp = Math.floor(Date.now() / 1000)
        .toString(16)
        .padStart(8, "0");
      const machineId = "67e01d"; // 3 байта для машинного ID
      const processId = "299b"; // 2 байта для process ID
      const counter = index.toString(16).padStart(6, "0"); // 3 байта для счетчика
      return `${timestamp}${machineId}${processId}${counter}`;
    },

    async loadPostData() {
      try {
        // В реальном приложении вы бы сделали запрос к API
        // const response = await axios.get(`/api/groups/${this.groupId}/posts/${this.postId}`);
        // this.post = response.data;

        // Проверяем, похож ли postId на ObjectId MongoDB
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(this.postId);
        const postObjectId = isMongoId
          ? this.postId
          : this.generateObjectId(parseInt(this.postId) || 0);

        // Для демо используем моковые данные, но с форматом ObjectId
        this.post = {
          _id: postObjectId, // Используем MongoDB ObjectId
          groupId: this.groupId, // Убедимся, что группа ID - строка
          authorId: `67e01d299bf93367676c41e1`, // ObjectId для автора
          authorName: "Олександр Петренко",
          authorAvatar: "/images/placeholders/user-avatar.jpg",
          title: "Демонстраційне повідомлення",
          content:
            "Це демонстраційний текст повідомлення. У реальному додатку тут буде вміст поста з групи.",
          createdAt: new Date().toISOString(),
          comments: [],
        };

        // Если это демо-режим и передан числовой ID, задаем тайтл в зависимости от ID
        if (!isMongoId && parseInt(this.postId)) {
          const postIndex = parseInt(this.postId);
          const titles = [
            "Вітаємо у спільноті!",
            "Тренди в галузі на 2025 рік",
            "Зустріч учасників групи",
            "Новини та оновлення",
          ];
          this.post.title =
            titles[postIndex % titles.length] || "Повідомлення #" + postIndex;
        }
      } catch (error) {
        console.error("Помилка при завантаженні даних поста:", error);
      }
    },

    /**
     * Обработка действий с постом
     */
    async handlePostAction(action) {
      // Здесь будет логика для лайков, комментариев и т.д.
      // Важно использовать ObjectId формат для всех идентификаторов
      console.log(`Действие ${action} с постом ID: ${this.post._id}`);
    },
  },

  async mounted() {
    await this.loadPostData();
  },
};
</script>
