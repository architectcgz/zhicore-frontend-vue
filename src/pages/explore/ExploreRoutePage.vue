<template>
  <HomeDiscoveryExploreWorkspace
    :discovery="discovery"
    :feed-state="feedState"
    :feed-error="feedError"
    :engagement-action-error="engagementActionError"
    :active-content-category="activeContentCategory"
    @select-content-category="selectContentCategory"
    @retry="retry"
    @like-post="likePost"
    @favorite-post="favoritePost"
  />
</template>

<script setup lang="ts">
import {
  HomeDiscoveryExploreWorkspace,
  useHomeDiscoveryRoutePage,
} from "@/features/home-discovery";

const {
  discovery,
  feedState,
  feedError,
  engagementActionError,
  activeContentCategory,
  selectContentCategory,
  retry,
  likePost,
  favoritePost,
} = useHomeDiscoveryRoutePage();
</script>
