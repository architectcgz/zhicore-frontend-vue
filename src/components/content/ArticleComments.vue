<template>
  <section
    ref="commentsRootRef"
    id="comments"
    :class="['article-comments', `article-comments--${variant}`]"
    :aria-labelledby="variant === 'full' ? 'comments-title' : undefined"
    :aria-label="variant === 'dock' ? title : undefined"
  >
    <div v-if="variant === 'full'" class="article-comments__head">
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
      <button
        v-if="variant === 'full'"
        class="article-comments__follow"
        type="button"
      >
        关注讨论
      </button>
    </div>

    <div
      v-if="variant === 'full' && commentsState === 'error'"
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

    <div v-if="variant === 'full'" class="article-comments__composer">
      <span class="article-comments__avatar">我</span>
      <div>
        <EditorCompactBodyComposer
          :model-value="draftBody"
          :max-length="commentDraftMaxLength"
          aria-label="评论编辑器"
          input-label="写下评论"
          :toolbar-actions="dockCommentToolbarActions"
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

    <template v-else>
      <div
        v-if="commentsState === 'error'"
        class="article-comments__load-error article-comments__load-error--dock"
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

      <div v-if="!isDockComposerOpen" class="article-comments__dock-composer">
        <span class="article-comments__avatar">我</span>
        <button
          class="article-comments__dock-trigger"
          type="button"
          data-testid="dock-comment-expand"
          aria-label="展开评论编辑器"
          @click="expandDockComposer"
        >
          <span>{{ hasDockDraft ? "继续编辑评论" : "写下评论" }}</span>
          <span v-if="hasDockDraft" class="article-comments__dock-trigger-hint">
            草稿已保留
          </span>
        </button>
      </div>

      <div
        v-else
        class="article-comments__dock-composer article-comments__dock-composer--expanded"
      >
        <span class="article-comments__avatar">我</span>
        <div class="article-comments__dock-editor">
          <EditorCompactBodyComposer
            :model-value="draftBody"
            :max-length="commentDraftMaxLength"
            aria-label="评论编辑器"
            input-label="写下评论"
            :toolbar-actions="dockCommentToolbarActions"
            @update:model-value="emit('update:draftBody', $event)"
          />
        </div>
        <div class="article-comments__dock-actions">
          <span
            v-if="hasDockDraft"
            class="article-comments__draft-state"
            aria-live="polite"
          >
            草稿已保留
          </span>
          <button
            class="article-comments__primary article-comments__dock-submit"
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
        class="article-comments__submit-error article-comments__submit-error--dock"
        data-testid="comment-submit-error"
        role="alert"
      >
        {{ commentSubmitError }}
      </p>
    </template>

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
            <button
              type="button"
              :data-testid="`comment-reply-${comment.id}`"
              @click="toggleReplyEditor(comment.id)"
            >
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

          <section
            v-if="activeReplyTargetId === comment.id"
            class="article-comments__reply-editor"
            :data-testid="`reply-editor-${comment.id}`"
            aria-label="回复评论"
          >
            <EditorCompactBodyComposer
              :model-value="replyDrafts[comment.id] ?? ''"
              :max-length="commentDraftMaxLength"
              aria-label="回复编辑器"
              input-label="写下回复"
              :toolbar-actions="dockCommentToolbarActions"
              @update:model-value="updateReplyDraft(comment.id, $event)"
            />
            <div class="article-comments__reply-editor-actions">
              <button type="button" @click="closeReplyEditor(comment.id)">
                取消
              </button>
              <button class="article-comments__primary" type="button">
                发布回复
              </button>
            </div>
          </section>

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
                  <button
                    type="button"
                    :data-testid="`comment-reply-${reply.id}`"
                    @click="toggleReplyEditor(reply.id)"
                  >
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
                <section
                  v-if="activeReplyTargetId === reply.id"
                  class="article-comments__reply-editor article-comments__reply-editor--nested"
                  :data-testid="`reply-editor-${reply.id}`"
                  aria-label="回复评论"
                >
                  <EditorCompactBodyComposer
                    :model-value="replyDrafts[reply.id] ?? ''"
                    :max-length="commentDraftMaxLength"
                    aria-label="回复编辑器"
                    input-label="写下回复"
                    :toolbar-actions="dockCommentToolbarActions"
                    @update:model-value="updateReplyDraft(reply.id, $event)"
                  />
                  <div class="article-comments__reply-editor-actions">
                    <button type="button" @click="closeReplyEditor(reply.id)">
                      取消
                    </button>
                    <button class="article-comments__primary" type="button">
                      发布回复
                    </button>
                  </div>
                </section>
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import EditorCompactBodyComposer from "@/components/editor/EditorCompactBodyComposer.vue";
import type { ArticleComment } from "@/features/content-detail";
import type { EditorToolbarAction } from "@/features/editor";

const commentDraftMaxLength = 1000;
const dockCommentToolbarActions: readonly EditorToolbarAction[] = [
  "bold",
  "italic",
  "link",
  "mention",
  "quote",
  "unorderedList",
  "orderedList",
  "code",
];

const props = withDefaults(
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
    variant?: "full" | "dock";
  }>(),
  {
    variant: "full",
  },
);

const emit = defineEmits<{
  selectSort: [sort: string];
  "update:draftBody": [body: string];
  submitComment: [];
  retryComments: [];
}>();

const commentsRootRef = ref<HTMLElement | null>(null);
const isDockComposerExpanded = ref(false);
const isDockComposerCollapsed = ref(false);
const activeReplyTargetId = ref<string | null>(null);
const replyDrafts = ref<Record<string, string>>({});
const hasDockDraft = computed(() => props.draftBody.trim().length > 0);
const isDockComposerOpen = computed(
  () =>
    props.variant === "dock" &&
    !isDockComposerCollapsed.value &&
    (isDockComposerExpanded.value || hasDockDraft.value),
);

function expandDockComposer(): void {
  isDockComposerCollapsed.value = false;
  isDockComposerExpanded.value = true;
}

function collapseDockComposer(): void {
  if (props.variant !== "dock" || !isDockComposerOpen.value) {
    return;
  }

  isDockComposerCollapsed.value = true;
  isDockComposerExpanded.value = false;
}

function toggleReplyEditor(targetId: string): void {
  activeReplyTargetId.value =
    activeReplyTargetId.value === targetId ? null : targetId;
}

function closeReplyEditor(targetId: string): void {
  if (activeReplyTargetId.value === targetId) {
    activeReplyTargetId.value = null;
  }
}

function updateReplyDraft(targetId: string, value: string): void {
  replyDrafts.value = {
    ...replyDrafts.value,
    [targetId]: value,
  };
}

function isEventInsideComments(event: Event): boolean {
  const root = commentsRootRef.value;
  const target = event.target;

  return root !== null && target instanceof Node && root.contains(target);
}

function handleDocumentPointerDown(event: PointerEvent): void {
  if (!isEventInsideComments(event)) {
    collapseDockComposer();
  }
}

function handleDocumentFocusIn(event: FocusEvent): void {
  if (!isEventInsideComments(event)) {
    collapseDockComposer();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", handleDocumentPointerDown, true);
  document.addEventListener("focusin", handleDocumentFocusIn, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handleDocumentPointerDown, true);
  document.removeEventListener("focusin", handleDocumentFocusIn, true);
});
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

.article-comments--dock {
  margin-top: var(--space-8);
  padding: var(--space-5) 0 0;
  border-top: 1px solid var(--color-border);
  background: transparent;
  backdrop-filter: none;
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
.article-comments__submit .article-comments__primary,
.article-comments__dock-submit {
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

.article-comments__dock-composer {
  display: grid;
  grid-template-columns: 1.75rem minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
}

.article-comments__dock-composer--expanded {
  row-gap: var(--space-2);
  align-items: start;
}

.article-comments__dock-editor {
  --compact-editor-bg: transparent;
  --compact-editor-border: 0;
  --compact-editor-content-padding: var(--space-3) 0;
  --compact-editor-radius: 0;
  --compact-editor-toolbar-bg: transparent;
  --compact-editor-toolbar-border: 1px solid var(--color-border);

  min-width: 0;
}

.article-comments--dock .article-comments__avatar {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.75rem;
}

.article-comments__dock-submit {
  min-height: 2.25rem;
  padding: 0 var(--space-5);
  border: 0;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 750;
}

.article-comments__dock-actions {
  display: flex;
  grid-column: 2;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.article-comments__draft-state {
  color: var(--color-text-soft);
  font-size: var(--article-comment-meta-size);
  font-weight: 650;
}

.article-comments__dock-trigger {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
  min-height: 2.5rem;
  padding: 0 0 var(--space-1);
  border: 0;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  background: transparent;
  color: var(--color-text-soft);
  cursor: text;
  font-size: var(--article-comment-body-size);
  font-weight: 650;
  outline: 0;
  text-align: left;
}

.article-comments__dock-trigger:hover,
.article-comments__dock-trigger:focus-visible {
  border-bottom-color: color-mix(
    in srgb,
    var(--color-accent) 72%,
    var(--color-border)
  );
  color: var(--color-text-strong);
}

.article-comments__dock-trigger:focus-visible {
  box-shadow: 0 var(--space-1) 0
    color-mix(in srgb, var(--color-accent) 22%, transparent);
}

.article-comments__dock-trigger-hint {
  color: var(--color-text-soft);
  font-size: var(--article-comment-meta-size);
  font-weight: 650;
}

.article-comments__dock-submit:disabled {
  cursor: wait;
  opacity: 0.72;
}

.article-comments__load-error--dock {
  margin: 0 0 var(--space-2);
}

.article-comments__submit-error--dock {
  margin-left: calc(1.75rem + var(--space-3));
}

.article-comments__composer-actions {
  justify-content: flex-end;
  margin-top: var(--space-3);
}

.article-comments__reply-editor {
  --compact-editor-bg: color-mix(
    in srgb,
    var(--color-bg-elevated) 72%,
    var(--color-bg)
  );
  --compact-editor-panel-bg: var(--color-bg-elevated);
  --compact-editor-radius: var(--radius-lg);

  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.article-comments__reply-editor--nested {
  margin-top: var(--space-2);
}

.article-comments__reply-editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
}

.article-comments__reply-editor-actions button {
  min-height: 2.125rem;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-bg-hover);
  color: var(--color-text-soft);
  cursor: pointer;
  font-size: var(--article-comment-meta-size);
  font-weight: 750;
}

.article-comments__reply-editor-actions button:hover,
.article-comments__reply-editor-actions button:focus-visible {
  border-color: color-mix(
    in srgb,
    var(--color-accent) 42%,
    var(--color-border)
  );
  background: color-mix(
    in srgb,
    var(--color-accent) 10%,
    var(--color-bg-hover)
  );
  color: var(--color-text-strong);
  outline: 0;
}

.article-comments__reply-editor-actions .article-comments__primary {
  border-color: transparent;
  background: var(--color-accent);
  color: #fff;
}

.article-comments__reply-editor-actions .article-comments__primary:hover,
.article-comments__reply-editor-actions
  .article-comments__primary:focus-visible {
  background: color-mix(in srgb, var(--color-accent) 84%, #fff);
  color: #fff;
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
  .article-comments--dock {
    position: static;
    padding: 0;
    background: transparent;
    backdrop-filter: none;
  }

  .article-comments__dock-composer {
    grid-template-columns: 1.75rem minmax(0, 1fr);
  }

  .article-comments__dock-composer--expanded {
    grid-template-columns: 1fr;
  }

  .article-comments__dock-composer--expanded .article-comments__avatar {
    display: none;
  }

  .article-comments__dock-actions {
    grid-column: 1;
  }

  .article-comments__submit-error--dock {
    margin-left: 0;
  }

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
