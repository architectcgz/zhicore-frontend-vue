<!--
  首页组件
  显示最新文章列表、热门标签和热门文章
  使用 TanStack Query 进行数据获取和状态管理
-->

<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        发现精彩内容
      </h1>
      <p class="page-description">
        探索最新文章和热门话题
      </p>
    </div>

    <!-- 主内容区域 -->
    <div class="content-container">
      <!-- 文章列表区域 -->
      <main class="posts-section">
        <!-- 骨架屏容器（加载中或加载失败时都显示） -->
        <div
          v-if="isLoading || error"
          class="skeleton-container"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="skeleton-post-card"
          >
            <div class="skeleton-image" />
            <div class="skeleton-content">
              <div class="skeleton-title" />
              <div class="skeleton-text" />
              <div class="skeleton-text short" />
              <div class="skeleton-meta">
                <div class="skeleton-avatar" />
                <div class="skeleton-info" />
              </div>
            </div>
          </div>

          <!-- 错误提示叠加层 -->
          <div
            v-if="error"
            class="error-overlay"
          >
            <div class="error-card">
              <svg 
                class="error-icon" 
                fill="none" 
                stroke="#ef4444"
                viewBox="0 0 24 24"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p class="error-message">
                {{ getErrorMessage(error) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="!posts || posts.length === 0"
          class="empty-container"
        >
          <svg 
            class="empty-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p class="empty-message">
            暂无文章
          </p>
          <p class="empty-description">
            还没有发布任何文章，快来发布第一篇吧！
          </p>
        </div>

        <!-- 文章列表 -->
        <div
          v-else
          class="posts-list"
        >
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
          />
        </div>
      </main>
    </div>

    <!-- 侧边栏（PC 端显示在右侧，移动端通过抽屉菜单访问） -->
    <!-- 使用 Teleport 将侧边栏传送到 DefaultLayout 的 aside 插槽位置 -->
    <Teleport
      to="#home-sidebar-slot"
      :disabled="!isMounted"
    >
      <HomeSidebar
        :tags="tags"
        :trending-posts="trendingPosts"
        :is-loading="isSidebarLoading"
        :tags-error="tagsError"
        :posts-error="trendingError"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { usePostsQuery } from '@/queries/posts/usePostsQuery';
import { useHotTagsQuery } from '@/queries/tags/useHotTagsQuery';
import { useHotPostsQuery } from '@/queries/posts/useHotPostsQuery';
import PostCard from '@/components/post/PostCard.vue';
import HomeSidebar from '@/components/home/HomeSidebar.vue';
import type { Post, Tag } from '@/types';

// 用于 Teleport 的挂载状态
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

/**
 * 获取最新文章列表
 */
const {
  data: postsData,
  isLoading: postsLoading,
  isFetching: postsFetching,
  error: postsError,
} = usePostsQuery({
  page: 1,
  size: 20,
  sort: 'latest',
});

/**
 * 获取热门标签
 */
const {
  data: tagsData,
  isLoading: tagsLoading,
  error: tagsError,
} = useHotTagsQuery();

/**
 * 获取热门文章（用于侧边栏）
 */
const {
  data: trendingData,
  isLoading: trendingLoading,
  error: trendingError,
} = useHotPostsQuery({
  page: 1,
  size: 5,
});

/**
 * 计算属性：文章列表
 */
const posts = computed<Post[]>(() => {
  return postsData.value?.items || [];
});

/**
 * 计算属性：热门标签列表
 */
const tags = computed<Tag[]>(() => {
  return tagsData.value || [];
});

/**
 * 计算属性：热门文章列表
 */
const trendingPosts = computed<Post[]>(() => {
  return trendingData.value?.items || [];
});

/**
 * 计算属性：主要加载状态
 */
const isLoading = computed(() => postsLoading.value || (postsFetching.value && !postsData.value));

/**
 * 计算属性：侧边栏加载状态
 */
const isSidebarLoading = computed(() => tagsLoading.value || trendingLoading.value);

/**
 * 计算属性：错误状态
 */
const error = computed(() => postsError.value);

/**
 * 获取错误消息
 */
const getErrorMessage = (err: any): string => {
  if (err?.message) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return '加载数据时发生错误，请稍后重试';
};
</script>

<style scoped>
/* 页面容器 */
.home-page {
  width: 100%;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
}

/* 内容容器 */
.content-container {
  width: 100%;
}

/* 文章区域 */
.posts-section {
  position: relative;
  min-height: 400px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 400px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: var(--space-md);
  color: var(--color-text-secondary);
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 400px;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--color-error);
  margin-bottom: var(--space-md);
}

.error-message {
  font-size: 1.125rem;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
  text-align: center;
}

.retry-button {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: 8px;
  background: var(--color-cta);
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: var(--color-cta-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 400px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-md);
}

.empty-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.empty-description {
  color: var(--color-text-secondary);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .posts-list {
    gap: var(--space-md);
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 焦点状态 */
.retry-button:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

/* 错误叠加层样式 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 10;
  animation: fadeIn 0.3s ease-in-out;
}

@media (prefers-color-scheme: dark) {
  .error-overlay {
    background: rgba(31, 41, 55, 0.95);
  }
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
  max-width: 400px;
}

.error-card .error-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #ef4444;
  margin-bottom: 0.75rem;
}

.error-card .error-message {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

@media (prefers-color-scheme: dark) {
  .error-card .error-message {
    color: #d1d5db;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 骨架屏样式 */
.skeleton-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-post-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.5rem;
}

.skeleton-image {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 70%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 1rem;
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-text.short {
  width: 60%;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
}

.skeleton-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-info {
  height: 1rem;
  width: 8rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 暗色模式骨架屏 */
@media (prefers-color-scheme: dark) {
  .skeleton-post-card {
    background: #1f2937;
  }

  .skeleton-image,
  .skeleton-title,
  .skeleton-text,
  .skeleton-avatar,
  .skeleton-info {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }
}

/* 移动端骨架屏调整 */
@media (max-width: 768px) {
  .skeleton-post-card {
    flex-direction: column;
  }

  .skeleton-image {
    width: 100%;
    height: 200px;
  }
}

</style>
}

.error-card .error-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #ef4444;
  margin-bottom: 0.75rem;
}

.error-card .error-message {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

@media (prefers-color-scheme: dark) {
  .error-card .error-message {
    color: #d1d5db;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
