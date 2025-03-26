<template>
  <v-footer color="primary" dark app>
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="6" class="text-center text-sm-left">
          <span
            >&copy; {{ new Date().getFullYear() }} Kolabora BizNetwork
          </span>
        </v-col>
        <v-col cols="12" sm="6" class="text-center text-sm-right">
          <v-btn
            v-for="(link, i) in links"
            :key="i"
            :to="link.to"
            text
            small
            class="mx-1"
          >
            {{ link.text }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: "AppFooter",
  data() {
    return {
      links: [
        { text: "Про нас", to: "/about" },
        { text: "Контакти", to: "/contacts" },
        { text: "Умови використання", to: "/terms" },
        { text: "Політика конфіденційності", to: "/privacy" },
      ],
    };
  },
};
</script>
