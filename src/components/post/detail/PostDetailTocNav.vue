<script setup lang="ts">
import type { TocItem } from '@/types/post/detail';

interface Props {
  tocItems: TocItem[];
  activeHeading: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'scroll-to-heading': [anchor: string];
}>();
</script>

<template>
  <nav v-if="props.tocItems.length > 0" class="post-rail-section post-toc" aria-label="文章目录">
    <p class="post-rail-section__kicker">目录导航</p>
    <button
      v-for="(item, index) in props.tocItems"
      :key="item.anchor"
      type="button"
      class="post-toc__item"
      :class="{
        'post-toc__item--nested': item.level > 2,
        'post-toc__item--active': props.activeHeading === item.anchor,
      }"
      @click="emit('scroll-to-heading', item.anchor)"
    >
      <span class="post-toc__index">
        {{ String(index + 1).padStart(2, '0') }}
      </span>
      <span class="post-toc__title">
        {{ item.title }}
      </span>
    </button>
  </nav>
</template>

<style scoped>
.post-rail-section {
  padding: 16px 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface-overlay) 88%, rgba(255, 255, 255, 0.24) 12%),
    color-mix(in srgb, var(--color-surface-overlay) 96%, transparent)
  );
  box-shadow: var(--shadow-sm);
}

.post-rail-section__kicker {
  margin: 0 0 12px;
  color: var(--color-text-tertiary);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-toc {
  max-height: calc(100vh - 132px);
  overflow-y: auto;
}

.post-toc__item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  line-height: 1.5;
  text-align: left;
  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    transform var(--transition-base);
}

.post-toc__item + .post-toc__item {
  margin-top: 6px;
}

.post-toc__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, white 20%);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface-overlay) 86%, transparent);
  color: var(--color-text-tertiary);
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
}

.post-toc__title {
  display: block;
  min-width: 0;
}

.post-toc__item:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  transform: translateX(2px);
}

.post-toc__item--nested {
  padding-left: 22px;
  font-size: 0.88rem;
}

.post-toc__item--active {
  background: var(--color-hover);
  color: var(--color-cta);
}

.post-toc__item--active .post-toc__index {
  border-color: color-mix(in srgb, var(--color-accent) 24%, transparent);
  background: color-mix(in srgb, var(--color-accent) 14%, white 86%);
  color: var(--color-cta);
}

.post-toc__item:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
</style>
