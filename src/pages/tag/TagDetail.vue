<!--
  标签详情页面
  功能：展示标签信息和标签下的文章列表
-->
<template>
  <div class="tag-detail-page">
    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="loading-spinner" />
      <p class="loading-text">
        加载中...
      </p>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="errorMessage"
      class="error-container"
    >
      <svg
        class="error-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="error-message">
        {{ errorMessage }}
      </p>
      <button
        class="retry-button"
        @click="handleRetry"
      >
        重试
      </button>
    </div>

    <!-- 标签内容 -->
    <div
      v-else-if="tag"
      class="tag-content"
    >
      <!-- 标签头部 -->
      <div class="tag-header">
        <div class="tag-header-content">
          <h1 class="tag-title">
            {{ tag.name }}
          </h1>
          <p
            v-if="tag.description"
            class="tag-description"
          >
            {{ tag.description }}
          </p>
          
          <!-- 标签统计 -->
          <div class="tag-stats">
            <div
              v-if="tag.postCount !== undefined"
              class="stat-item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{{ tag.postCount }} 篇文章</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧：文章列表 -->
        <div class="posts-section">
          <div class="posts-header">
            <h2 class="section-title">
              相关文章
            </h2>
          </div>

          <!-- 文章列表 -->
          <div
            v-if="postsLoading"
            class="posts-loading"
          >
            <div class="loading-spinner" />
            <p>加载文章中...</p>
          </div>

          <div
            v-else-if="postsErrorMessage"
            class="posts-empty"
          >
            <svg
              class="empty-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{{ postsErrorMessage }}</p>
            <button
              class="retry-button"
              @click="handlePostsRetry"
            >
              重试
            </button>
          </div>

          <div
            v-else-if="posts.length === 0"
            class="posts-empty"
          >
            <svg
              class="empty-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>该标签下暂无文章</p>
          </div>

          <div
            v-else
            class="posts-list"
          >
            <article
              v-for="post in posts"
              :key="post.id"
              class="post-card"
              @click="navigateToPost(post.id)"
            >
              <!-- 封面图 -->
              <div
                v-if="post.coverImage"
                class="post-cover"
              >
                <img
                  :src="post.coverImage"
                  :alt="post.title"
                >
              </div>

              <!-- 文章内容 -->
              <div class="post-content">
                <h3 class="post-title">
                  {{ post.title }}
                </h3>
                <p class="post-excerpt">
                  {{ post.excerpt }}
                </p>

                <!-- 文章元信息 -->
                <div class="post-meta">
                  <div class="author-info">
                    <img
                      :src="post.author.avatar"
                      :alt="post.author.nickname"
                      class="author-avatar"
                    >
                    <span class="author-name">{{ post.author.nickname }}</span>
                  </div>

                  <div class="post-stats">
                    <span class="stat-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {{ post.viewCount }}
                    </span>
                    <span class="stat-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {{ post.likeCount }}
                    </span>
                    <span class="stat-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {{ post.commentCount }}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- 分页 -->
          <div
            v-if="totalPages > 1"
            class="pagination"
          >
            <button
              class="pagination-button"
              :disabled="currentPage === 0"
              @click="goToPage(currentPage - 1)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              上一页
            </button>

            <div class="pagination-info">
              第 {{ displayPage }} / {{ totalPages }} 页
            </div>

            <button
              class="pagination-button"
              :disabled="currentPage >= totalPages - 1"
              @click="goToPage(currentPage + 1)"
            >
              下一页
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getErrorMessage } from '@/types/errors';
import { usePostsByTagQuery } from '@/queries/tags/usePostsByTagQuery';
import { useTagQuery } from '@/queries/tags/useTagQuery';

const route = useRoute();
const router = useRouter();
const pageSize = 10;
const currentPage = ref(0);
const slug = computed(() => typeof route.params.slug === 'string' ? route.params.slug : '');

const {
  data: tag,
  isLoading: tagLoading,
  error: tagError,
  refetch: refetchTag,
} = useTagQuery(slug);

const {
  data: postsData,
  isLoading: postsLoading,
  error: postsError,
  refetch: refetchPosts,
} = usePostsByTagQuery(
  slug,
  computed(() => ({
    page: currentPage.value,
    size: pageSize,
  }))
);

const loading = computed(() => tagLoading.value && !tag.value);
const errorMessage = computed(() => tagError.value ? getErrorMessage(tagError.value) : null);
const postsErrorMessage = computed(() => postsError.value ? getErrorMessage(postsError.value) : null);
const posts = computed(() => postsData.value?.items ?? []);
const totalPages = computed(() => {
  if (!postsData.value || postsData.value.total === 0) {
    return 0;
  }

  return Math.ceil(postsData.value.total / pageSize);
});
const displayPage = computed(() => currentPage.value + 1);

const handleRetry = () => {
  void refetchTag();
};

const handlePostsRetry = () => {
  void refetchPosts();
};

const goToPage = (page: number) => {
  if (page < 0 || page >= totalPages.value) {
    return;
  }

  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const navigateToPost = (postId: string) => {
  router.push(`/posts/${postId}`);
};

watch(slug, () => {
  currentPage.value = 0;
});
</script>

<style scoped>
/* 页面容器 */
.tag-detail-page {
  min-height: 100vh;
  background: var(--color-background);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
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
  min-height: 60vh;
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
}

.retry-button {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: 8px;
  background: var(--color-cta);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: var(--color-cta-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 标签头部 */
.tag-header {
  background: linear-gradient(135deg, var(--color-cta) 0%, var(--color-cta-hover) 100%);
  color: white;
  padding: var(--space-xl) var(--space-lg);
}

.tag-header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.tag-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.tag-description {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: var(--space-lg);
  opacity: 0.95;
}

.tag-stats {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
}

.stat-item svg {
  width: 20px;
  height: 20px;
}

/* 主要内容区域 */
.main-content {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
}

/* 文章区域 */
.posts-section {
  min-width: 0;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

/* 文章加载/空状态 */
.posts-loading,
.posts-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 300px;
}

.posts-loading p,
.posts-empty p {
  margin-top: var(--space-md);
  color: var(--color-text-secondary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
}

.posts-empty .retry-button {
  margin-top: var(--space-md);
}

/* 文章列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.post-card {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  cursor: pointer;
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-cta);
}

.post-cover {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card:hover .post-cover img {
  transform: scale(1.05);
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.post-stats {
  display: flex;
  gap: var(--space-md);
}

.post-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.post-stats .stat-item svg {
  width: 16px;
  height: 16px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button svg {
  width: 16px;
  height: 16px;
}

.pagination-button:hover:not(:disabled) {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tag-header {
    padding: var(--space-lg) var(--space-md);
  }

  .tag-title {
    font-size: 2rem;
  }

  .main-content {
    padding: var(--space-lg) var(--space-md);
  }

  .post-card {
    flex-direction: column;
  }

  .post-cover {
    width: 100%;
    height: 200px;
  }

  .posts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
