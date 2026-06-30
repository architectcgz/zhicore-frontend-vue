<template>
  <section class="home-page">
    <header class="home-page__header">
      <div>
        <p class="home-page__eyebrow">知构</p>
        <h2>首页</h2>
      </div>
    </header>
    <HomeOverviewWidget />
  </section>
</template>

<script setup lang="ts">
import HomeOverviewWidget from '@/components/home/HomeOverviewWidget.vue'
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 20px;
}

.home-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-page__eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary-soft);
}
</style>
