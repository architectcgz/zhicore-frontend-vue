<template>
  <section class="home-route" aria-label="知构首页">
    <HomeOverviewWidget />
  </section>
</template>

<script setup lang="ts">
import HomeOverviewWidget from "@/components/home/HomeOverviewWidget.vue";
</script>

<style scoped>
.home-route {
  min-width: 0;
}
</style>
