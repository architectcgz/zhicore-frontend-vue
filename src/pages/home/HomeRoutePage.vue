<template>
  <HomeDiscoveryFeed
    :discovery="discovery"
    :active-feed-tab="activeFeedTab"
    :search-query="searchQuery"
    @select-feed-tab="selectFeedTab"
    @update:search-query="updateSearchQuery"
  />
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
