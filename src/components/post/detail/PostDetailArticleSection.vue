<script setup lang="ts">
import type { VNodeRef } from 'vue';
import PostDetailConclusion from '@/components/post/detail/PostDetailConclusion.vue';
import type { Post, Tag } from '@/types';

interface Props {
  post: Post;
  articleHtml: string;
  postTags: Tag[];
  setArticleBodyRef: (element: Element | null) => void;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'image-error': [event: Event];
}>();

const articleBodyRef: VNodeRef = (element) => {
  props.setArticleBodyRef(element instanceof Element ? element : null);
};
</script>

<template>
  <main class="post-layout">
    <article class="post-article">
      <div
        v-if="props.post.coverImage"
        class="cover-image-wrapper"
      >
        <img
          :src="props.post.coverImage"
          :alt="props.post.title"
          class="cover-image"
          @error="emit('image-error', $event)"
        >
      </div>

      <!-- eslint-disable vue/no-v-html -->
      <div
        :ref="articleBodyRef"
        class="article-body"
        v-html="props.articleHtml"
      />
      <!-- eslint-enable vue/no-v-html -->
    </article>

    <PostDetailConclusion :post-tags="props.postTags" />
  </main>
</template>

<style scoped>
.post-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.post-article {
  padding: clamp(10px, 1.8vw, 18px) 0 0;
  background: transparent;
}

.cover-image-wrapper {
  overflow: hidden;
  margin-bottom: var(--space-2xl);
  border-radius: calc(var(--radius-xl) - 6px);
  box-shadow: var(--shadow-md);
}

.cover-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.article-body {
  max-width: min(100%, 78ch);
  color: var(--color-text);
  font-size: 1.08rem;
  line-height: var(--line-height-relaxed);
}

.article-body :deep(*) {
  max-width: 100%;
}

.article-body :deep(h2) {
  margin-top: var(--space-3xl);
  margin-bottom: var(--space-lg);
  color: var(--color-text);
  font-size: clamp(1.7rem, 2vw, 2.1rem);
  line-height: 1.2;
}

.article-body :deep(h3) {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
  color: var(--color-text);
  font-size: clamp(1.3rem, 1.6vw, 1.55rem);
  line-height: 1.28;
}

.article-body :deep(.article-heading-anchor) {
  scroll-margin-top: 112px;
}

.article-body :deep(p),
.article-body :deep(ul),
.article-body :deep(ol),
.article-body :deep(blockquote),
.article-body :deep(pre),
.article-body :deep(table) {
  margin-bottom: var(--space-lg);
}

.article-body :deep(ul),
.article-body :deep(ol) {
  padding-left: 1.3em;
}

.article-body :deep(li + li) {
  margin-top: 0.35em;
}

.article-body :deep(a) {
  color: var(--color-cta);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.article-body :deep(a:hover) {
  color: var(--color-cta-hover);
}

.article-body :deep(blockquote) {
  padding: 16px 18px;
  border-left: 3px solid var(--color-accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--color-surface-overlay);
  color: var(--color-text-secondary);
}

.article-body :deep(img) {
  width: 100%;
  height: auto;
  margin: var(--space-xl) 0;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.article-body :deep(hr) {
  height: 1px;
  margin: var(--space-2xl) 0;
  border: 0;
  background: var(--color-border);
}

.article-body :deep(code) {
  padding: 0.18em 0.44em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-overlay);
  color: var(--color-text);
  font-size: 0.92em;
  font-family: var(--font-mono);
}

.article-body :deep(pre) {
  overflow-x: auto;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.article-body :deep(pre code) {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-inverse);
}

.article-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.article-body :deep(th),
.article-body :deep(td) {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border-light);
  text-align: left;
}

.article-body :deep(th) {
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

@media (max-width: 900px) {
  .article-body {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .post-article {
    padding: 12px 0 0;
  }
}

@media (max-width: 480px) {
  .article-body {
    font-size: 1rem;
  }
}
</style>
