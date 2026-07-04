<template>
  <section class="article-detail">
    <aside class="article-detail__toc" aria-label="文章导航">
      <h2>本文导航</h2>
      <div
        class="article-detail__progress"
        :aria-label="`阅读进度 ${progressPercent}%`"
        :style="{ '--article-progress': `${progressPercent}%` }"
      >
        <span />
      </div>
      <a
        v-for="tocItem in detail.tocItems"
        :key="tocItem.label"
        :href="tocItem.href"
        :class="{ 'is-active': tocItem.href === activeHeadingHref }"
      >
        {{ tocItem.label }}
      </a>
    </aside>

    <article ref="articleRef" class="article-detail__paper">
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

      <div class="article-detail__cover" aria-hidden="true" />

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

      <ArticleComments
        :comments="detail.comments"
        :count-label="detail.commentsTotalLabel"
        :title="detail.commentsTitle"
        :sort-tabs="detail.commentSortTabs"
        :active-sort="activeCommentSort"
        :draft-body="commentDraftBody"
        @select-sort="$emit('selectCommentSort', $event)"
        @update:draft-body="$emit('update:commentDraftBody', $event)"
      />
    </article>

    <aside class="article-detail__rail">
      <h2>阅读操作</h2>
      <div class="article-detail__actions">
        <button
          type="button"
          :aria-label="`喜欢，${detail.readingActions.likeCountLabel} 次`"
        >
          <span><Heart aria-hidden="true" /></span>
          <strong>{{ detail.readingActions.likeCountLabel }}</strong>
        </button>
        <button
          :class="{ 'is-unknown': detail.readingActions.bookmarkUnavailable }"
          type="button"
          aria-label="收藏状态暂不可用"
        >
          <span><Bookmark aria-hidden="true" /></span>
          <strong>{{ detail.readingActions.bookmarkCountLabel }}</strong>
        </button>
        <a
          href="#comments"
          :aria-label="`查看评论，${detail.readingActions.commentCountLabel} 条`"
        >
          <span><MessageCircle aria-hidden="true" /></span>
          <strong>{{ detail.readingActions.commentCountLabel }}</strong>
        </a>
        <button type="button" aria-label="分享文章">
          <span><Share2 aria-hidden="true" /></span>
          <strong>{{ detail.readingActions.shareLabel }}</strong>
        </button>
      </div>

      <p class="article-detail__note">{{ detail.readingActions.note }}</p>

      <h2 id="related-reading" class="article-detail__related-title">
        相关阅读
      </h2>
      <div class="article-detail__related-list">
        <a v-for="item in detail.relatedPosts" :key="item.title" href="#">
          <strong>{{ item.title }}</strong>
          <span>{{ item.meta }}</span>
        </a>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { Bookmark, Heart, MessageCircle, Share2 } from "@lucide/vue";
import { useTemplateRef } from "vue";

import type { ArticleDetailData } from "@/features/content-detail";

import "@/components/common/ReadingTypography.css";

import ArticleComments from "./ArticleComments.vue";
import { useArticleReadingProgress } from "./useArticleReadingProgress";

const props = defineProps<{
  detail: ArticleDetailData;
  activeCommentSort: string;
  commentDraftBody: string;
}>();

defineEmits<{
  selectCommentSort: [sort: string];
  "update:commentDraftBody": [body: string];
}>();

const articleRef = useTemplateRef<HTMLElement>("articleRef");
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
</script>

<style scoped>
.article-detail {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 300px;
  gap: var(--space-5);
}

.article-detail__toc,
.article-detail__paper,
.article-detail__rail {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-panel);
}

.article-detail__toc,
.article-detail__rail {
  align-self: start;
  padding: var(--space-4);
}

.article-detail__toc {
  position: sticky;
  top: 88px;
}

.article-detail__toc h2,
.article-detail__rail h2 {
  margin: 0 0 var(--space-3);
  color: var(--color-text-strong);
  font-size: 20px;
  letter-spacing: 0;
}

.article-detail__progress {
  height: 4px;
  margin-bottom: var(--space-3);
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-bg-hover);
}

.article-detail__progress span {
  display: block;
  width: var(--article-progress);
  height: 100%;
  border-radius: inherit;
  background: var(--color-accent);
}

.article-detail__toc a,
.article-detail__related-list a {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-text-soft);
  font-weight: 750;
  text-decoration: none;
}

.article-detail__toc a.is-active {
  background: color-mix(
    in srgb,
    var(--color-accent) 12%,
    var(--color-bg-hover)
  );
  color: var(--color-text-strong);
}

.article-detail__paper {
  padding: clamp(var(--space-6), 5vw, var(--space-12));
}

.article-detail__eyebrow {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 750;
}

.article-detail__paper h1 {
  max-width: 780px;
  margin: var(--space-2) 0 0;
  color: var(--color-text-strong);
  font-size: 36px;
  line-height: 1.24;
  letter-spacing: 0;
}

.article-detail__meta {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
  margin: var(--space-4) 0 var(--space-6);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.article-detail__meta p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 750;
}

.article-detail__avatar {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-weight: 850;
}

.article-detail__status-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.article-detail__status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 9px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-bg-hover);
  font-size: 13px;
  font-weight: 750;
}

.article-detail__status--ok {
  color: var(--color-accent);
}

.article-detail__status--warn {
  color: var(--color-warning);
}

.article-detail__cover {
  min-height: 260px;
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

.article-detail__body {
  min-height: 460px;
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
}

.article-detail__body-heading {
  color: var(--color-text-strong);
}

.article-detail__body-quote {
  --reading-block-border: color-mix(
    in srgb,
    var(--color-accent) 32%,
    var(--color-border)
  );
}

.article-detail__body-heading,
.article-detail__related-title {
  scroll-margin-top: 96px;
}

.article-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.article-detail__actions button,
.article-detail__actions a {
  display: grid;
  gap: var(--space-2);
  place-items: center;
  min-width: 58px;
  border: 0;
  background: transparent;
  color: var(--color-text);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.article-detail__actions span {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-hover);
}

.article-detail__actions svg {
  width: 20px;
  height: 20px;
}

.article-detail__actions strong {
  color: var(--color-text-soft);
  font-size: 13px;
}

.article-detail__actions .is-unknown {
  color: var(--color-warning);
}

.article-detail__actions .is-unknown span {
  border-style: dashed;
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
  font-size: 13px;
  font-weight: 750;
  line-height: 1.65;
}

.article-detail__related-title {
  margin-top: var(--space-6);
}

.article-detail__related-list {
  display: grid;
  gap: var(--space-2);
}

.article-detail__related-list strong,
.article-detail__related-list span {
  display: block;
}

.article-detail__related-list span {
  margin-top: var(--space-1);
  color: var(--color-text-soft);
  font-size: 13px;
}

@media (max-width: 1180px) {
  .article-detail {
    grid-template-columns: 1fr;
  }

  .article-detail__toc {
    position: static;
  }
}

@media (max-width: 640px) {
  .article-detail__paper h1 {
    font-size: 30px;
  }
}
</style>
