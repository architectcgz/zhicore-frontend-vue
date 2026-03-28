<script setup lang="ts">
import { watchEffect } from 'vue';
import PostDetailReadingOverview from '@/components/post/detail/PostDetailReadingOverview.vue';
import PostDetailTocNav from '@/components/post/detail/PostDetailTocNav.vue';
import type { TocItem } from '@/types/post/detail';

interface Props {
  readingProgressPercent: number;
  readingTime: number;
  sectionCount: number;
  tocItems: TocItem[];
  activeHeading: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'scroll-to-heading': [anchor: string];
}>();

watchEffect(() => {
  document.documentElement.style.setProperty(
    '--post-reading-progress',
    `${props.readingProgressPercent}%`,
  );
});
</script>

<template>
  <Teleport to="#post-detail-reading-slot">
    <aside class="post-reading-rail">
      <PostDetailReadingOverview
        :reading-progress-percent="props.readingProgressPercent"
        :reading-time="props.readingTime"
        :section-count="props.sectionCount"
      />

      <PostDetailTocNav
        :toc-items="props.tocItems"
        :active-heading="props.activeHeading"
        @scroll-to-heading="emit('scroll-to-heading', $event)"
      />
    </aside>
  </Teleport>
</template>

<style scoped>
.post-reading-rail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  width: 208px;
  margin-top: 18px;
}

@media (max-width: 1180px) {
  .post-reading-rail {
    display: none;
  }
}
</style>
