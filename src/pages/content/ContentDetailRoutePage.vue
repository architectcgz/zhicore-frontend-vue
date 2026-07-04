<template>
  <ArticleDetailView
    :detail="detail"
    :active-comment-sort="activeCommentSort"
    :comment-draft-body="commentDraftBody"
    @select-comment-sort="selectCommentSort"
    @update:comment-draft-body="updateCommentDraftBody"
  />
</template>

<script setup lang="ts">
import ArticleDetailView from "@/components/content/ArticleDetailView.vue";
import { useContentDetailPage } from "@/features/content-detail";

const {
  detail,
  activeCommentSort,
  commentDraftBody,
  selectCommentSort,
  updateCommentDraftBody,
} = useContentDetailPage();
</script>
