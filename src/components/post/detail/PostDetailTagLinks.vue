<script setup lang="ts">
import { computed } from 'vue';
import type { Tag } from '@/types';

interface Props {
  tags: Tag[];
  variant?: 'header' | 'conclusion';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'header',
});

const rootClass = computed(() =>
  props.variant === 'conclusion' ? 'post-tags post-tags--conclusion' : 'post-tags post-tags--header'
);

const itemClass = computed(() =>
  props.variant === 'conclusion' ? 'post-tags__item post-tags__item--conclusion' : 'post-tags__item'
);
</script>

<template>
  <div v-if="props.tags.length > 0" :class="rootClass">
    <router-link
      v-for="tag in props.tags"
      :key="tag.id"
      :to="`/tags/${tag.slug}`"
      :class="itemClass"
    >
      #{{ tag.name }}
    </router-link>
  </div>
</template>

<style scoped>
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.post-tags--header {
  margin-top: 18px;
}

.post-tags--conclusion {
  justify-content: flex-end;
}

.post-tags__item {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-cta);
  font-size: 0.88rem;
  transition:
    transform var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base);
}

.post-tags__item--conclusion {
  min-height: 40px;
}

.post-tags__item:hover {
  transform: translateY(-1px);
  background: var(--color-bg-hover);
  border-color: var(--color-border-dark);
}

.post-tags__item:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@media (max-width: 900px) {
  .post-tags--conclusion {
    justify-content: flex-start;
  }
}
</style>
