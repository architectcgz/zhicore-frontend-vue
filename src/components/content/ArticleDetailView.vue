<template>
  <section class="article-detail">
    <aside class="article-detail__toc" aria-label="文章导航">
      <h2>本文导航</h2>
      <div
        class="article-detail__toc-list"
        :style="{
          '--article-progress': `${progressPercent}%`,
          '--article-progress-scale': tocProgressScale,
        }"
      >
        <div
          class="article-detail__progress"
          role="progressbar"
          :aria-label="`阅读进度 ${progressPercent}%`"
          :aria-valuenow="progressPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        />
        <a
          v-for="tocItem in detail.tocItems"
          :key="tocItem.label"
          :href="tocItem.href"
          :class="{ 'is-active': tocItem.href === activeHeadingHref }"
        >
          {{ tocItem.label }}
        </a>
      </div>
    </aside>

    <article ref="articleRef" class="article-detail__content">
      <div class="article-detail__reading-card">
        <p class="article-detail__eyebrow">{{ detail.eyebrow }}</p>
        <h1>{{ detail.title }}</h1>
        <div class="article-detail__meta">
          <span class="article-detail__avatar">{{ detail.authorInitial }}</span>
          <div>
            <p>{{ detail.authorMeta }}</p>
            <div class="article-detail__status-row">
              <span
                v-for="status in detail.statuses"
                :key="status.label"
                class="article-detail__status"
                :class="`article-detail__status--${status.tone}`"
              >
                {{ status.label }}
              </span>
            </div>
          </div>
        </div>

        <div class="article-detail__body reading-typography">
          <template v-for="(block, index) in detail.bodyBlocks" :key="index">
            <h2
              v-if="block.kind === 'heading'"
              :id="block.id"
              class="article-detail__body-heading reading-typography__heading"
            >
              {{ block.text }}
            </h2>
            <p
              v-else-if="block.kind === 'paragraph'"
              class="article-detail__body-paragraph reading-typography__paragraph"
            >
              {{ block.text }}
            </p>
            <blockquote
              v-else
              class="article-detail__body-quote reading-typography__quote"
            >
              {{ block.text }}
            </blockquote>
          </template>
        </div>

        <div class="article-detail__related-section">
          <div class="article-detail__related-header">
            <h2 id="related-reading" class="article-detail__related-title">
              相关阅读
            </h2>
            <a href="/explore" class="article-detail__related-more">
              View more
              <ChevronRight aria-hidden="true" />
            </a>
          </div>
          <div class="article-detail__related-list">
            <a
              v-for="item in detail.relatedPosts"
              :key="item.id"
              :href="`/posts/${item.id}`"
              class="article-detail__related-card"
            >
              <div
                class="article-detail__related-card-cover"
                aria-hidden="true"
              />
              <div class="article-detail__related-card-content">
                <strong>{{ item.title }}</strong>
                <span>{{ item.meta }}</span>
              </div>
            </a>
          </div>
        </div>

        <ArticleComments
          variant="dock"
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
      </div>
    </article>

    <aside class="article-detail__rail">
      <div class="article-detail__actions">
        <button
          type="button"
          class="article-detail__action-btn"
          :aria-label="`喜欢，${detail.readingActions.likeCountLabel} 次`"
          :disabled="submittingLike"
          @click="$emit('likePost')"
        >
          <div class="article-detail__action-icon">
            <ThumbsUp aria-hidden="true" />
          </div>
          <div class="article-detail__action-text">
            <strong>Like</strong>
            <span>{{ detail.readingActions.likeCountLabel }}</span>
          </div>
        </button>
        <button
          :class="[
            'article-detail__action-btn',
            { 'is-unknown': detail.readingActions.bookmarkUnavailable },
          ]"
          type="button"
          aria-label="收藏状态暂不可用"
          :disabled="submittingFavorite"
          @click="$emit('favoritePost')"
        >
          <div class="article-detail__action-icon">
            <Bookmark aria-hidden="true" />
          </div>
          <div class="article-detail__action-text">
            <strong>Save</strong>
            <span>{{ detail.readingActions.bookmarkCountLabel }}</span>
          </div>
        </button>
        <a
          href="#comments"
          class="article-detail__action-btn is-active"
          :aria-label="`查看评论，${detail.readingActions.commentCountLabel} 条`"
        >
          <div class="article-detail__action-icon">
            <MessageCircle aria-hidden="true" />
          </div>
          <div class="article-detail__action-text">
            <strong>Comment</strong>
            <span>{{ detail.readingActions.commentCountLabel }}</span>
          </div>
        </a>
        <button
          class="article-detail__action-btn"
          type="button"
          aria-label="分享文章"
          @click="$emit('sharePost')"
        >
          <div class="article-detail__action-icon">
            <Share2 aria-hidden="true" />
          </div>
          <div class="article-detail__action-text">
            <strong>{{ detail.readingActions.shareLabel || "Share" }}</strong>
          </div>
        </button>
      </div>

      <p
        v-if="readingActionError || detail.readingActions.note"
        class="article-detail__note"
      >
        {{ readingActionError || detail.readingActions.note }}
      </p>
    </aside>
  </section>
</template>

<script setup lang="ts">
import {
  Bookmark,
  ChevronRight,
  MessageCircle,
  Share2,
  ThumbsUp,
} from "@lucide/vue";
import { useTemplateRef } from "vue";

import type { ArticleDetailData } from "@/features/content-detail";

import "@/components/common/ReadingTypography.css";

import ArticleComments from "./ArticleComments.vue";
import { useArticleReadingProgress } from "./useArticleReadingProgress";

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

defineEmits<{
  selectCommentSort: [sort: string];
  "update:commentDraftBody": [body: string];
  submitComment: [];
  retryComments: [];
  likePost: [];
  favoritePost: [];
  sharePost: [];
}>();

const articleRef = useTemplateRef<HTMLElement>("articleRef");
const initialActiveHeadingHref =
  props.detail.tocItems.find(
    (tocItem) => tocItem.label === props.detail.activeTocLabel,
  )?.href ??
  props.detail.tocItems[0]?.href ??
  "";
const { activeHeadingHref, progressPercent, tocProgressScale } =
  useArticleReadingProgress(
    articleRef,
    props.detail.progressPercent,
    initialActiveHeadingHref,
  );
</script>

<style scoped>
.article-detail {
  display: grid;
  grid-template-columns: minmax(12rem, 14rem) minmax(0, 52rem) minmax(
      10rem,
      12rem
    );
  gap: var(--space-10);
  max-width: 92rem;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-12);
}

.article-detail__toc,
.article-detail__rail {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-bg-elevated) 58%, transparent);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(20px);
  align-self: start;
  padding: var(--space-5) var(--space-6);
}

.article-detail__toc {
  position: sticky;
  top: 5.5rem;
}

.article-detail__rail {
  position: sticky;
  top: 5.5rem;
}

.article-detail__toc h2 {
  margin: 0 0 var(--space-4);
  color: var(--color-text-strong);
  font-size: 1rem;
  letter-spacing: 0;
}

.article-detail__toc-list {
  --article-toc-marker-size: 0.5rem;
  --article-toc-track-width: 0.125rem;
  --article-toc-track-left: calc(
    var(--article-toc-marker-size) / 2 - var(--article-toc-track-width) / 2
  );

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding-left: var(--space-4);
}

.article-detail__toc-list::before {
  content: "";
  position: absolute;
  left: var(--article-toc-track-left);
  top: 0.5rem;
  bottom: 0.5rem;
  width: var(--article-toc-track-width);
  background: var(--color-border);
  border-radius: var(--radius-pill);
}

.article-detail__progress {
  position: absolute;
  left: var(--article-toc-track-left);
  top: 0.5rem;
  bottom: 0.5rem;
  width: var(--article-toc-track-width);
  background: var(--color-accent);
  border-radius: var(--radius-pill);
  transform: scaleY(var(--article-progress-scale, 0));
  transform-origin: top;
  z-index: 1;
}

.article-detail__toc a {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--color-text-soft);
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  line-height: 1.4;
}

.article-detail__toc a::before {
  content: "";
  position: absolute;
  left: calc(var(--space-4) * -1);
  width: var(--article-toc-marker-size);
  height: var(--article-toc-marker-size);
  border-radius: 50%;
  background: var(--color-text-soft);
  z-index: 2;
}

.article-detail__toc a.is-active {
  color: var(--color-accent);
  font-weight: 700;
}

.article-detail__toc a.is-active::before {
  background: var(--color-accent);
  box-shadow: 0 0 0 0.125rem var(--color-bg-elevated);
}

.article-detail__content {
  min-width: 0;
}

.article-detail__reading-card {
  position: relative;
  min-height: min(44rem, calc(100vh - 8rem));
  overflow: hidden;
  padding: var(--space-6) var(--space-8) var(--space-8);
  border: 1px solid color-mix(in srgb, var(--color-border) 78%, transparent);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-bg-elevated) 66%, transparent),
      color-mix(in srgb, var(--color-bg-reading) 80%, transparent)
    ),
    var(--color-bg-reading);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(24px);
}

.article-detail__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

.article-detail__content h1 {
  max-width: 48.75rem;
  margin: 0;
  color: var(--color-text-strong);
  font-size: 2rem;
  line-height: 1.18;
  letter-spacing: 0;
}

.article-detail__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-4) 0 var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.article-detail__meta p {
  margin: 0 0 var(--space-2);
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  font-weight: 500;
}

.article-detail__avatar {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-size: 0.75rem;
  font-weight: 700;
}

.article-detail__status-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.article-detail__status {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-bg-hover) 72%, transparent);
  color: var(--color-text-soft);
  font-size: 0.75rem;
  font-weight: 500;
}

.article-detail__status--ok {
  color: var(--color-accent);
}

.article-detail__status--warn {
  color: var(--color-warning);
}

.article-detail__body {
  --reading-text: color-mix(
    in srgb,
    var(--color-text) 84%,
    var(--color-text-soft)
  );
  --font-size-reading-body: 0.9375rem;
  --font-size-reading-heading: 1.25rem;

  max-width: 43rem;
  color: var(--color-text);
}

.article-detail__body-heading {
  color: var(--color-text-strong);
  scroll-margin-top: 6rem;
}

.article-detail__body-quote {
  --reading-block-border: color-mix(
    in srgb,
    var(--color-accent) 32%,
    var(--color-border)
  );
}

.article-detail__actions {
  display: grid;
  gap: var(--space-8);
}

.article-detail__action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  text-align: left;
}

.article-detail__action-icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--color-accent);
}

.article-detail__action-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.article-detail__action-text {
  display: flex;
  flex-direction: column;
}

.article-detail__action-text strong {
  color: var(--color-text-strong);
  font-size: 0.875rem;
  font-weight: 600;
}

.article-detail__action-text span {
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

.article-detail__action-btn.is-active .article-detail__action-icon {
  color: var(--color-accent);
}

.article-detail__action-btn.is-unknown .article-detail__action-icon {
  color: var(--color-warning);
}

.article-detail__note {
  margin: var(--space-4) 0 0;
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
  font-weight: 500;
  line-height: 1.5;
}

.article-detail__related-section {
  margin-top: var(--space-6);
}

.article-detail__related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.article-detail__related-title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.25rem;
}

.article-detail__related-more {
  display: flex;
  align-items: center;
  color: var(--color-accent);
  font-size: 0.875rem;
  text-decoration: none;
}

.article-detail__related-more svg {
  width: 1rem;
  height: 1rem;
}

.article-detail__related-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
  gap: var(--space-3);
}

.article-detail__related-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-bg-elevated) 64%, transparent);
  backdrop-filter: blur(16px);
  text-decoration: none;
  transition: border-color 0.2s;
}

.article-detail__related-card:hover {
  border-color: var(--color-accent);
}

.article-detail__related-card-cover {
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary) 18%, transparent),
      transparent 62%
    ),
    var(--color-bg-hover);
}

.article-detail__related-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  overflow: hidden;
}

.article-detail__related-card-content strong {
  color: var(--color-text-strong);
  font-size: 0.875rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-detail__related-card-content span {
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

@media (max-width: 64rem) {
  .article-detail {
    grid-template-columns: 1fr;
    padding: var(--space-6) var(--space-4) var(--space-10);
  }

  .article-detail__toc,
  .article-detail__rail {
    position: static;
  }
}
</style>
