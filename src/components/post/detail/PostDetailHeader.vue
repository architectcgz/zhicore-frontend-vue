<script setup lang="ts">
import type { Post, PostReadingPresence, Tag } from '@/types';
import PostDetailBreadcrumb from '@/components/post/detail/PostDetailBreadcrumb.vue';
import PostDetailHeaderMeta from '@/components/post/detail/PostDetailHeaderMeta.vue';
import PostDetailTagLinks from '@/components/post/detail/PostDetailTagLinks.vue';

interface Props {
  post: Post;
  sectionCount: number;
  articleSummary: string;
  defaultAvatar: string;
  readingTime: number;
  commentCount: number;
  readingPresence: PostReadingPresence;
  headerTags: Tag[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'avatar-error': [event: Event];
}>();
</script>

<template>
  <section class="post-content-header">
    <div class="post-content-header__inner">
      <PostDetailBreadcrumb />

      <div class="post-content-header__eyebrow">
        <span v-if="props.sectionCount > 0" class="post-content-header__eyebrow-text">
          {{ props.sectionCount }} 个章节
        </span>
      </div>

      <h1 class="post-title">
        {{ props.post.title }}
      </h1>

      <p v-if="props.articleSummary" class="post-summary">
        {{ props.articleSummary }}
      </p>

      <PostDetailHeaderMeta
        :post="props.post"
        :default-avatar="props.defaultAvatar"
        :reading-time="props.readingTime"
        :comment-count="props.commentCount"
        :reading-presence="props.readingPresence"
        @avatar-error="emit('avatar-error', $event)"
      />

      <PostDetailTagLinks :tags="props.headerTags" />
    </div>
  </section>
</template>

<style scoped>
.post-content-header {
  position: relative;
  z-index: 1;
  isolation: isolate;
  overflow: visible;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text);
  box-shadow: none;
}

.post-content-header__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
  padding: calc(var(--space-lg) + 12px) var(--space-md) calc(var(--space-3xl) - 10px);
}

.post-content-header__eyebrow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.post-content-header__eyebrow-text {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  letter-spacing: 0.04em;
}

.post-title {
  max-width: 100%;
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-family: var(--font-heading);
  color: var(--color-text);
  line-height: 1.04;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.post-summary {
  max-width: 760px;
  margin-top: 18px;
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .post-content-header__inner {
    padding: calc(var(--space-md) + 10px) var(--space-sm) calc(var(--space-2xl) - 8px);
  }

  .post-title {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .post-title {
    font-size: clamp(1.45rem, 5.2vw, 2.05rem);
  }

  .post-summary {
    font-size: 1rem;
  }
}
</style>
