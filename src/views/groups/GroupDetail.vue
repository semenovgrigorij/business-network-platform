<!-- src/views/groups/GroupDetail.vue -->
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

    <template v-else-if="group">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-4">
            <v-btn icon variant="text" @click="$router.back()" class="mr-3">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="text-h4">{{ group.name }}</h1>
            <v-spacer></v-spacer>
            <div v-if="isGroupOwner">
              <v-btn
                color="primary"
                variant="text"
                class="mr-2"
                :to="{ name: 'EditGroup', params: { id: group._id } }"
              >
                <v-icon class="mr-1">mdi-pencil</v-icon>
                Редагувати
              </v-btn>
              <v-btn
                color="error"
                variant="text"
                @click="showDeleteDialog = true"
              >
                <v-icon class="mr-1">mdi-delete</v-icon>
                Видалити
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <!-- Основная информация о группе -->
          <v-card class="mb-6">
            <v-img
              :src="
                group.image && group.image.startsWith('http')
                  ? group.image
                  : 'https://placehold.co/1200x400/CCCCCC/333333?text=' +
                    encodeURIComponent(group.name || 'Група')
              "
              height="300"
              cover
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey-lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>

            <v-card-text>
              <p class="text-body-1 mb-6">{{ group.description }}</p>

              <v-divider class="mb-4"></v-divider>

              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <span class="text-subtitle-1 font-weight-bold"
                    >Створено:</span
                  >
                  <span class="ml-2">{{ formatDate(group.createdAt) }}</span>
                </div>
                <div>
                  <span class="text-subtitle-1 font-weight-bold"
                    >Учасників:</span
                  >
                  <span class="ml-2">{{
                    group.memberCount || groupMembers.length
                  }}</span>
                </div>
              </div>

              <!-- Кнопка написать сообщение группе (только для авторизованных участников) -->
              <v-btn
                color="primary"
                block
                class="mb-3"
                v-if="isAuthenticated && isMember"
                @click="startConversation"
                :loading="conversationLoading"
              >
                <v-icon start>mdi-message-text</v-icon>
                Написати повідомлення групі
              </v-btn>

              <!-- Кнопка присоединиться к группе (для неавторизованных или не-участников) -->
              <v-btn
                color="primary"
                block
                v-if="isAuthenticated && !isGroupOwner && !isMember"
                @click="joinGroup"
              >
                <v-icon start>mdi-account-plus</v-icon>
                Приєднатися до групи
              </v-btn>

              <!-- Кнопка выйти из группы (для участников, не владельцев) -->
              <v-btn
                color="error"
                block
                v-if="isAuthenticated && !isGroupOwner && isMember"
                @click="leaveGroup"
              >
                <v-icon start>mdi-account-remove</v-icon>
                Покинути групу
              </v-btn>

              <!-- Кнопка для неавторизованных пользователей -->
              <v-btn
                color="primary"
                block
                v-if="!isAuthenticated"
                @click="redirectToLogin"
              >
                <v-icon start>mdi-login</v-icon>
                Увійти для взаємодії з групою
              </v-btn>

              <!-- Сообщение об ошибке при создании беседы -->
              <v-alert v-if="conversationError" type="error" class="mt-3" dense>
                {{ conversationError }}
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Последние обсуждения/активность -->
          <v-card class="mb-6">
            <v-card-title>
              <h2 class="text-h5">Останні обговорення</h2>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="text"
                v-if="isMember"
                @click="showNewPostDialog = true"
              >
                <v-icon start>mdi-plus</v-icon>
                Нове обговорення
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>

            <v-list v-if="groupPosts.length > 0">
              <v-list-item
                v-for="post in groupPosts"
                :key="post.id"
                :title="post.title"
                :subtitle="`${post.authorName} - ${formatDate(post.createdAt)}`"
              >
                <template v-slot:prepend>
                  <v-avatar size="36">
                    <v-img
                      v-if="post.authorAvatar"
                      :src="post.authorAvatar"
                      alt="Author"
                    ></v-img>
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                </template>

                <template v-slot:append>
                  <v-btn
                    variant="text"
                    color="primary"
                    :to="{
                      name: 'GroupPost',
                      params: { groupId: group._id, postId: post._id },
                    }"
                  >
                    Переглянути
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <v-card-text v-else class="text-center py-8">
              <v-icon
                icon="mdi-forum-outline"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              ></v-icon>
              <h3 class="text-h5 mb-2">Обговорень ще немає</h3>
              <p class="text-body-1 mb-4" v-if="isMember">
                Будьте першим, хто створить обговорення в цій групі
              </p>
              <p class="text-body-1 mb-4" v-else>
                Приєднайтесь до групи, щоб брати участь в обговореннях
              </p>
              <v-btn
                color="primary"
                v-if="isMember"
                @click="showNewPostDialog = true"
              >
                Створити обговорення
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Информация о владельце группы -->
          <v-card class="mb-6">
            <v-card-title>Власник групи</v-card-title>
            <v-card-text v-if="groupOwner">
              <user-profile-card
                :user="groupOwner"
                :show-details="true"
                :show-contact="
                  isAuthenticated && groupOwner.id !== currentUser.id
                "
                @contact="contactGroupOwner"
              >
                <template v-slot:actions>
                  <v-btn
                    v-if="isAuthenticated && groupOwner.id !== currentUser.id"
                    color="primary"
                    variant="outlined"
                    size="small"
                    :to="{ name: 'UserProfile', params: { id: groupOwner.id } }"
                  >
                    Переглянути профіль
                  </v-btn>
                </template>
              </user-profile-card>
            </v-card-text>
            <v-card-text v-else>
              <p class="text-body-1">Інформація про власника недоступна</p>
            </v-card-text>
          </v-card>

          <!-- Список участников группы -->
          <v-card>
            <v-card-title>
              Учасники ({{ groupMembers.length }})
              <v-spacer></v-spacer>
              <v-btn icon @click="showAllMembers = !showAllMembers">
                <v-icon>{{
                  showAllMembers ? "mdi-chevron-up" : "mdi-chevron-down"
                }}</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-list>
              <v-list-item v-for="member in displayedMembers" :key="member.id">
                <template v-slot:prepend>
                  <v-avatar size="36">
                    <v-img
                      v-if="member.user && member.user.avatar"
                      :src="member.user.avatar"
                      alt="User Avatar"
                    ></v-img>
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>
                  {{
                    member.user
                      ? `${member.user.firstName} ${member.user.lastName}`
                      : "Користувач"
                  }}
                </v-list-item-title>

                <v-list-item-subtitle v-if="member.role === 'admin'">
                  <v-chip size="small" color="primary">Адміністратор</v-chip>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    :to="{ name: 'UserProfile', params: { id: member.userId } }"
                  >
                    Профіль
                  </v-btn>
                </template>
              </v-list-item>

              <v-list-item v-if="!showAllMembers && groupMembers.length > 5">
                <v-btn block variant="text" @click="showAllMembers = true">
                  Показати всіх учасників ({{ groupMembers.length }})
                </v-btn>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <!--           -->
    <v-alert v-else type="info" class="mb-6">
      Група не знайдена. Можливо, вона була видалена або переміщена.
    </v-alert>

    <!-- Диалог подтверждения удаления группы -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Видалення групи</v-card-title>
        <v-card-text>
          <p>
            Ви впевнені, що хочете видалити групу "{{
              group ? group.name : ""
            }}"?
          </p>
          <p class="text-red">Це дію неможливо буде скасувати.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="showDeleteDialog = false"
            >Скасувати</v-btn
          >
          <v-btn color="error" @click="confirmDelete" :loading="isDeleting"
            >Видалити</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог создания нового обсуждения -->
    <v-dialog v-model="showNewPostDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5">Нове обговорення</v-card-title>
        <v-card-text>
          <v-form
            ref="postForm"
            v-model="isPostFormValid"
            @submit.prevent="createPost"
          >
            <v-text-field
              v-model="newPost.title"
              label="Заголовок"
              required
              :rules="[(v) => !!v || 'Заголовок обов`язковий']"
            ></v-text-field>

            <v-textarea
              v-model="newPost.content"
              label="Зміст"
              required
              rows="6"
              :rules="[(v) => !!v || 'Текст обов`язковий']"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="showNewPostDialog = false"
            >Скасувати</v-btn
          >
          <v-btn
            color="primary"
            @click="createPost"
            :loading="isCreatingPost"
            :disabled="!isPostFormValid"
          >
            Опублікувати
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false"> Закрити </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UserProfileCard from "@/components/UserProfileCard.vue";
import dataService from "@/services/dataService";

export default {
  name: "GroupDetail",

  components: {
    UserProfileCard,
  },

  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      group: null,
      groupOwner: null,
      groupMembers: [],
      groupPosts: [],
      showAllMembers: false,
      showDeleteDialog: false,
      isDeleting: false,
      showNewPostDialog: false,
      isCreatingPost: false,
      isPostFormValid: true,
      newPost: {
        title: "",
        content: "",
      },
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      conversationLoading: false,
      conversationError: "",
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),
    ...mapGetters("auth", ["isAuthenticated", "currentUser"]),

    isGroupOwner() {
      return (
        (this.isAuthenticated &&
          this.group &&
          this.currentUser &&
          this.group.ownerId === this.currentUser._id) ||
        this.group.ownerId === this.currentUser.id
      );
    },

    isMember() {
      // Проверяем авторизацию и наличие данных пользователя
      if (
        !this.isAuthenticated ||
        !this.currentUser ||
        !this.groupMembers.length
      )
        return false;

      // Проверяем, есть ли пользователь среди участников группы
      const isMember = this.groupMembers.some(
        (member) =>
          member.userId === this.currentUser._id ||
          member.userId === this.currentUser.id
      );

      console.log("Проверка участия в группе:", {
        userId: this.currentUser?.id,
        groupMembers: this.groupMembers.map((m) => m.userId),
        isMember,
      });

      return isMember;
    },

    displayedMembers() {
      if (this.showAllMembers) return this.groupMembers;
      return this.groupMembers.slice(0, 5);
    },
  },
  /*---------------    */
  methods: {
    ...mapActions({
      createConversation: "messages/createConversation",
    }),

    getMockGroups() {
      return {
        1: {
          id: 1,
          name: "IT-фахівці",
          description:
            "Група для обговорення питань IT-індустрії, нових технологій, проектів та можливостей співробітництва.",
          image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
          ownerId: 1,
          memberCount: 125,
          createdAt: "2023-01-15T10:00:00Z",
        },
        2: {
          id: 2,
          name: "Екологічне фермерство",
          description:
            "Обговорення питань екологічного фермерства, органічної продукції, сертифікації та збуту.",
          image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
          ownerId: 2,
          memberCount: 87,
          createdAt: "2023-01-18T14:30:00Z",
        },
        3: {
          id: 3,
          name: "Фінансові технології",
          description:
            "Фінтех, блокчейн, криптовалюти, електронні платежі та інновації у фінансовій сфері.",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
          ownerId: 3,
          memberCount: 203,
          createdAt: "2025-01-10T09:15:00Z",
        },
        4: {
          id: 4,
          name: "Будівельні технології",
          description:
            "Нові матеріали, технології будівництва, нормативи та законодавство у будівельній галузі.",
          image: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77",
          ownerId: 4,
          memberCount: 156,
          createdAt: "2025-01-12T11:20:00Z",
        },
        5: {
          id: 5,
          name: "Транспортна логістика",
          description:
            "Обговорення питань вантажоперевезень, логістичних ланцюжків, митного оформлення та оптимізації доставки.",
          image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c",
          ownerId: 5,
          memberCount: 118,
          createdAt: "2025-01-05T16:45:00Z",
        },
      };
    },
    redirectToLogin() {
      this.$router.push({
        name: "Login",
        query: { redirect: this.$route.fullPath },
      });
    },

    // Метод для получения моковых данных владельцев групп
    getMockOwners() {
      return {
        1: {
          id: 1,
          firstName: "Олександр",
          lastName: "Петренко",
          avatar: "/images/placeholders/user-avatar.jpg",
          location: "Київ, Україна",
          bio: "Засновник IT-компанії з досвідом роботи у галузі більше 10 років. Експерт з розробки та впровадження інноваційних технологій.",
          jobTitle: "CEO, Tech Solutions",
          linkedinUrl: "https://linkedin.com/",
          facebookUrl: "https://facebook.com/",
          skills: [
            "Управління проектами",
            "Розробка програмного забезпечення",
            "Бізнес-стратегія",
          ],
          privacySettings: {
            showEmail: true,
            showPhone: true,
            showSocial: true,
          },
        },
        2: {
          id: 2,
          firstName: "Наталія",
          lastName: "Ковальчук",
          avatar: "/images/placeholders/user-avatar.jpg",
          location: "Львів, Україна",
          bio: "Засновниця еко-ферми з органічним виробництвом. Консультант з питань екологічного землеробства та сертифікації.",
          jobTitle: "Власниця, Green Valley Farm",
          linkedinUrl: "https://linkedin.com/",
          facebookUrl: "https://facebook.com/",
          skills: ["Органічне землеробство", "Агрономія", "Сталий розвиток"],
          privacySettings: {
            showEmail: true,
            showPhone: false,
            showSocial: true,
          },
        },
        3: {
          id: 3,
          firstName: "Максим",
          lastName: "Іванов",
          avatar: "/images/placeholders/user-avatar.jpg",
          location: "Одеса, Україна",
          bio: "Фінансовий аналітик та консультант з питань інвестицій. Спеціалізується на фінтех-рішеннях та криптовалютах.",
          jobTitle: "Фінансовий директор, FinTech Solutions",
          linkedinUrl: "https://linkedin.com/",
          facebookUrl: "https://facebook.com/",
          skills: [
            "Фінансовий аналіз",
            "Блокчейн-технології",
            "Інвестиційний консалтинг",
          ],
          privacySettings: {
            showEmail: true,
            showPhone: true,
            showSocial: true,
          },
        },
        4: {
          id: 4,
          firstName: "Андрій",
          lastName: "Ткаченко",
          avatar: "/images/placeholders/user-avatar.jpg",
          location: "Дніпро, Україна",
          bio: "Інженер-будівельник з 15-річним досвідом. Експерт з впровадження інноваційних технологій у будівництві.",
          jobTitle: "Головний інженер, BuildTech",
          linkedinUrl: "https://linkedin.com/",
          facebookUrl: "https://facebook.com/",
          skills: [
            "Проектування",
            "Будівельні технології",
            "Інженерні системи",
          ],
          privacySettings: {
            showEmail: false,
            showPhone: true,
            showSocial: true,
          },
        },
        5: {
          id: 5,
          firstName: "Олена",
          lastName: "Коваль",
          avatar: "/images/placeholders/user-avatar.jpg",
          location: "Харків, Україна",
          bio: "Експерт з логістики та управління ланцюгами поставок. Допомагає компаніям оптимізувати логістичні процеси.",
          jobTitle: "Директор з логістики, TransLogic",
          linkedinUrl: "https://linkedin.com/",
          facebookUrl: "https://facebook.com/",
          skills: [
            "Логістика",
            "Управління ланцюгами поставок",
            "Міжнародні перевезення",
          ],
          privacySettings: {
            showEmail: true,
            showPhone: true,
            showSocial: false,
          },
        },
      };
    },

    // Метод генерирует разных пользователей для разных ID
    getRandomUsers(count, groupId, adminId) {
      const names = [
        { firstName: "Марія", lastName: "Коваленко" },
        { firstName: "Іван", lastName: "Шевченко" },
        { firstName: "Анна", lastName: "Мельник" },
        { firstName: "Петро", lastName: "Савченко" },
        { firstName: "Олена", lastName: "Бондаренко" },
        { firstName: "Василь", lastName: "Литвин" },
        { firstName: "Ірина", lastName: "Захарченко" },
        { firstName: "Михайло", lastName: "Кузьменко" },
        { firstName: "Тетяна", lastName: "Романенко" },
        { firstName: "Сергій", lastName: "Мороз" },
      ];

      const titles = [
        "Продуктовий менеджер",
        "Розробник програмного забезпечення",
        "UI/UX дизайнер",
        "Маркетолог",
        "Бізнес-аналітик",
        "Проектний менеджер",
        "Фінансовий аналітик",
        "HR-менеджер",
        "Контент-менеджер",
        "Системний адміністратор",
      ];

      // Создаем массив участников
      const members = [];

      // Добавляем администратора
      members.push({
        id: 1,
        groupId: parseInt(groupId),
        userId: adminId,
        role: "admin",
        joinedAt: new Date(
          new Date().setDate(new Date().getDate() - 30)
        ).toISOString(),
        user: {
          id: adminId,
          firstName:
            this.getMockOwners()[adminId]?.firstName || "Адміністратор",
          lastName: this.getMockOwners()[adminId]?.lastName || "Групи",
          avatar: "/images/placeholders/user-avatar.jpg",
          jobTitle: this.getMockOwners()[adminId]?.jobTitle || "Власник групи",
        },
      });

      // Добавляем случайных участников
      for (let i = 2; i <= count; i++) {
        const nameIndex = Math.floor(Math.random() * names.length);
        const titleIndex = Math.floor(Math.random() * titles.length);
        const userId = adminId + i;

        members.push({
          _id: `67e01d299bf93367676c6${i.toString().padStart(3, "0")}`,
          groupId: groupId,
          userId: userId,
          role: "member",
          joinedAt: new Date(
            new Date().setDate(
              new Date().getDate() - Math.floor(Math.random() * 30)
            )
          ).toISOString(),
          user: {
            id: userId,
            firstName: names[nameIndex].firstName,
            lastName: names[nameIndex].lastName,
            avatar: "/images/placeholders/user-avatar.jpg",
            jobTitle: titles[titleIndex],
          },
        });
      }

      return members;
    },
    // Генерирует посты для группы
    getGroupPosts() {
      const postTitles = {
        1: [
          "Вітаємо у спільноті IT-фахівців!",
          "Тренди в розробці програмного забезпечення 2023",
          "Які мови програмування найбільш затребувані сьогодні?",
          "DevOps практики для невеликих компаній",
        ],
        2: [
          "Вітаємо у спільноті екологічного фермерства!",
          "Органічна сертифікація: з чого почати?",
          "Біодинамічне землеробство: досвід впровадження",
          "Як вийти на ринок органічної продукції",
        ],
        3: [
          "Вітаємо у спільноті фінансових технологій!",
          "Блокчейн у фінансовому секторі: реальні приклади",
          "Криптовалютний ринок: аналіз тенденцій",
          "Електронні платежі: інновації та безпека",
        ],
        4: [
          "Вітаємо у спільноті будівельних технологій!",
          "Інновації в будівництві: нові матеріали",
          "Енергоефективні будівлі: стандарти та практики",
          "BIM-моделювання в сучасному будівництві",
        ],
        5: [
          "Вітаємо у спільноті транспортної логістики!",
          "Оптимізація маршрутів перевезень: методи та інструменти",
          "Митне оформлення: як уникнути затримок",
          "Цифрова трансформація логістичних процесів",
        ],
      };

      return postTitles;
    },
    async loadGroupData() {
      try {
        // Используем dataService для получения группы
        this.group = await dataService.getGroupById(this.id);

        // Если группа не найдена, создаем стандартную группу с ObjectId
        if (!this.group) {
          const groupName = "Група #" + this.id;
          this.group = {
            _id: `67e01d299bf93367676c42${this.id.padStart(2, "0")}`, // Генерируем ID в формате ObjectId
            name: groupName,
            description: "Це стандартна група, створена для демонстрації.",
            image:
              "https://placehold.co/1200x400/CCCCCC/333333?text=" +
              encodeURIComponent(groupName),
            ownerId: "67e01d299bf93367676c41e1", // ID первого пользователя в формате ObjectId
            memberCount: Math.floor(Math.random() * 100) + 20,
            createdAt: new Date().toISOString(),
          };
        }

        // Загружаем дополнительные данные
        this.groupOwner = await dataService.getGroupOwner(this.group);
        this.groupMembers = await dataService.getGroupMembers(this.group._id);
        await this.loadGroupPosts(); // Предполагаем, что эту функцию тоже нужно обновить
      } catch (error) {
        console.error("Помилка при завантаженні даних групи:", error);
      }
    },

    async loadGroupOwner() {
      if (!this.group || !this.group.ownerId) return;

      try {
        // Получаем данные о владельце группы
        const owners = this.getMockOwners();

        if (owners[this.group.ownerId]) {
          this.groupOwner = owners[this.group.ownerId];
        } else {
          // Если владелец не найден, создаем стандартного владельца
          this.groupOwner = {
            id: this.group.ownerId,
            firstName: "Власник",
            lastName: "Групи " + this.group.id,
            avatar: "/images/placeholders/user-avatar.jpg",
            location: "Україна",
            bio: "Власник групи з інтересів. Запрошую всіх до активного обговорення.",
            jobTitle: "Адміністратор групи",
            linkedinUrl: "https://linkedin.com/",
            facebookUrl: "https://facebook.com/",
            skills: ["Адміністрування", "Комунікація", "Організація"],
            privacySettings: {
              showEmail: true,
              showPhone: true,
              showSocial: true,
            },
          };
        }
      } catch (error) {
        console.error("Помилка при завантаженні даних власника групи:", error);
      }
    },

    async loadGroupMembers() {
      try {
        // Генерируем участников группы
        const memberCount = this.group.memberCount
          ? Math.min(this.group.memberCount, 15)
          : 10;
        this.groupMembers = this.getRandomUsers(
          memberCount,
          this.group._id,
          this.group.ownerId
        );
      } catch (error) {
        console.error("Помилка при завантаженні учасників групи:", error);
      }
    },

    async loadGroupPosts() {
      try {
        // Определяем ID для получения набора постов (ограничиваем до 5)
        const mockGroupId = Math.min(parseInt(this.id), 5);
        // Получаем заголовки постов
        const titles = this.getGroupPosts();

        // Создаем пустой массив для хранения постов
        this.groupPosts = [];

        // Добавляем посты от владельца и других участников
        if (titles && titles[mockGroupId]) {
          for (let i = 0; i < titles[mockGroupId].length; i++) {
            const randomDaysAgo = Math.floor(Math.random() * 30);
            const postDate = new Date();
            postDate.setDate(postDate.getDate() - randomDaysAgo);

            // Выбираем автора поста (владелец или участник группы)
            let authorId, authorName, authorAvatar;

            if (i === 0 && this.groupOwner) {
              // Первый пост от владельца группы
              authorId = this.groupOwner._id;
              authorName = `${this.groupOwner.firstName} ${this.groupOwner.lastName}`;
              authorAvatar =
                this.groupOwner.avatar ||
                "/images/placeholders/user-avatar.jpg";
            } else if (this.groupMembers && this.groupMembers.length > 0) {
              // Остальные посты от разных участников
              const member = this.groupMembers[i % this.groupMembers.length];
              authorId = member.userId || member.user?._id;
              authorName = `${member.user?.firstName || "Користувач"} ${
                member.user?.lastName || ""
              }`;
              authorAvatar =
                member.user?.avatar || "/images/placeholders/user-avatar.jpg";
            } else {
              // Если участников нет, используем владельца
              authorId = this.groupOwner?._id || "67e01d299bf93367676c41e1";
              authorName = this.groupOwner
                ? `${this.groupOwner.firstName} ${this.groupOwner.lastName}`
                : "Власник групи";
              authorAvatar = "/images/placeholders/user-avatar.jpg";
            }

            // Генерируем уникальный ID поста в формате ObjectId
            const postId = `67e01d299bf93367676c5${i
              .toString()
              .padStart(3, "0")}`;

            this.groupPosts.push({
              _id: postId,
              groupId: this.group._id,
              authorId: authorId,
              authorName: authorName,
              authorAvatar: authorAvatar,
              title: titles[mockGroupId][i],
              content: "Текст поста...", // Здесь можно добавить реальный контент
              createdAt: postDate.toISOString(),
              commentCount: Math.floor(Math.random() * 20),
            });
          }
        }

        // Сортируем посты по дате (сначала новые)
        this.groupPosts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } catch (error) {
        console.error("Помилка при завантаженні постів групи:", error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },

    async contactGroupOwner() {
      if (!this.isAuthenticated || !this.groupOwner) return;

      try {
        const conversationData = {
          recipientId: this.groupOwner._id,
          initialMessage: `Вітаю! Я учасник групи "${this.group.name}" і хотів би поспілкуватися.`,
          groupId: this.group._id,
        };

        const conversation = await dataService.createConversation(
          conversationData
        );

        this.$router.push({
          name: "Conversation",
          params: { id: conversation._id },
        });
      } catch (error) {
        console.error("Помилка при створенні бесіди:", error);
      }
    },

    async joinGroup() {
      if (!this.isAuthenticated) {
        this.$router.push({
          name: "Login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }

      try {
        if (!this.currentUser) {
          console.error("Користувач не ініціалізований");
          alert("Щоб приєднатися до групи, увійдіть в систему");
          return;
        }
        // В реальном приложении вы бы сделали запрос к API
        // await axios.post(`/api/groups/${this.id}/members`, { userId: this.currentUser.id });

        // Для демо просто добавляем пользователя в список участников
        const newMember = {
          id: this.groupMembers.length + 1,
          groupId: this.group._id,
          userId: this.currentUser.id,
          role: "member",
          joinedAt: new Date().toISOString(),
          user: {
            id: this.currentUser.id,
            firstName: this.currentUser.firstName || "Користувач",
            lastName: this.currentUser.lastName || "",
            avatar:
              this.currentUser.avatar || "/images/placeholders/user-avatar.jpg",
            jobTitle: this.currentUser.jobTitle || "Учасник групи",
          },
        };

        this.groupMembers.push(newMember);
        this.group.memberCount = (this.group.memberCount || 0) + 1;
        this.snackbarText = "Ви успішно приєдналися до групи!";
        this.snackbarColor = "success";
        this.snackbar = true;

        // Показать уведомление об успешном присоединении
        // this.$store.dispatch('showSnackbar', { text: 'Ви успішно приєдналися до групи!', color: 'success' });
      } catch (error) {
        console.error("Помилка при приєднанні до групи:", error);
      }
    },
    async leaveGroup() {
      if (!this.isAuthenticated || !this.isMember) return;

      try {
        // В реальном приложении вы бы сделали запрос к API
        // await axios.delete(`/api/groups/${this.id}/members/${this.currentUser.id}`);

        // Для демо просто удаляем пользователя из списка участников
        const index = this.groupMembers.findIndex(
          (member) =>
            member.userId === this.currentUser._id ||
            member.userId === this.currentUser.id
        );
        if (index !== -1) {
          this.groupMembers.splice(index, 1);
          this.group.memberCount = Math.max(
            0,
            (this.group.memberCount || 0) - 1
          );
        }

        // Показать уведомление
        // this.$store.dispatch('showSnackbar', { text: 'Ви вийшли з групи', color: 'info' });
      } catch (error) {
        console.error("Помилка при виході з групи:", error);
      }
    },

    async confirmDelete() {
      if (!this.isGroupOwner) return;

      this.isDeleting = true;

      try {
        // В реальном приложении вы бы сделали запрос к API
        // await axios.delete(`/api/groups/${this.id}`);

        // Перенаправляем на страницу списка групп
        this.$router.push({ name: "Groups" });

        // Показать уведомление
        // this.$store.dispatch('showSnackbar', { text: 'Групу успішно видалено', color: 'success' });
      } catch (error) {
        console.error("Помилка при видаленні групи:", error);
      } finally {
        this.isDeleting = false;
        this.showDeleteDialog = false;
      }
    },

    async createPost() {
      if (!this.$refs.postForm.validate()) return;

      this.isCreatingPost = true;

      try {
        // В реальном приложении вы бы сделали запрос к API
        // const response = await axios.post(`/api/groups/${this.id}/posts`, {
        //   title: this.newPost.title,
        //   content: this.newPost.content
        // });

        // Для демо просто добавляем пост в список
        const newPost = {
          _id: `67e01d299bf93367676c5${(this.groupPosts.length + 1)
            .toString()
            .padStart(3, "0")}`,
          groupId: this.group._id,
          authorId: this.currentUser.id,
          authorName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
          authorAvatar: this.currentUser.avatar,
          title: this.newPost.title,
          content: this.newPost.content,
          createdAt: new Date().toISOString(),
          commentCount: 0,
        };

        this.groupPosts.unshift(newPost);

        // Сбрасываем форму
        this.newPost = { title: "", content: "" };
        this.showNewPostDialog = false;

        // Показать уведомление
        // this.$store.dispatch('showSnackbar', { text: 'Обговорення створено успішно', color: 'success' });
      } catch (error) {
        console.error("Помилка при створенні обговорення:", error);
      } finally {
        this.isCreatingPost = false;
      }
    },

    debugAuth() {
      const authState = this.checkAuthState();
      console.table(authState);

      // Проверяем, корректно ли работает isMember
      console.log("isMember value:", this.isMember);
      console.log("isAuthenticated value:", this.isAuthenticated);
      console.log("currentUser:", this.$store.getters["auth/currentUser"]);

      // Сообщение о состоянии
      this.snackbarText = `Авторизация: ${authState.isAuthenticated}, Токен: ${authState.hasToken}, Данные пользователя: ${authState.hasUserData}`;
      this.snackbarColor = authState.isAuthenticated ? "success" : "warning";
      this.snackbar = true;
    },

    async startConversation() {
      if (!this.groupOwner) {
        console.error("Group owner not found");
        this.conversationError = "Власник групи не знайдений";
        return;
      }

      try {
        this.conversationLoading = true;
        this.conversationError = "";

        // Получаем ID владельца и преобразуем его в строку
        const recipientId = this.groupOwner._id || String(this.groupOwner.id);
        console.log(
          "Using recipientId:",
          recipientId,
          "type:",
          typeof recipientId
        );

        const conversationData = {
          recipientId: recipientId,
          initialMessage: `Привіт! Я зацікавлений у вашій групі "${this.group.name}".`,
        };

        const conversation = await this.createConversation(conversationData);

        // Проверяем успешность создания беседы
        if (conversation && (conversation._id || conversation.id)) {
          console.log("Conversation created successfully:", conversation.id);

          // Перенаправляем на страницу беседы
          this.$router.push({
            name: "Conversation",
            params: { id: conversation._id || conversation.id },
          });

          // Показываем уведомление об успехе
          this.snackbarText = "Повідомлення надіслано власнику групи";
          this.snackbarColor = "success";
          this.snackbar = true;
        } else {
          console.error("No conversation ID returned");
          this.conversationError = "Не вдалося створити бесіду";
        }
      } catch (error) {
        console.error("Error creating conversation:", error);

        // Устанавливаем текст ошибки
        if (error.response?.data?.message) {
          this.conversationError = error.response.data.message;
        } else {
          this.conversationError = "Помилка при створенні бесіди";
        }
      } finally {
        this.conversationLoading = false;
      }
    },

    // Добавьте этот метод, если его еще нет
    checkAuthState() {
      const isAuthenticated = this.$store.getters["auth/isAuthenticated"];
      const token = this.$store.getters["auth/token"];
      const currentUser = this.$store.getters["auth/currentUser"];

      return {
        isAuthenticated,
        hasToken: !!token,
        hasUserData: !!currentUser,
      };
    },
  },

  async mounted() {
    await this.loadGroupData();

    // Проверяем, является ли текущий пользователь участником группы
    if (
      this.isAuthenticated &&
      this.currentUser &&
      this.groupMembers.length > 0
    ) {
      const isMember = this.groupMembers.some(
        (member) =>
          member.userId === this.currentUser._id ||
          member.userId === this.currentUser.id
      );
      console.log("Пользователь является участником группы:", isMember);
    }
  },
};
</script>
