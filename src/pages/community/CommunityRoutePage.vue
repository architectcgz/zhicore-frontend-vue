<template>
  <CommunityWorkspace
    :topics="topics"
    :posts="posts"
    :topic-state="topicState"
    :feed-state="feedState"
    :topic-error="topicError"
    :feed-error="feedError"
    :active-topic-slug="activeTopicSlug"
    @select-topic="selectTopic"
    @retry-topics="retryTopics"
    @retry-posts="retryPosts"
  />
</template>

<script setup lang="ts">
import { CommunityWorkspace, useCommunityPage } from "@/features/community";

const {
  topics,
  posts,
  topicState,
  feedState,
  topicError,
  feedError,
  activeTopicSlug,
  selectTopic,
  retryTopics,
  retryPosts,
} = useCommunityPage();
</script>
