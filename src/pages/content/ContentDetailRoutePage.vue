<template>
  <ArticleDetailMobileView
    v-if="isMobileDetailPage"
    :detail="detail"
    :active-comment-sort="activeCommentSort"
    :comment-draft-body="commentDraftBody"
    @select-comment-sort="selectCommentSort"
    @update:comment-draft-body="updateCommentDraftBody"
  />
  <ArticleDetailView
    v-else
    :detail="detail"
    :active-comment-sort="activeCommentSort"
    :comment-draft-body="commentDraftBody"
    @select-comment-sort="selectCommentSort"
    @update:comment-draft-body="updateCommentDraftBody"
  />
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { ref } from "vue";

import ArticleDetailMobileView from "@/components/content/ArticleDetailMobileView.vue";
import ArticleDetailView from "@/components/content/ArticleDetailView.vue";
import { useContentDetailPage } from "@/features/content-detail";

const {
  detail,
  activeCommentSort,
  commentDraftBody,
  selectCommentSort,
  updateCommentDraftBody,
} = useContentDetailPage();

const mobileDetailMaxWidth = 640;
const isMobileDetailPage = ref(window.innerWidth <= mobileDetailMaxWidth);

function syncDetailViewportMode(): void {
  isMobileDetailPage.value = window.innerWidth <= mobileDetailMaxWidth;
}

useEventListener(window, "resize", syncDetailViewportMode);
</script>
