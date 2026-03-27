<!--
  文章详情页面
  目标：强化阅读主线，建立正文与辅助信息的分轨布局
-->

<script setup lang="ts">
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import PostDetailActionRail from '@/components/post/detail/PostDetailActionRail.vue';
import PostDetailArticleSection from '@/components/post/detail/PostDetailArticleSection.vue';
import PostDetailCommentsSection from '@/components/post/detail/PostDetailCommentsSection.vue';
import PostDetailHeader from '@/components/post/detail/PostDetailHeader.vue';
import PostDetailReadingRail from '@/components/post/detail/PostDetailReadingRail.vue';
import PostDetailRelatedSection from '@/components/post/detail/PostDetailRelatedSection.vue';
import { usePostDetailContent } from '@/composables/usePostDetailContent';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const {
  defaultAvatar,
  error,
  errorPresentation,
  post,
  isLoading,
  handleRetry,
  sectionCount,
  articleSummary,
  headerTags,
  readingTime,
  commentCount,
  handleAvatarError,
  articleHtml,
  handleImageError,
  postTags,
  setArticleBodyRef,
  readingBatteryStyle,
  readingProgressPercent,
  tocItems,
  activeHeading,
  scrollToHeading,
  likeLoading,
  favoriteLoading,
  handleLike,
  handleFavorite,
  scrollToComments,
  handleCopyLink,
  copyLabel,
  relatedSectionKicker,
  relatedSectionTitle,
  isRelatedLoading,
  relatedCards,
  setCommentsSectionRef,
  handleCommentCountChange,
} = usePostDetailContent({
  id: props.id,
});
</script>

<template>
  <div class="post-detail-page">
    <PostDetailHeader
      v-if="post && !error"
      :post="post"
      :section-count="sectionCount"
      :article-summary="articleSummary"
      :default-avatar="defaultAvatar"
      :reading-time="readingTime"
      :comment-count="commentCount"
      :header-tags="headerTags"
      @avatar-error="handleAvatarError"
    />

    <div
      v-if="error || post"
      class="post-shell"
    >
      <div class="post-shell__inner">
        <div
          v-if="error"
          class="error-state"
        >
          <SiteErrorState
            :title="errorPresentation.title"
            :message="errorPresentation.message"
            :detail="errorPresentation.detail"
            mode="page"
            retry-text="重试加载"
            @retry="handleRetry"
          >
            <template #actions>
              <router-link
                to="/posts"
                class="btn-secondary"
              >
                返回文章列表
              </router-link>
            </template>
          </SiteErrorState>
        </div>

        <div
          v-else-if="post"
          class="post-shell__frame"
        >
          <PostDetailReadingRail
            :reading-battery-style="readingBatteryStyle"
            :reading-progress-percent="readingProgressPercent"
            :reading-time="readingTime"
            :section-count="sectionCount"
            :toc-items="tocItems"
            :active-heading="activeHeading"
            @scroll-to-heading="scrollToHeading"
          />

          <PostDetailArticleSection
            :post="post"
            :article-html="articleHtml"
            :post-tags="postTags"
            :set-article-body-ref="setArticleBodyRef"
            @image-error="handleImageError"
          />

          <PostDetailActionRail
            :post="post"
            :comment-count="commentCount"
            :like-loading="likeLoading"
            :favorite-loading="favoriteLoading"
            :copy-label="copyLabel"
            @like="handleLike"
            @favorite="handleFavorite"
            @scroll-comments="scrollToComments"
            @copy-link="handleCopyLink"
          />
        </div>
      </div>
    </div>

    <PostDetailRelatedSection
      v-if="post && !isLoading && !error"
      :kicker="relatedSectionKicker"
      :title="relatedSectionTitle"
      :is-loading="isRelatedLoading"
      :cards="relatedCards"
    />

    <PostDetailCommentsSection
      v-if="post && !isLoading && !error"
      :post-id="post.id"
      :comment-count="commentCount"
      :set-comments-section-ref="setCommentsSectionRef"
      @comment-count-change="handleCommentCountChange"
    />
  </div>
</template>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: transparent;
}

.post-shell {
  margin-top: 0;
  padding: var(--space-xl) var(--space-lg) var(--space-3xl);
}

.post-shell__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
}

.post-shell__frame {
  min-width: 0;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 0 clamp(18px, 2.5vw, 28px);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border-light);
  background: transparent;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-size: 0.98rem;
  font-weight: var(--font-weight-medium);
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-border-dark);
  background: var(--color-bg-hover);
}

.btn-secondary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@media (max-width: 900px) {
  .post-shell {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .post-shell__inner {
    width: 100%;
  }
}
</style>
