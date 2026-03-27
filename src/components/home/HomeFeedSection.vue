<script setup lang="ts">
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import PostCard from '@/components/post/PostCard.vue';
import type { Post } from '@/types';

interface LikeChangePayload {
  postId: string;
  isLiked: boolean;
  likeCount: number;
}

interface FavoriteChangePayload {
  postId: string;
  isFavorited: boolean;
  favoriteCount: number;
}

interface Props {
  isLoading: boolean;
  errorMessage: string | null;
  displayPosts: Post[];
  featuredPost: Post | null;
  secondaryPosts: Post[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  retry: [];
  'like-change': [data: LikeChangePayload];
  'favorite-change': [data: FavoriteChangePayload];
}>();
</script>

<template>
  <main class="posts-section">
    <div class="home-page__section-head">
      <div>
        <span class="home-page__section-kicker">最新更新</span>
        <h2 class="home-page__section-title">
          最新发布
        </h2>
      </div>
      <p class="home-page__section-description">
        按最新发布时间浏览内容，第一时间跟进社区里的新观点与新文章。
      </p>
    </div>

    <div
      v-if="props.isLoading"
      class="home-page__skeleton-grid"
    >
      <div class="home-page__skeleton-card home-page__skeleton-card--large" />
      <div
        v-for="index in 3"
        :key="index"
        class="home-page__skeleton-card"
      />
    </div>

    <div
      v-else-if="props.errorMessage"
      class="home-page__error-inline"
    >
      <SiteErrorState
        title="首页内容暂时不可用"
        :message="props.errorMessage"
        mode="section"
        retry-text="重新加载"
        @retry="emit('retry')"
      />
    </div>

    <div
      v-else-if="props.displayPosts.length === 0"
      class="home-page__empty"
    >
      <div class="home-page__empty-card">
        <h3>暂时还没有内容</h3>
        <p>还没有发布任何文章，欢迎来写下第一篇内容。</p>
        <router-link
          to="/posts/create"
          class="home-page__primary-action"
        >
          写第一篇文章
        </router-link>
      </div>
    </div>

    <div
      v-else
      class="posts-list"
    >
      <PostCard
        v-if="props.featuredPost"
        :post="props.featuredPost"
        size="large"
        variant="plain"
        class="home-page__feed-post-card home-page__feed-post-card--featured"
        :show-placeholder-title="false"
        @like-change="emit('like-change', $event)"
        @favorite-change="emit('favorite-change', $event)"
      />

      <div
        v-if="props.secondaryPosts.length > 0"
        class="home-page__post-grid"
      >
        <PostCard
          v-for="post in props.secondaryPosts"
          :key="post.id"
          :post="post"
          variant="plain"
          class="home-page__feed-post-card home-page__feed-post-card--compact"
          :show-placeholder-title="false"
          @like-change="emit('like-change', $event)"
          @favorite-change="emit('favorite-change', $event)"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.posts-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.home-page__section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: 0 6px;
}

.home-page__section-kicker {
  display: inline-flex;
  align-items: center;
  margin-bottom: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.74rem;
  color: var(--color-text-tertiary);
}

.home-page__section-title {
  color: var(--color-text);
  font-size: clamp(1.8rem, 3vw, 2.3rem);
}

.home-page__section-description {
  max-width: 40ch;
  color: var(--color-text-secondary);
  line-height: 1.75;
  text-align: right;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.home-page__feed-post-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}

.home-page__feed-post-card--featured {
  border-color: var(--color-border);
  background: var(--color-surface-overlay);
}

.home-page__feed-post-card--featured.post-card--large :deep(.post-card__media) {
  border-radius: var(--radius-md);
  overflow: hidden;
  border-bottom: none;
}

.home-page__feed-post-card--featured :deep(.post-card__body) {
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  gap: 12px;
}

.home-page__feed-post-card--featured :deep(.post-card__title) {
  font-size: clamp(1.55rem, 2.3vw, 1.95rem);
}

.home-page__feed-post-card--featured :deep(.post-card__excerpt) {
  -webkit-line-clamp: 2;
}

.home-page__feed-post-card--compact :deep(.post-card__media) {
  min-height: 188px;
}

.home-page__feed-post-card--compact :deep(.post-card__body) {
  padding: var(--space-md);
  gap: 10px;
}

.home-page__feed-post-card--compact :deep(.post-card__title) {
  font-size: 1.15rem;
}

.home-page__feed-post-card--compact :deep(.post-card__excerpt) {
  font-size: 0.92rem;
  -webkit-line-clamp: 2;
}

.home-page__feed-post-card--compact :deep(.post-card__tags) {
  display: none;
}

.home-page__feed-post-card--compact :deep(.post-card__actions) {
  padding-top: var(--space-xs);
}

.home-page__post-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
}

.home-page__skeleton-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
}

.home-page__skeleton-card {
  min-height: 320px;
  border-radius: var(--radius-2xl);
  background: linear-gradient(90deg, rgba(18, 49, 76, 0.05), rgba(18, 49, 76, 0.12), rgba(18, 49, 76, 0.05));
  background-size: 200% 100%;
  animation: home-skeleton 1.4s ease-in-out infinite;
}

.home-page__skeleton-card--large {
  min-height: 420px;
}

.home-page__error-inline {
  display: flex;
}

.home-page__empty {
  display: grid;
  place-items: center;
  min-height: 360px;
}

.home-page__empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: var(--space-xl);
  border-radius: 0;
  background: transparent;
  border: 1px solid var(--color-border);
  text-align: center;
}

.home-page__empty-card h3 {
  color: var(--color-text);
  font-size: 1.5rem;
}

.home-page__primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: var(--radius-full);
  background: #fff8ef;
  color: #12314c;
  font-weight: var(--font-weight-semibold);
}

[data-theme='dark'] .home-page__empty-card {
  background: transparent;
}

@keyframes home-skeleton {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 1023px) {
  .home-page__section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-page__section-description {
    text-align: left;
  }

  .home-page__post-grid,
  .home-page__skeleton-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-page__feed-post-card--featured :deep(.post-card__body) {
    padding: var(--space-md);
  }
}

@media (max-width: 767px) {
  .home-page__feed-post-card--compact :deep(.post-card__media) {
    min-height: 168px;
  }
}
</style>
