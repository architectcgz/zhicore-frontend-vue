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
import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import { useHomeDiscoveryRoutePage } from "@/features/home-discovery";

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
} = useHomeDiscoveryRoutePage();
</script>

<style scoped>
.home-route {
  min-width: 0;
}
</style>
