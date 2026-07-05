<template>
  <section class="home-route" aria-label="知构首页">
    <HomeDiscoveryFeed
      :discovery="discovery"
      :active-content-category="activeContentCategory"
      :search-query="searchQuery"
      @select-content-category="selectContentCategory"
      @update:search-query="updateSearchQuery"
    />
  </section>
</template>

<script setup lang="ts">
import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import { useHomeDiscoveryPage } from "@/features/home-discovery";

const {
  discovery,
  activeContentCategory,
  searchQuery,
  selectContentCategory,
  updateSearchQuery,
} = useHomeDiscoveryPage();
</script>

<style scoped>
.home-route {
  min-width: 0;
}
</style>
