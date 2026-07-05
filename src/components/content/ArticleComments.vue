<template>
  <section
    id="comments"
    class="article-comments"
    aria-labelledby="comments-title"
  >
    <div class="article-comments__head">
      <h2 id="comments-title">
        <span>{{ title }}</span>
        <span class="article-comments__count">{{ countLabel }}</span>
      </h2>
    </div>

    <div class="article-comments__toolbar">
      <div class="article-comments__tabs" aria-label="评论排序">
        <button
          v-for="sort in sortTabs"
          :key="sort"
          type="button"
          :aria-selected="sort === activeSort"
          @click="$emit('selectSort', sort)"
        >
          {{ sort }}
        </button>
      </div>
      <button class="article-comments__follow" type="button">关注讨论</button>
    </div>

    <div
      v-if="commentsState === 'error'"
      class="article-comments__load-error"
      data-testid="comments-load-error"
      role="alert"
    >
      <span>{{ commentsError || "评论加载失败" }}</span>
      <button
        type="button"
        data-testid="comments-retry"
        @click="$emit('retryComments')"
      >
        重试
      </button>
    </div>

    <div class="article-comments__composer">
      <span class="article-comments__avatar">我</span>
      <div>
        <EditorCompactBodyComposer
          :model-value="draftBody"
          :max-length="commentDraftMaxLength"
          aria-label="评论编辑器"
          input-label="写下评论"
          @update:model-value="emit('update:draftBody', $event)"
        />
        <div class="article-comments__composer-actions">
          <div class="article-comments__submit">
            <button type="button">保存草稿</button>
            <button
              class="article-comments__primary"
              type="button"
              data-testid="comment-submit"
              :disabled="submittingComment"
              @click="$emit('submitComment')"
            >
              {{ submittingComment ? "发布中" : "发布评论" }}
            </button>
          </div>
        </div>
        <p
          v-if="commentSubmitError"
          class="article-comments__submit-error"
          data-testid="comment-submit-error"
          role="alert"
        >
          {{ commentSubmitError }}
        </p>
      </div>
    </div>

    <div class="article-comments__thread">
      <article
        v-for="comment in comments"
        :key="comment.id"
        class="article-comments__item"
      >
        <span class="article-comments__avatar">{{ comment.initial }}</span>
        <div>
          <header class="article-comments__item-head">
            <div class="article-comments__author-line">
              <strong>{{ comment.author }}</strong>
              <span class="article-comments__role">{{ comment.role }}</span>
            </div>
          </header>
          <p>{{ comment.body }}</p>
          <div class="article-comments__actions">
            <button type="button">
              <Heart class="article-comments__action-icon" aria-hidden="true" />
              {{ comment.likes }}
            </button>
            <button type="button">
              <MessageCircle
                class="article-comments__action-icon"
                aria-hidden="true"
              />
              回复
            </button>
            <button type="button">
              <Quote class="article-comments__action-icon" aria-hidden="true" />
              引用
            </button>
            <span class="article-comments__time">{{ comment.time }}</span>
          </div>

          <details
            v-if="comment.replies.length"
            class="article-comments__replies"
          >
            <summary>展开 {{ comment.replies.length }} 条回复</summary>
            <article
              v-for="reply in comment.replies"
              :key="reply.id"
              class="article-comments__reply"
            >
              <span class="article-comments__avatar">{{ reply.initial }}</span>
              <div>
                <header class="article-comments__item-head">
                  <div class="article-comments__author-line">
                    <strong>{{ reply.author }}</strong>
                    <span class="article-comments__role">{{ reply.role }}</span>
                  </div>
                </header>
                <p>{{ reply.body }}</p>
                <div class="article-comments__actions">
                  <button type="button">
                    <MessageCircle
                      class="article-comments__action-icon"
                      aria-hidden="true"
                    />
                    回复
                  </button>
                  <button type="button">
                    <Link2
                      class="article-comments__action-icon"
                      aria-hidden="true"
                    />
                    复制链接
                  </button>
                  <span class="article-comments__time">{{ reply.time }}</span>
                </div>
              </div>
            </article>
          </details>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Heart, Link2, MessageCircle, Quote } from "@lucide/vue";

import EditorCompactBodyComposer from "@/components/editor/EditorCompactBodyComposer.vue";
import type { ArticleComment } from "@/features/content-detail";

const commentDraftMaxLength = 1000;

defineProps<{
  title: string;
  countLabel: string;
  sortTabs: readonly string[];
  activeSort: string;
  draftBody: string;
  comments: readonly ArticleComment[];
  submittingComment: boolean;
  commentSubmitError: string;
  commentsState: "idle" | "loading" | "ready" | "error";
  commentsError: string;
}>();

const emit = defineEmits<{
  selectSort: [sort: string];
  "update:draftBody": [body: string];
  submitComment: [];
  retryComments: [];
}>();
</script>

<style scoped>
.article-comments {
  --article-comment-author-size: 0.875rem;
  --article-comment-body-size: 0.9375rem;
  --article-comment-meta-size: 0.8125rem;
  --article-comment-body-line-height: 1.68;
  --compact-editor-body-size: var(--article-comment-body-size);
  --compact-editor-body-line-height: var(--article-comment-body-line-height);

  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.article-comments__head,
.article-comments__toolbar,
.article-comments__composer-actions,
.article-comments__actions,
.article-comments__tabs,
.article-comments__submit {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.article-comments__head,
.article-comments__toolbar,
.article-comments__composer-actions {
  justify-content: space-between;
}

.article-comments h2 {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
  margin: 0;
  color: var(--color-text-strong);
  font-size: 26px;
  letter-spacing: 0;
}

.article-comments__count {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 750;
}

.article-comments__toolbar {
  margin: var(--space-4) 0;
}

.article-comments__actions {
  column-gap: var(--space-4);
  row-gap: var(--space-2);
}

.article-comments__tabs button,
.article-comments__follow,
.article-comments__submit button {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-hover);
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}

.article-comments__actions button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  min-height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-soft);
  cursor: pointer;
  font-size: var(--article-comment-meta-size);
  font-weight: 750;
}

.article-comments__actions button:hover {
  color: var(--color-text-strong);
}

.article-comments__actions button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: var(--space-1);
}

.article-comments__submit button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.article-comments__submit-error {
  margin: var(--space-2) 0 0;
  color: var(--color-danger);
  font-size: var(--article-comment-meta-size);
  font-weight: 750;
}

.article-comments__load-error {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  justify-content: space-between;
  margin: 0 0 var(--space-4);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(
    in srgb,
    var(--color-danger) 8%,
    var(--color-bg-elevated)
  );
  color: var(--color-danger);
  font-size: var(--article-comment-meta-size);
  font-weight: 750;
}

.article-comments__load-error button {
  min-height: 32px;
  padding: 0 var(--space-3);
  border: 1px solid currentColor;
  border-radius: var(--radius-lg);
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-weight: 800;
}

.article-comments__tabs button[aria-selected="true"],
.article-comments__submit .article-comments__primary {
  background: var(--color-accent);
  color: #fff;
}

.article-comments__composer {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: var(--space-3);
  padding: var(--space-1) 0 var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.article-comments__composer-actions {
  justify-content: flex-end;
  margin-top: var(--space-3);
}

.article-comments__thread {
  margin-top: var(--space-4);
}

.article-comments__item,
.article-comments__reply {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: var(--space-3);
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--color-border);
}

.article-comments__reply {
  grid-template-columns: 32px minmax(0, 1fr);
  padding: var(--space-4) 0 0;
  border-bottom: 0;
}

.article-comments__avatar {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-weight: 850;
}

.article-comments__reply .article-comments__avatar {
  width: 32px;
  height: 32px;
  font-size: 0.8125rem;
}

.article-comments__item-head {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
  justify-content: space-between;
}

.article-comments__author-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
}

.article-comments__role,
.article-comments__time {
  color: var(--color-text-soft);
}

.article-comments__author-line strong {
  color: var(--color-text-strong);
  font-size: var(--article-comment-author-size);
  line-height: 1.4;
}

.article-comments__role {
  font-size: var(--article-comment-meta-size);
  font-weight: 650;
}

.article-comments p {
  margin: var(--space-2) 0 var(--space-3);
  color: var(--color-text);
  font-size: var(--article-comment-body-size);
  line-height: var(--article-comment-body-line-height);
}

.article-comments__action-icon {
  width: 15px;
  height: 15px;
}

.article-comments__time {
  margin-left: auto;
  font-size: var(--article-comment-meta-size);
  font-weight: 650;
}

.article-comments__replies {
  margin-top: var(--space-1);
}

.article-comments__replies summary {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  color: var(--color-accent);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  list-style: none;
}

.article-comments__replies summary::-webkit-details-marker {
  display: none;
}

@media (max-width: 640px) {
  .article-comments__composer {
    grid-template-columns: 1fr;
  }

  .article-comments__item {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .article-comments__reply {
    grid-template-columns: 32px minmax(0, 1fr);
  }

  .article-comments__item > .article-comments__avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
