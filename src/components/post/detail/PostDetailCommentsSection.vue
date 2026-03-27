<script setup lang="ts">
import type { VNodeRef } from 'vue';
import CommentList from '@/components/comment/CommentList.vue';
import { formatNumber } from '@/utils/post-detail-formatters';

interface Props {
  postId: string;
  commentCount: number;
  setCommentsSectionRef: (element: Element | null) => void;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'comment-count-change': [count: number];
}>();

const commentsSectionRef: VNodeRef = (element) => {
  props.setCommentsSectionRef(element instanceof Element ? element : null);
};
</script>

<template>
  <section
    :ref="commentsSectionRef"
    class="comments-section"
  >
    <div class="comments-section__inner">
      <div class="comments-section__header">
        <div>
          <p class="comments-section__kicker">
            参与讨论
          </p>
          <h2 class="comments-section__title">
            评论
          </h2>
        </div>
        <span class="comments-section__count">
          {{ formatNumber(props.commentCount) }}
        </span>
      </div>

      <CommentList
        :post-id="props.postId"
        @comment-count-change="emit('comment-count-change', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.comments-section {
  padding: 0 var(--space-lg) calc(var(--space-3xl) + 96px);
}

.comments-section__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
  padding: 0 clamp(18px, 2.5vw, 28px) clamp(24px, 4vw, 36px);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border-light);
  background: transparent;
}

.comments-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 0 18px;
  border-bottom: 1px solid var(--color-border);
}

.comments-section__kicker {
  margin: 0 0 12px;
  color: var(--color-text-tertiary);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.comments-section__title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.7rem;
}

.comments-section__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-size: 1.6rem;
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 900px) {
  .comments-section {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .comments-section__inner {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .comments-section {
    padding-bottom: calc(var(--space-3xl) + 112px);
  }
}
</style>
