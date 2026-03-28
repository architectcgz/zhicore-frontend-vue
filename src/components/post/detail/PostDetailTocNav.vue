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
  <nav
    v-if="props.tocItems.length > 0"
    class="post-rail-section post-toc"
    aria-label="文章目录"
  >
    <p class="post-rail-section__kicker">
      目录导航
    </p>
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
      <span
        v-if="props.activeHeading === item.anchor"
        class="post-toc__active-dot"
        aria-hidden="true"
      />
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
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.post-toc__item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 8px;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

.post-toc__item + .post-toc__item {
  margin-top: 2px;
}

.post-toc__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 5px;
  border: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface-overlay) 70%, transparent);
  color: var(--color-text-tertiary);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.post-toc__title {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-toc__active-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-accent, #34d399);
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-accent, #34d399) 60%, transparent);
  flex-shrink: 0;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.75); }
}

.post-toc__item:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  transform: translateX(2px);
}

.post-toc__item--nested {
  padding-left: 18px;
  font-size: 0.84rem;
}

.post-toc__item--active {
  background: color-mix(in srgb, var(--color-accent, #34d399) 10%, transparent);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  transform: translateX(2px);
}

.post-toc__item--active .post-toc__index {
  border-color: color-mix(in srgb, var(--color-accent, #34d399) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent, #34d399) 15%, transparent);
  color: var(--color-accent, #34d399);
}

.post-toc__item:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@media (prefers-reduced-motion: reduce) {
  .post-toc__active-dot {
    animation: none;
  }
}
</style>
