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
  <ArticleDetailMobileView
    v-else-if="isMobileDetailPage"
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
import { useEventListener } from "@vueuse/core";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ArticleDetailMobileView from "@/components/content/ArticleDetailMobileView.vue";
import ArticleDetailView from "@/components/content/ArticleDetailView.vue";
import { useContentDetailPage } from "@/features/content-detail";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const postId = computed(() => String(route.params.postId ?? ""));
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
} = useContentDetailPage(postId, {
  isLoggedIn: () => authStore.isLoggedIn,
  redirectToLogin: async () => {
    await router.push({
      path: "/auth/login",
      query: {
        redirect: route.fullPath,
      },
    });
  },
});

const mobileDetailMaxWidth = 640;
const isMobileDetailPage = ref(window.innerWidth <= mobileDetailMaxWidth);

function syncDetailViewportMode(): void {
  isMobileDetailPage.value = window.innerWidth <= mobileDetailMaxWidth;
}

useEventListener(window, "resize", syncDetailViewportMode);
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
