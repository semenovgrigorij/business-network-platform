<template>
  <div>
    <!-- Hero секция -->
    <section class="hero-section py-12 bg-blue-lighten-5">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <h1 class="text-h3 font-weight-bold mb-4">
              Поєднуючи Світ: Наша Платформа для Вашого бізнесу
            </h1>
            <p class="text-subtitle-1 mb-6">
              Ми - платформа нетворкінгу, створена для того, щоб об'єднувати
              професіоналів, підприємців та ентузіастів із різних куточків
              світу. Наша місія - надати вам інструменти та можливості для
              побудови значущих зв'язків, обміну досвідом та досягнення
              кар'єрних висот. З нами ви знайдете однодумців, наставників і
              партнерів, які допоможуть вам рости і розвиватися.
            </p>
            <div>
              <v-btn color="primary" size="large" class="mr-3" to="/register">
                Почати безкоштовно
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-center">
            <v-img
              src="/images/design/group-businesspeople-stacking-their-hand-office .jpg"
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
        <h2 class="text-h4 text-center mb-8">Для чого працюємо?</h2>
        <p class="text-subtitle-1 mb-6">
          Ми працюємо, щоб зробити процес нетворкінгу простим та ефективним.
          Наша платформа пропонує зручні функції для пошуку контактів,
          організації заходів та участі в професійних спільнотах. Ми прагнемо
          створити середовище, де кожен учасник зможе знайти підтримку,
          натхнення та нові можливості для професійного зростання. Разом ми
          будуємо майбутнє, де зв'язки та співпраця стають ключем до успіху.
        </p>
      </v-container>
    </section>

    <!-- Секция отраслей -->
    <section class="industries-section py-12 bg-grey-lighten-4">
      <v-container>
        <h2 class="text-h4 text-center mb-8">Хто з нами співпрацює?</h2>
        <p class="text-subtitle-1 mb-6">
          Нашими партнерами є виробничі компанії, освітні та медичні заклади,
          професійні асоціації. Ми пишаємося співпрацею з лідерами галузі, які
          поділяють наші цінності та прагнуть до розвитку й інновацій. Разом із
          нашими партнерами ми організовуємо ексклюзивні заходи, майстер-класи
          та вебінари, які допомагають нашим користувачам бути в курсі останніх
          тенденцій і трендів. Приєднуйтесь до нас і станьте частиною глобальної
          спільноти, де кожен голос має значення.
        </p>
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
  name: "AboutPage",
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
