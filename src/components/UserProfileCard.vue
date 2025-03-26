<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-avatar size="64" color="grey-lighten-3" class="mr-4">
        <v-img
          v-if="user && user.avatar"
          :src="user.avatar"
          alt="User Avatar"
        ></v-img>
        <v-icon v-else size="40" color="grey-darken-2">mdi-account</v-icon>
      </v-avatar>
      <div>
        <h3 class="text-h6">{{ fullName }}</h3>
        <p class="text-body-2 mb-1" v-if="user?.jobTitle">
          {{ user.jobTitle }}
        </p>
        <p class="text-body-2" v-if="user?.location">
          <v-icon size="small">mdi-map-marker</v-icon>
          {{ user.location }}
        </p>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex flex-column align-end">
        <slot name="actions"></slot>
      </div>
    </div>
    <v-divider v-if="showDetails"></v-divider>
    <div v-if="showDetails" class="mt-3">
      <p v-if="user?.bio" class="text-body-2 mb-3">{{ user.bio }}</p>
      <div
        v-if="
          hasSocialLinks &&
          (showAllDetails || user?.privacySettings?.showSocial !== false)
        "
        class="mb-2"
      >
        <v-btn
          v-if="user?.linkedinUrl"
          :href="user.linkedinUrl"
          target="_blank"
          icon
          variant="text"
          color="blue"
          size="small"
          class="mr-1"
        >
          <v-icon>mdi-linkedin</v-icon>
        </v-btn>
        <v-btn
          v-if="user?.facebookUrl"
          :href="user.facebookUrl"
          target="_blank"
          icon
          variant="text"
          color="blue-darken-3"
          size="small"
          class="mr-1"
        >
          <v-icon>mdi-facebook</v-icon>
        </v-btn>
        <v-btn
          v-if="user?.instagramUrl"
          :href="user.instagramUrl"
          target="_blank"
          icon
          variant="text"
          color="purple"
          size="small"
          class="mr-1"
        >
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
        <v-btn
          v-if="user?.twitterUrl"
          :href="user.twitterUrl"
          target="_blank"
          icon
          variant="text"
          color="light-blue"
          size="small"
        >
          <v-icon>mdi-twitter</v-icon>
        </v-btn>
      </div>
      <div v-if="user?.skills && user.skills.length > 0" class="mb-2">
        <span class="text-caption text-grey">Навички:</span>
        <div class="d-flex flex-wrap mt-1">
          <v-chip
            v-for="skill in user.skills.slice(0, 5)"
            :key="skill"
            size="x-small"
            class="mr-1 mb-1"
          >
            {{ skill }}
          </v-chip>
          <v-chip v-if="user.skills.length > 5" size="x-small"
            >+{{ user.skills.length - 5 }}</v-chip
          >
        </div>
      </div>
      <div v-if="showContact" class="mt-3">
        <v-btn color="primary" variant="tonal" block @click="$emit('contact')">
          <v-icon start>mdi-message</v-icon>
          Надіслати повідомлення
        </v-btn>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "UserProfileCard",

  props: {
    user: {
      type: Object,
      required: true,
    },
    showDetails: {
      type: Boolean,
      default: true,
    },
    showContact: {
      type: Boolean,
      default: false,
    },
    showAllDetails: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    fullName() {
      if (!this.user) return "";
      console.log("User data in UserProfileCard:", this.user);
      return `${this.user.firstName} ${this.user.lastName}`;
    },

    hasSocialLinks() {
      return !!(
        this.user?.linkedinUrl ||
        this.user?.facebookUrl ||
        this.user?.instagramUrl ||
        this.user?.twitterUrl
      );
    },
  },

  emits: ["contact"],
};
</script>
