<template>
  <section class="home-route" aria-label="知构首页">
    <HomeDiscoveryFeed
      :discovery="discovery"
      :active-content-category="activeContentCategory"
      :search-query="searchQuery"
      :feed-state="feedState"
      :feed-error="feedError"
      :engagement-action-error="engagementActionError"
      :show-supplementary-sidebar="showSupplementarySidebar"
      @select-content-category="selectContentCategory"
      @update:search-query="updateSearchQuery"
      @retry="retry"
      @like-post="likePost"
      @favorite-post="favoritePost"
    />
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import { useHomeDiscoveryPage } from "@/features/home-discovery";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const {
  discovery,
  feedState,
  feedError,
  engagementActionError,
  showSupplementarySidebar,
  activeContentCategory,
  searchQuery,
  selectContentCategory,
  updateSearchQuery,
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

<style scoped>
.home-route {
  min-width: 0;
}
</style>
