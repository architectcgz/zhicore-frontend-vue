<!--
  面包屑方案3预览：面包屑嵌入左侧阅读轨顶部，作为轨道首个卡片
-->

<script setup lang="ts">
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import PostDetailActionRail from '@/components/post/detail/PostDetailActionRail.vue';
import PostDetailArticleSection from '@/components/post/detail/PostDetailArticleSection.vue';
import PostDetailBreadcrumbV3 from '@/components/post/detail/PostDetailBreadcrumbV3.vue';
import PostDetailCommentsSection from '@/components/post/detail/PostDetailCommentsSection.vue';
import PostDetailHeaderMeta from '@/components/post/detail/PostDetailHeaderMeta.vue';
import PostDetailReadingRail from '@/components/post/detail/PostDetailReadingRail.vue';
import PostDetailRelatedSection from '@/components/post/detail/PostDetailRelatedSection.vue';
import PostDetailTagLinks from '@/components/post/detail/PostDetailTagLinks.vue';
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
  readingPresence,
  handleAvatarError,
  articleHtml,
  handleImageError,
  postTags,
  setArticleBodyRef,
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
} = usePostDetailContent({ id: props.id });
</script>

<template>
  <div class="post-detail-page">
    <!-- 面包屑固定顶部，Teleport 到 body -->
    <PostDetailBreadcrumbV3 v-if="post && !error" />

    <section
      v-if="post && !error"
      class="post-content-header"
    >
      <div class="post-content-header__inner">
        <div class="post-content-header__eyebrow">
          <span
            v-if="sectionCount > 0"
            class="post-content-header__eyebrow-text"
          >
            {{ sectionCount }} 个章节
          </span>
        </div>

        <h1 class="post-title">
          {{ post.title }}
        </h1>

        <p
          v-if="articleSummary"
          class="post-summary"
        >
          {{ articleSummary }}
        </p>

        <PostDetailHeaderMeta
          :post="post"
          :default-avatar="defaultAvatar"
          :reading-time="readingTime"
          :comment-count="commentCount"
          :reading-presence="readingPresence"
          @avatar-error="handleAvatarError"
        />

        <PostDetailTagLinks :tags="headerTags" />
      </div>
    </section>

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

.post-content-header {
  position: relative;
  z-index: 1;
  isolation: isolate;
  width: 100%;
  padding: 0;
  background: transparent;
  color: var(--color-text);
}

.post-content-header__inner {
  width: min(1580px, calc(100% - 40px));
  margin: 0 auto;
  padding: calc(var(--space-lg) + 12px) var(--space-md) calc(var(--space-3xl) - 10px);
}

.post-content-header__eyebrow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.post-content-header__eyebrow-text {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  letter-spacing: 0.04em;
}

.post-title {
  max-width: 100%;
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-family: var(--font-heading);
  color: var(--color-text);
  line-height: 1.04;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.post-summary {
  max-width: 760px;
  margin-top: 18px;
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--color-text-secondary);
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
  .post-content-header__inner {
    padding: calc(var(--space-md) + 10px) var(--space-sm) calc(var(--space-2xl) - 8px);
  }

  .post-title {
    font-size: clamp(1.45rem, 5.2vw, 2.05rem);
  }

  .post-summary {
    font-size: 1rem;
  }

  .post-shell {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .post-shell__inner {
    width: 100%;
  }
}
</style>
