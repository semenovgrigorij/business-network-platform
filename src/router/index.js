// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import BusinessDetailView from "@/views/business/BusinessDetailView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/RegisterView.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/businesses",
    name: "Businesses",
    component: () => import("@/views/business/Catalog.vue"),
  },
  {
    path: "/businesses/:id",
    name: "BusinessDetails",
    component: BusinessDetailView,
    props: true,
  },
  {
    path: "/businesses/new",
    name: "NewBusiness",
    component: () => import("@/views/business/BusinessFormView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/businesses/:id/edit",
    name: "EditBusiness",
    component: () => import("@/views/business/BusinessFormView.vue"),
    props: (route) => ({ id: route.params.id, isEdit: true }),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile", // с малой буквы для соответствия
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/groups",
    name: "Groups",
    component: () => import("@/views/groups/Index.vue"),
  },
  {
    path: "/groups/:id",
    name: "GroupDetail",
    component: () => import("@/views/groups/GroupDetail.vue"),
    props: true,
  },
  {
    path: "/groups/:groupId/posts/:postId",
    name: "GroupPost",
    component: () => import("@/views/groups/Post.vue"),
    props: true,
  },
  {
    path: "/groups/:id",
    name: "GroupDetail",
    component: () => import("@/views/groups/GroupDetail.vue"),
    props: true,
  },
  {
    path: "/messages",
    component: () => import("@/views/messages/MessagesLayout.vue"),
    children: [
      {
        path: "",
        name: "messages",
        component: () => import("@/views/messages/EmptyChat.vue"),
      },
      {
        path: ":id",
        name: "Conversation",
        component: () => import("@/views/messages/ConversationViewNew.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/users/:id",
    name: "UserProfile",
    component: () => import("@/views/UserProfile.vue"),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
  {
    path: "/groups/:id/edit",
    name: "EditGroup",
    component: () => import("@/views/groups/EditGroupView.vue"),
  },
  {
    path: "/groups/:id/edit",
    name: "EditGroup",
    component: () => import("@/views/groups/EditGroupView.vue"),
    meta: {
      requiresAuth: true, // если требуется авторизация
    },
  },
  {
    path: "/groups/:id/edit",
    name: "EditGroup",
    component: () => import("@/views/groups/EditGroupView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (
    to.name === "BusinessDetails" &&
    (!to.params.id || to.params.id === "undefined")
  ) {
    console.warn("Attempting to navigate to BusinessDetails with invalid ID");
    next({ name: "Businesses" });
  } else {
    next();
  }
});

router.onError((error) => {
  console.error("Ошибка маршрутизации:", error);

  // Если маршрут не найден, перенаправляем на главную страницу
  if (error.message.includes("No match")) {
    router.push("/");
  }
});
export default router;
