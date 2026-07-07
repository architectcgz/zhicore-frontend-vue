<template>
  <section
    v-if="pageState === 'loading'"
    class="content-detail-route__state"
    aria-live="polite"
  >
    正在加载文章...
  </section>
  <section
    v-else-if="pageState === 'error' || !detail"
    class="content-detail-route__state"
    role="alert"
  >
    {{ pageError || "文章详情加载失败" }}
  </section>
  <ArticleDetailView
    v-else
    :detail="detail"
    :active-comment-sort="activeCommentSort"
    :comment-draft-body="commentDraftBody"
    :submitting-comment="submittingComment"
    :comment-submit-error="commentSubmitError"
    :comments-state="commentsState"
    :comments-error="commentsError"
    :submitting-like="submittingLike"
    :submitting-favorite="submittingFavorite"
    :reading-action-error="readingActionError"
    @select-comment-sort="selectCommentSort"
    @update:comment-draft-body="updateCommentDraftBody"
    @submit-comment="submitComment"
    @retry-comments="retryComments"
    @like-post="likePost"
    @favorite-post="favoritePost"
    @share-post="sharePost"
  />
</template>

<script setup lang="ts">
import ArticleDetailView from "@/components/content/ArticleDetailView.vue";
import { useContentDetailRoutePage } from "@/features/content-detail";

const {
  detail,
  pageState,
  pageError,
  activeCommentSort,
  commentDraftBody,
  submittingComment,
  commentSubmitError,
  commentsState,
  commentsError,
  submittingLike,
  submittingFavorite,
  readingActionError,
  selectCommentSort,
  updateCommentDraftBody,
  submitComment,
  retryComments,
  likePost,
  favoritePost,
  sharePost,
} = useContentDetailRoutePage();
</script>

<style scoped>
.content-detail-route__state {
  display: grid;
  min-height: 40vh;
  place-items: center;
  color: var(--color-text-soft);
  font-size: var(--font-size-16);
  font-weight: 750;
}
</style>
