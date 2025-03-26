<template>
  <div>
    <!-- Hero секция -->
    <section class="hero-section py-12 bg-blue-lighten-5">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <h1 class="text-h3 font-weight-bold mb-4">
              Знайдіть ідеальних бізнес-партнерів
            </h1>
            <p class="text-subtitle-1 mb-6">
              Платформа для нетворкінгу, яка допомагає бізнесам знаходити
              надійних партнерів, клієнтів та постачальників через систему
              рекомендацій та груп за інтересами.
            </p>
            <div>
              <v-btn color="primary" size="large" class="mr-3" to="/register">
                Почати безкоштовно
              </v-btn>
              <v-btn variant="outlined" size="large" to="/about">
                Дізнатись більше
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-center">
            <v-img
              src="/images/design/logo.png"
              alt="Головне зображення"
              class="mx-auto"
              max-width="500"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Секция возможностей -->
    <section class="features-section py-12">
      <v-container>
        <h2 class="text-h4 text-center mb-8">Можливості платформи</h2>
        <v-row>
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            md="4"
          >
            <v-card height="100%" class="d-flex flex-column">
              <v-card-item>
                <v-card-title>
                  <v-icon
                    :icon="feature.icon"
                    size="x-large"
                    color="primary"
                    class="mb-3"
                  ></v-icon>
                  <div>{{ feature.title }}</div>
                </v-card-title>
                <v-card-text>{{ feature.description }}</v-card-text>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Секция отраслей -->
    <section class="industries-section py-12 bg-grey-lighten-4">
      <v-container>
        <h2 class="text-h4 text-center mb-8">Популярні галузі</h2>
        <v-row>
          <v-col
            v-for="industry in industries"
            :key="industry.name"
            cols="6"
            sm="4"
            md="3"
          >
            <v-card class="text-center">
              <v-card-item>
                <v-icon
                  :icon="industry.icon"
                  size="large"
                  color="primary"
                  class="mb-2"
                ></v-icon>
                <v-card-title class="text-subtitle-1">
                  {{ industry.name }}
                </v-card-title>
                <v-card-subtitle>
                  {{ industry.count }} компаній
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA секция -->
    <section class="cta-section py-12 bg-primary">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h4 text-white mb-6">Чи готові до співпраці?</h2>
            <p class="text-subtitle-1 text-white mb-6">
              Приєднуйтесь до нашої платформи сьогодні та почніть знаходити
              бізнес-партнерів та можливості для зростання.
            </p>
            <v-btn
              color="white"
              size="large"
              to="/register"
              class="primary--text"
            >
              Зареєструвати компанію
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      features: [
        {
          icon: "mdi-handshake",
          title: "Бізнес-нетворкінг",
          description:
            "Знаходьте надійних партнерів на основі взаємних рекомендацій та сфери діяльності",
        },
        {
          icon: "mdi-account-group",
          title: "Тематичні групи",
          description:
            "Приєднуйтесь до професійних груп та обговорюйте питання бізнесу",
        },
        {
          icon: "mdi-thumb-up",
          title: "Взаємні рекомендації",
          description:
            "Отримуйте та залишайте рекомендації, підвищуючи довіру до вашого бізнесу",
        },
      ],
      industries: [
        { name: "Роздрібна торгівля", icon: "mdi-store", count: 1245 },
        { name: "Громадське харчування", icon: "mdi-food", count: 867 },
        { name: "Послуги та сервіс", icon: "mdi-tools", count: 1543 },
        { name: "Логістика", icon: "mdi-truck", count: 632 },
        { name: "IT та технології", icon: "mdi-laptop", count: 986 },
        { name: "Будівництво", icon: "mdi-hammer", count: 745 },
        { name: "Охорона здоров'я", icon: "mdi-medical-bag", count: 421 },
        { name: "Освіта", icon: "mdi-school", count: 312 },
      ],
    };
  },
};
</script>
