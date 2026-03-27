<script setup lang="ts">
import type { HomeQuickLink } from '@/types/home';

interface Props {
  quickLinks: HomeQuickLink[];
}

const props = defineProps<Props>();

const formatKicker = (kicker: HomeQuickLink['kicker']): string => {
  if (kicker === 'Topics') {
    return '主题';
  }

  if (kicker === 'Ranking') {
    return '榜单';
  }

  return '写作';
};
</script>

<template>
  <section class="home-page__quick-grid">
    <router-link
      v-for="link in props.quickLinks"
      :key="link.to"
      :to="link.to"
      class="home-page__quick-card"
    >
      <span class="home-page__quick-kicker">
        {{ formatKicker(link.kicker) }}
      </span>
      <h2 class="home-page__quick-title">
        {{ link.title }}
      </h2>
      <p class="home-page__quick-description">
        {{ link.description }}
      </p>
    </router-link>
  </section>
</template>

<style scoped>
.home-page__quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
}

.home-page__quick-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space-md) 0 var(--space-lg);
  border-radius: 0;
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-base);
}

.home-page__quick-card:hover {
  background: var(--color-bg-hover);
}

.home-page__quick-kicker {
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.74rem;
  color: var(--color-text-tertiary);
}

.home-page__quick-title {
  color: var(--color-text);
  font-size: 1.3rem;
  line-height: 1.35;
}

.home-page__quick-description {
  color: var(--color-text-secondary);
  line-height: 1.75;
}

@media (max-width: 1199px) {
  .home-page__quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .home-page__quick-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
