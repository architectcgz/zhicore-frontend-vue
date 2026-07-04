<template>
  <section class="home-route" aria-label="知构首页">
    <HomeDiscoveryFeed
      :discovery="discovery"
      :active-feed-tab="activeFeedTab"
      :search-query="searchQuery"
      @select-feed-tab="selectFeedTab"
      @update:search-query="updateSearchQuery"
    />
  </section>
</template>

<script setup lang="ts">
import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import { useHomeDiscoveryPage } from "@/features/home-discovery";

const {
  discovery,
  activeFeedTab,
  searchQuery,
  selectFeedTab,
  updateSearchQuery,
} = useHomeDiscoveryPage();
</script>

<style scoped>
.home-route {
  min-width: 0;
}
</style>
