<template>
  <section class="article-detail-mobile">
    <article ref="articleRef" class="article-detail-mobile__content">
      <p class="article-detail-mobile__eyebrow">{{ detail.eyebrow }}</p>
      <h1>{{ detail.title }}</h1>
      <div class="article-detail-mobile__meta">
        <span class="article-detail-mobile__avatar">{{
          detail.authorInitial
        }}</span>
        <div>
          <p>{{ detail.authorMeta }}</p>
          <div class="article-detail-mobile__status-row">
            <span
              v-for="status in detail.statuses"
              :key="status.label"
              class="article-detail-mobile__status"
              :class="`article-detail-mobile__status--${status.tone}`"
            >
              {{ status.label }}
            </span>
          </div>
        </div>
      </div>

      <div class="article-detail-mobile__cover" aria-hidden="true" />

      <div class="article-detail-mobile__body reading-typography">
        <template v-for="(block, index) in detail.bodyBlocks" :key="index">
          <h2
            v-if="block.kind === 'heading'"
            :id="block.id"
            class="article-detail-mobile__body-heading reading-typography__heading"
          >
            {{ block.text }}
          </h2>
          <p
            v-else-if="block.kind === 'paragraph'"
            class="article-detail-mobile__body-paragraph reading-typography__paragraph"
          >
            {{ block.text }}
          </p>
          <blockquote
            v-else
            class="article-detail-mobile__body-quote reading-typography__quote"
          >
            {{ block.text }}
          </blockquote>
        </template>
      </div>

      <ArticleComments
        :comments="detail.comments"
        :count-label="detail.commentsTotalLabel"
        :title="detail.commentsTitle"
        :sort-tabs="detail.commentSortTabs"
        :active-sort="activeCommentSort"
        :draft-body="commentDraftBody"
        :submitting-comment="submittingComment"
        :comment-submit-error="commentSubmitError"
        :comments-state="commentsState"
        :comments-error="commentsError"
        @select-sort="$emit('selectCommentSort', $event)"
        @update:draft-body="$emit('update:commentDraftBody', $event)"
        @submit-comment="$emit('submitComment')"
        @retry-comments="$emit('retryComments')"
      />
    </article>

    <button
      type="button"
      class="article-detail-mobile__fab"
      data-testid="mobile-article-actions-toggle"
      aria-controls="article-detail-mobile-actions"
      :aria-expanded="isActionSheetOpen"
      aria-label="打开文章操作"
      @click="toggleActionSheet"
    >
      <MoreHorizontal aria-hidden="true" />
      <span class="article-detail-mobile__fab-count">
        {{ detail.readingActions.likeCountLabel }}
      </span>
    </button>

    <div
      v-if="isActionSheetOpen"
      class="article-detail-mobile__sheet-overlay"
      data-testid="mobile-article-actions"
      @click.self="closeActionSheet"
    >
      <section
        id="article-detail-mobile-actions"
        class="article-detail-mobile__sheet"
        aria-label="文章操作与导航"
      >
        <div class="article-detail-mobile__action-grid">
          <button
            type="button"
            :aria-label="`喜欢，${detail.readingActions.likeCountLabel} 次`"
            :disabled="submittingLike"
            @click="$emit('likePost')"
          >
            <ThumbsUp aria-hidden="true" />
            <strong>{{ detail.readingActions.likeCountLabel }}</strong>
            <span>点赞</span>
          </button>
          <button
            type="button"
            :class="{ 'is-unknown': detail.readingActions.bookmarkUnavailable }"
            aria-label="收藏状态暂不可用"
            :disabled="submittingFavorite"
            @click="$emit('favoritePost')"
          >
            <Bookmark aria-hidden="true" />
            <strong>{{ detail.readingActions.bookmarkCountLabel }}</strong>
            <span>收藏</span>
          </button>
          <a
            href="#comments"
            :aria-label="`查看评论，${detail.readingActions.commentCountLabel} 条`"
            @click="closeActionSheet"
          >
            <MessageCircle aria-hidden="true" />
            <strong>{{ detail.readingActions.commentCountLabel }}</strong>
            <span>评论</span>
          </a>
          <button
            type="button"
            aria-label="分享文章"
            @click="$emit('sharePost')"
          >
            <Share2 aria-hidden="true" />
            <strong>{{ detail.readingActions.shareLabel }}</strong>
            <span>转发</span>
          </button>
        </div>

        <p
          v-if="readingActionError || detail.readingActions.bookmarkUnavailable"
          class="article-detail-mobile__action-note"
        >
          {{ readingActionError || detail.readingActions.note }}
        </p>

        <nav class="article-detail-mobile__toc" aria-label="本文导航">
          <div class="article-detail-mobile__toc-head">
            <h2>本文导航</h2>
            <div
              class="article-detail-mobile__progress"
              :aria-label="`阅读进度 ${progressPercent}%`"
              :style="{ '--article-progress': `${progressPercent}%` }"
            >
              <span />
            </div>
          </div>
          <a
            v-for="tocItem in detail.tocItems"
            :key="tocItem.label"
            :href="tocItem.href"
            :class="{ 'is-active': tocItem.href === activeHeadingHref }"
            @click="closeActionSheet"
          >
            <ListTree aria-hidden="true" />
            {{ tocItem.label }}
          </a>
        </nav>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Bookmark,
  ThumbsUp,
  ListTree,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "@lucide/vue";
import { ref, useTemplateRef } from "vue";

import type { ArticleDetailData } from "@/features/content-detail";

import "@/components/common/ReadingTypography.css";

import ArticleComments from "./ArticleComments.vue";
import { useArticleReadingProgress } from "./useArticleReadingProgress";

defineEmits<{
  selectCommentSort: [sort: string];
  "update:commentDraftBody": [body: string];
  submitComment: [];
  retryComments: [];
  likePost: [];
  favoritePost: [];
  sharePost: [];
}>();

const props = defineProps<{
  detail: ArticleDetailData;
  activeCommentSort: string;
  commentDraftBody: string;
  submittingComment: boolean;
  commentSubmitError: string;
  commentsState: "idle" | "loading" | "ready" | "error";
  commentsError: string;
  submittingLike: boolean;
  submittingFavorite: boolean;
  readingActionError: string;
}>();

const articleRef = useTemplateRef<HTMLElement>("articleRef");
const isActionSheetOpen = ref(false);
const initialActiveHeadingHref =
  props.detail.tocItems.find(
    (tocItem) => tocItem.label === props.detail.activeTocLabel,
  )?.href ??
  props.detail.tocItems[0]?.href ??
  "";
const { activeHeadingHref, progressPercent } = useArticleReadingProgress(
  articleRef,
  props.detail.progressPercent,
  initialActiveHeadingHref,
);

function toggleActionSheet(): void {
  isActionSheetOpen.value = !isActionSheetOpen.value;
}

function closeActionSheet(): void {
  isActionSheetOpen.value = false;
}
</script>

<style scoped>
.article-detail-mobile {
  position: relative;
}

.article-detail-mobile__content {
  padding: var(--space-1) 0
    calc(var(--space-12) + env(safe-area-inset-bottom, 0px));
}

.article-detail-mobile__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

.article-detail-mobile__content h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 2rem;
  line-height: 1.2;
  letter-spacing: 0;
}

.article-detail-mobile__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-5) 0 var(--space-6);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.article-detail-mobile__meta p {
  margin: 0 0 var(--space-2);
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  font-weight: 500;
}

.article-detail-mobile__avatar {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-weight: 700;
}

.article-detail-mobile__status-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.article-detail-mobile__status {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-soft);
  font-size: 0.75rem;
  font-weight: 500;
}

.article-detail-mobile__status--ok {
  color: var(--color-accent);
}

.article-detail-mobile__status--warn,
.article-detail-mobile__action-grid .is-unknown {
  color: var(--color-warning);
}

.article-detail-mobile__cover {
  min-height: 16.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary) 18%, transparent),
      transparent 62%
    ),
    linear-gradient(
      45deg,
      transparent 0 44%,
      color-mix(in srgb, var(--color-accent) 30%, transparent) 45% 50%,
      transparent 51%
    ),
    var(--color-bg-hover);
}

.article-detail-mobile__body {
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
}

.article-detail-mobile__body-heading {
  color: var(--color-text-strong);
  scroll-margin-top: 5rem;
}

.article-detail-mobile__body-quote {
  --reading-block-border: color-mix(
    in srgb,
    var(--color-accent) 32%,
    var(--color-border)
  );
}

.article-detail-mobile__fab {
  position: fixed;
  right: var(--space-5);
  bottom: calc(var(--space-5) + env(safe-area-inset-bottom, 0px));
  z-index: 80;
  display: grid;
  width: 4rem;
  height: 4rem;
  padding: 0;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  box-shadow: var(--shadow-panel);
  cursor: pointer;
  transform: translateZ(0);
}

.article-detail-mobile__fab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.article-detail-mobile__fab svg {
  width: 1.5rem;
  height: 1.5rem;
}

.article-detail-mobile__fab-count {
  position: absolute;
  right: -0.25rem;
  top: -0.25rem;
  display: grid;
  min-width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  padding: 0 var(--space-1);
  border: 1px solid var(--color-bg-elevated);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-bg-elevated);
  font-size: 0.75rem;
  font-weight: 850;
  line-height: 1;
}

.article-detail-mobile__sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: flex-end;
  background: color-mix(in srgb, var(--color-text-strong) 30%, transparent);
}

.article-detail-mobile__sheet {
  display: grid;
  width: 100%;
  max-height: min(78vh, 36rem);
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4)
    calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
  overflow: auto;
  border: 1px solid var(--color-border);
  border-bottom: 0;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-panel);
}

.article-detail-mobile__action-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
}

.article-detail-mobile__action-grid button,
.article-detail-mobile__action-grid a {
  display: grid;
  min-height: 4.25rem;
  gap: var(--space-1);
  place-items: center;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-hover);
  color: var(--color-text);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.article-detail-mobile__action-grid svg {
  width: 1.125rem;
  height: 1.125rem;
}

.article-detail-mobile__action-grid strong {
  color: var(--color-text-strong);
  font-size: 0.875rem;
}

.article-detail-mobile__action-grid span {
  color: var(--color-text-soft);
  font-size: 0.75rem;
  font-weight: 750;
}

.article-detail-mobile__action-note {
  margin: 0;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(
    in srgb,
    var(--color-warning) 10%,
    var(--color-bg-elevated)
  );
  color: var(--color-warning);
  font-size: 0.8125rem;
  font-weight: 750;
  line-height: 1.6;
}

.article-detail-mobile__toc {
  display: grid;
  gap: var(--space-2);
}

.article-detail-mobile__toc-head {
  display: grid;
  gap: var(--space-2);
}

.article-detail-mobile__toc h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1rem;
  letter-spacing: 0;
}

.article-detail-mobile__progress {
  height: 0.25rem;
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-bg-hover);
}

.article-detail-mobile__progress span {
  display: block;
  width: var(--article-progress);
  height: 100%;
  border-radius: inherit;
  background: var(--color-accent);
}

.article-detail-mobile__toc a {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-text-soft);
  font-weight: 750;
  text-decoration: none;
}

.article-detail-mobile__toc a.is-active {
  background: color-mix(
    in srgb,
    var(--color-accent) 12%,
    var(--color-bg-hover)
  );
  color: var(--color-text-strong);
}

.article-detail-mobile__toc svg {
  width: 1rem;
  height: 1rem;
}
</style>
