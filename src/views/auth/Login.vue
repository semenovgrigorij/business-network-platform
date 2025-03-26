<template>
  <div>Redirecting to LoginView...</div>
</template>

<script>
export default {
  name: "LoginRedirect",
  created() {
    console.warn(
      "Using deprecated Login.vue component. Please use LoginView.vue instead."
    );
    if (this.$router) {
      this.$router.replace("/login");
    }
  },
};
</script>
