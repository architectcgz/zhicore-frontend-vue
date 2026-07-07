<template>
  <HomeDiscoveryExploreWorkspace
    :discovery="discovery"
    :feed-state="feedState"
    :feed-error="feedError"
    :engagement-action-error="engagementActionError"
    :active-content-category="activeContentCategory"
    @select-content-category="selectContentCategory"
    @retry="retry"
    @like-post="likePost"
    @favorite-post="favoritePost"
  />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

import {
  HomeDiscoveryExploreWorkspace,
  useHomeDiscoveryPage,
} from "@/features/home-discovery";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const {
  discovery,
  feedState,
  feedError,
  engagementActionError,
  activeContentCategory,
  selectContentCategory,
  retry,
  likePost,
  favoritePost,
} = useHomeDiscoveryPage({
  isLoggedIn: () => authStore.isLoggedIn,
  restoreSession: () => authStore.restore(),
  redirectToLogin: async () => {
    await router.push({
      path: "/auth/login",
      query: {
        redirect: route.fullPath,
      },
    });
  },
});
</script>
