<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <h1 class="text-h4">Групи з інтересів</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showCreateGroupDialog = true"
          >
            Створити групу
          </v-btn>
        </div>
        <p class="text-subtitle-1 mt-2">
          Приєднуйтесь до груп за інтересами та обговорюйте питання бізнесу з
          однодумцями
        </p>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-text-field
                  v-model="search"
                  label="Пошук груп"
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  class="mb-4"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4" lg="3">
                <v-select
                  v-model="industryFilter"
                  :items="industries"
                  label="Галузь"
                  prepend-inner-icon="mdi-domain"
                  hide-details
                  class="mb-4"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6" md="4" lg="3">
                <v-select
                  v-model="sortBy"
                  :items="sortOptions"
                  label="Сортування"
                  prepend-inner-icon="mdi-sort"
                  hide-details
                  class="mb-4"
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="12"
                lg="3"
                class="d-flex align-center"
              >
                <v-checkbox
                  v-model="showOnlyMyGroups"
                  label="Тільки мої групи"
                  hide-details
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="filteredGroups.length === 0">
      <v-col cols="12" class="text-center py-8">
        <v-alert type="info" class="mx-auto" max-width="500">
          <p>
            Групи не знайдено. Спробуйте змінити параметри пошуку або створіть
            нову групу.
          </p>
          <v-btn
            color="primary"
            class="mt-3"
            prepend-icon="mdi-plus"
            @click="showCreateGroupDialog = true"
          >
            Створити групу
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="group in filteredGroups"
        :key="group.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card hover height="100%" class="d-flex flex-column">
          <v-img
            src="/images/design/logo.png"
            alt="Головне зображення"
            class="mx-auto"
            max-width="500"
          ></v-img>

          <v-card-title>{{ group.name }}</v-card-title>

          <v-card-subtitle>
            <v-chip size="small" color="primary" class="mr-1">{{
              group.industry
            }}</v-chip>
            <span class="text-body-2">{{ group.membersCount }} учасників</span>
          </v-card-subtitle>

          <v-card-text class="flex-grow-1">
            <p class="line-clamp-3">{{ group.description }}</p>
          </v-card-text>

          <v-card-actions>
            <v-btn variant="elevated" block :to="`/groups/${group.id}`">
              Перейти до групи
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания группы -->
    <v-dialog v-model="showCreateGroupDialog" max-width="600px">
      <v-card>
        <v-card-title>Створення нової групи</v-card-title>

        <v-card-text>
          <v-form ref="createGroupForm" v-model="createGroupFormValid">
            <v-text-field
              v-model="newGroup.name"
              label="Назва групи"
              :rules="[
                (v) => !!v || 'Назва групи обов`язкова',
                (v) =>
                  v.length >= 3 || 'Назва повинна містити щонайменше 3 символи',
                (v) =>
                  v.length <= 100 || 'Назва має бути коротшою за 100 символів',
              ]"
              required
            ></v-text-field>

            <v-select
              v-model="newGroup.industry"
              :items="industries.filter((item) => item !== 'Усі галузі')"
              label="Галузь"
              :rules="[(v) => !!v || 'Галузь обов`язкова']"
              required
            ></v-select>

            <v-textarea
              v-model="newGroup.description"
              label="Опис групи"
              :rules="[
                (v) => !!v || 'Опис групи обов`язковий',
                (v) =>
                  v.length >= 30 || 'Опис має містити щонайменше 30 символів',
                (v) =>
                  v.length <= 1000 || 'Опис має бути коротшим за 1000 символів',
              ]"
              rows="3"
              counter="1000"
              required
            ></v-textarea>

            <v-switch
              v-model="newGroup.isPrivate"
              label="Приватна група"
              hint="Учасників приватної групи має схвалити модератор"
              persistent-hint
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCreateGroupDialog = false"
            >Скасування</v-btn
          >
          <v-btn
            color="primary"
            @click="createGroup"
            :loading="creatingGroup"
            :disabled="!createGroupFormValid"
          >
            Створити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "GroupsIndexView",
  data() {
    return {
      loading: true,
      creatingGroup: false,
      createGroupFormValid: false,
      search: "",
      industryFilter: "Усі галузі",
      sortBy: "newest",
      showOnlyMyGroups: false,
      showCreateGroupDialog: false,
      newGroup: {
        name: "",
        industry: "",
        description: "",
        isPrivate: false,
      },
      rules: {
        required: (v) => !!v || "Це поле є обов'язковим для заповнення",
      },
      industries: [
        "Усі галузі",
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
      sortOptions: [
        { title: "За новизною", value: "newest" },
        { title: "За популярністю", value: "popular" },
        { title: "За абеткою", value: "alphabetical" },
      ],
      groups: [
        {
          id: "1",
          name: "IT-фахівці",
          description:
            "Група для обговорення питань IT-індустрії, нових технологій, проектів та можливостей співробітництва.",
          industry: "IT та технології",
          image: null,
          membersCount: 125,
          isMember: true,
        },
        {
          id: "2",
          name: "Екологічне фермерство",
          description:
            "Обговорення питань екологічного фермерства, органічної продукції, сертифікації та збуту.",
          industry: "Сільське господарство",
          image: null,
          membersCount: 87,
          isMember: false,
        },
        {
          id: "3",
          name: "Фінансові технології",
          description:
            "Фінтех, блокчейн, криптовалюти, електронні платежі та інновації у фінансовій сфері.",
          industry: "Фінанси та страхування",
          image: null,
          membersCount: 203,
          isMember: false,
        },
        {
          id: "4",
          name: "Будівельні технології",
          description:
            "Нові матеріали, технології будівництва, нормативи та законодавство у будівельній галузі.",
          industry: "Будівництво",
          image: null,
          membersCount: 156,
          isMember: false,
        },
        {
          id: "5",
          name: "Транспортна логістика",
          description:
            "Обговорення питань вантажоперевезень, логістичних ланцюжків, митного оформлення та оптимізації доставки.",
          industry: "Транспорт та логістика",
          image: null,
          membersCount: 118,
          isMember: true,
        },
        {
          id: "6",
          name: "Онлайн Освіта",
          description:
            "Обмін досвідом у сфері створення та просування освітніх онлайн-курсів та програм.",
          industry: "Освіта",
          image: null,
          membersCount: 92,
          isMember: false,
        },
        {
          id: "7",
          name: "Медичний бізнес",
          description:
            "Розвиток приватних медичних практик, клінік та медичних центрів, особливості роботи у сфері охорони здоров'я.",
          industry: "Охорона здоров'я",
          image: null,
          membersCount: 74,
          isMember: false,
        },
        {
          id: "8",
          name: "Туристичний бізнес",
          description:
            "Обговорення трендів у туризмі, маркетингу турпродуктів, роботи з клієнтами та партнерами.",
          industry: "Туризм та готельний бізнес",
          image: null,
          membersCount: 135,
          isMember: false,
        },
      ],
    };
  },
  computed: {
    filteredGroups() {
      let result = [...this.groups];

      // Фильтрация по поиску
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        result = result.filter(
          (group) =>
            group.name.toLowerCase().includes(searchLower) ||
            group.description.toLowerCase().includes(searchLower)
        );
      }

      // Фильтрация по отрасли
      if (this.industryFilter && this.industryFilter !== "Усі галузі") {
        result = result.filter(
          (group) => group.industry === this.industryFilter
        );
      }

      // Фильтрация только моих групп
      if (this.showOnlyMyGroups) {
        result = result.filter((group) => group.isMember);
      }

      // Сортировка
      if (this.sortBy === "newest") {
        // В реальном приложении здесь будет сортировка по дате создания
        // Для демо оставляем как есть
      } else if (this.sortBy === "popular") {
        result.sort((a, b) => b.membersCount - a.membersCount);
      } else if (this.sortBy === "alphabetical") {
        result.sort((a, b) => a.name.localeCompare(b.name));
      }

      return result;
    },
  },
  methods: {
    async createGroup() {
      try {
        const { valid } = await this.$refs.createGroupForm.validate();

        if (!valid) {
          return;
        }

        this.creatingGroup = true;

        // Имитация запроса к API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Создаем новую группу
        const newGroup = {
          id: `${this.groups.length + 1}`,
          name: this.newGroup.name,
          description: this.newGroup.description,
          industry: this.newGroup.industry,
          image: null,
          membersCount: 1, // Создатель группы
          isMember: true,
          isPrivate: this.newGroup.isPrivate,
        };

        // Добавляем в список групп
        this.groups.unshift(newGroup);

        // Закрываем диалог и сбрасываем форму
        this.showCreateGroupDialog = false;
        this.$refs.createGroupForm.reset();

        // Показываем уведомление
        alert("Група успішно створена");

        // Перенаправляем на страницу группы
        this.$router.push(`/groups/${newGroup.id}`);
      } catch (error) {
        console.error("Error creating group:", error);
        alert("Не вдалося створити групу. Будь ласка, спробуйте пізніше.");
      } finally {
        this.creatingGroup = false;
      }
    },
  },
  mounted() {
    // Имитация задержки загрузки данных
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  },
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 4.5em; /* Примерно 3 строки */
}
</style>
