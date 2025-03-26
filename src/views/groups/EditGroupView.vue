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

    <template v-else>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-btn icon variant="text" @click="$router.back()" class="mr-3">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="text-h4">Редагування групи</h1>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="group">
        <v-col cols="12" md="8" class="mx-auto">
          <v-card>
            <v-card-text>
              <v-form ref="form" v-model="formValid">
                <v-text-field
                  v-model="editedGroup.name"
                  label="Назва групи"
                  :rules="[(v) => !!v || 'Назва групи обов`язкова']"
                  required
                ></v-text-field>

                <v-textarea
                  v-model="editedGroup.description"
                  label="Опис групи"
                  :rules="[(v) => !!v || 'Опис групи обов`язковий']"
                  required
                  rows="5"
                ></v-textarea>

                <v-select
                  v-model="editedGroup.industry"
                  :items="industries"
                  label="Галузь"
                  :rules="[(v) => !!v || 'Галузь обов\'язкова']"
                  required
                ></v-select>

                <v-file-input
                  v-model="groupImage"
                  label="Зображення групи"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  hint="Рекомендований розмір: 1200x400 пікселів"
                  persistent-hint
                ></v-file-input>

                <v-switch
                  v-model="editedGroup.isPrivate"
                  label="Приватна група"
                  hint="Учасників приватної групи має схвалити модератор"
                  persistent-hint
                ></v-switch>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="text" @click="$router.back()">Скасувати</v-btn>
              <v-btn
                color="primary"
                @click="saveGroup"
                :loading="saving"
                :disabled="!formValid"
              >
                Зберегти
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "EditGroupView",

  data() {
    return {
      group: null,
      editedGroup: {
        name: "",
        description: "",
        industry: "",
        isPrivate: false,
      },
      groupImage: null,
      formValid: false,
      saving: false,
      industries: [
        "IT та технології",
        "Сільське господарство",
        "Будівництво",
        "Фінанси та страхування",
        "Транспорт та логістика",
        "Освіта",
        "Охорона здоров'я",
        "Туризм та готельний бізнес",
        "Громадське харчування",
        "Нерухомість",
        "Консалтинг",
      ],
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),
    ...mapGetters("auth", ["isAuthenticated", "currentUser"]),

    // Получаем ID группы из параметров маршрута
    groupId() {
      return this.$route.params.id;
    },
  },

  methods: {
    // Метод для получения моковых данных групп
    getMockGroups() {
      return {
        1: {
          id: 1,
          name: "IT-фахівці",
          description:
            "Група для обговорення питань IT-індустрії, нових технологій, проектів та можливостей співробітництва.",
          image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
          industry: "IT та технології",
          ownerId: 1,
          memberCount: 125,
          createdAt: "2023-01-15T10:00:00Z",
          isPrivate: false,
        },
        // Другие моковые группы...
      };
    },

    async loadGroupData() {
      try {
        // В реальном приложении вы бы сделали запрос к API
        // const response = await axios.get(`/api/groups/${this.groupId}`);
        // this.group = response.data;

        // Для демо используем моковые данные
        const mockGroups = this.getMockGroups();

        if (mockGroups[this.groupId]) {
          this.group = mockGroups[this.groupId];

          // Заполняем форму данными группы
          this.editedGroup = {
            name: this.group.name,
            description: this.group.description,
            industry: this.group.industry,
            isPrivate: this.group.isPrivate || false,
          };
        } else {
          // Если группа не найдена, перенаправляем на список групп
          this.$router.replace({ name: "Groups" });
        }
      } catch (error) {
        console.error("Помилка при завантаженні даних групи:", error);
      }
    },

    async saveGroup() {
      if (!this.$refs.form.validate()) return;

      this.saving = true;

      try {
        // В реальном приложении вы бы сделали запрос к API
        // const formData = new FormData();
        // formData.append('name', this.editedGroup.name);
        // formData.append('description', this.editedGroup.description);
        // formData.append('industry', this.editedGroup.industry);
        // formData.append('isPrivate', this.editedGroup.isPrivate);
        // if (this.groupImage) formData.append('image', this.groupImage);
        // await axios.put(`/api/groups/${this.groupId}`, formData);

        // Для демо просто имитируем задержку
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Отображаем уведомление
        alert("Група успішно оновлена");

        // Перенаправляем на страницу группы
        this.$router.push({
          name: "GroupDetail",
          params: { id: this.groupId },
        });
      } catch (error) {
        console.error("Помилка при збереженні групи:", error);
        alert("Не вдалося оновити групу. Спробуйте пізніше.");
      } finally {
        this.saving = false;
      }
    },
  },

  mounted() {
    // Проверяем авторизацию
    if (!this.isAuthenticated) {
      this.$router.push({
        name: "Login",
        query: { redirect: this.$route.fullPath },
      });
      return;
    }

    // Загружаем данные группы
    this.loadGroupData();
  },
};
</script>
