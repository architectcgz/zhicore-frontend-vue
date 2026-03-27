<script setup lang="ts">
import HomeCtaSection from '@/components/home/HomeCtaSection.vue';
import HomeDiscoverySection from '@/components/home/HomeDiscoverySection.vue';
import HomeFeedSection from '@/components/home/HomeFeedSection.vue';
import HomeHeroSection from '@/components/home/HomeHeroSection.vue';
import HomeQuickLinksSection from '@/components/home/HomeQuickLinksSection.vue';
import HomeSidebar from '@/components/home/HomeSidebar.vue';
import { useHomePageContent } from '@/composables/useHomePageContent';

const {
  isMounted,
  quickLinks,
  heroTags,
  summaryStats,
  featuredPost,
  featuredCandidates,
  featuredIndex,
  curationNotes,
  insightLine,
  switchFeatured,
  handleFeaturedWheel,
  showDiscoverySkeleton,
  topicHighlights,
  creatorHighlights,
  isLoading,
  postsErrorMessage,
  handleHomeRetry,
  displayPosts,
  secondaryPosts,
  handleLikeChange,
  handleFavoriteChange,
  trendingPosts,
  isSidebarLoading,
  trendingError,
} = useHomePageContent();
</script>

<template>
  <div class="home-page">
    <HomeHeroSection
      :insight-line="insightLine"
      :hero-tags="heroTags"
      :summary-stats="summaryStats"
      :featured-post="featuredPost"
      :featured-candidates="featuredCandidates"
      :featured-index="featuredIndex"
      :curation-notes="curationNotes"
      @switch-featured="switchFeatured"
      @featured-wheel="handleFeaturedWheel"
    />

    <HomeQuickLinksSection :quick-links="quickLinks" />

    <div class="content-container">
      <HomeDiscoverySection
        :is-loading="showDiscoverySkeleton"
        :topic-highlights="topicHighlights"
        :creator-highlights="creatorHighlights"
      />

      <HomeFeedSection
        :is-loading="isLoading"
        :error-message="displayPosts.length === 0 ? null : postsErrorMessage"
        :display-posts="displayPosts"
        :featured-post="featuredPost"
        :secondary-posts="secondaryPosts"
        @retry="handleHomeRetry"
        @like-change="handleLikeChange"
        @favorite-change="handleFavoriteChange"
      />

      <HomeCtaSection />
    </div>

    <Teleport
      to="#home-sidebar-slot"
      :disabled="!isMounted"
    >
      <HomeSidebar
        :trending-posts="trendingPosts"
        :is-loading="isSidebarLoading"
        :posts-error="trendingError"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

@media (max-width: 767px) {
  .home-page {
    gap: var(--space-lg);
  }
}
</style>
