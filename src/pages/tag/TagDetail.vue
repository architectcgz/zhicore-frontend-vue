<!--
  标签详情页面
  功能：展示标签信息、标签下的文章列表、相关标签
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
      v-else-if="error"
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
        {{ error }}
      </p>
      <button
        class="retry-button"
        @click="fetchTagDetail"
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
            <div class="stat-item">
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
            <div class="stat-item">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>{{ tag.followersCount || 0 }} 关注者</span>
            </div>
          </div>

          <!-- 关注按钮 -->
          <button
            class="follow-button"
            :class="{ following: tag.isFollowing }"
            @click="toggleFollow"
          >
            <svg
              v-if="!tag.isFollowing"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ tag.isFollowing ? '已关注' : '关注标签' }}
          </button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧：文章列表 -->
        <div class="posts-section">
          <!-- 排序选择器 -->
          <div class="posts-header">
            <h2 class="section-title">
              相关文章
            </h2>
            <select
              v-model="sortBy"
              class="sort-select"
              @change="handleSortChange"
            >
              <option value="latest">
                最新
              </option>
              <option value="popular">
                最热门
              </option>
              <option value="hot">
                热度
              </option>
            </select>
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
            v-if="postsPagination.totalPages > 1"
            class="pagination"
          >
            <button
              class="pagination-button"
              :disabled="postsPagination.page === 1"
              @click="goToPage(postsPagination.page - 1)"
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
              第 {{ postsPagination.page }} / {{ postsPagination.totalPages }} 页
            </div>

            <button
              class="pagination-button"
              :disabled="postsPagination.page === postsPagination.totalPages"
              @click="goToPage(postsPagination.page + 1)"
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

        <!-- 右侧：相关标签侧边栏 -->
        <aside class="sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">
              相关标签
            </h3>
            
            <div
              v-if="relatedTagsLoading"
              class="sidebar-loading"
            >
              <div class="loading-spinner small" />
            </div>

            <div
              v-else-if="relatedTags.length === 0"
              class="sidebar-empty"
            >
              <p>暂无相关标签</p>
            </div>

            <div
              v-else
              class="related-tags"
            >
              <a
                v-for="relatedTag in relatedTags"
                :key="relatedTag.id"
                :href="`/tags/${relatedTag.slug}`"
                class="related-tag"
                @click.prevent="navigateToTag(relatedTag.slug)"
              >
                <span class="tag-name">{{ relatedTag.name }}</span>
                <span class="tag-count">{{ relatedTag.postCount }} 篇</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { tagApi, postApi } from '@/api';
import type { Tag, Post, PaginatedResponse } from '@/types';
import { getErrorMessage } from '@/types/errors';

// 路由
const route = useRoute();
const router = useRouter();

// 状态
const tag = ref<Tag | null>(null);
const posts = ref<Post[]>([]);
const relatedTags = ref<Tag[]>([]);
const loading = ref(false);
const postsLoading = ref(false);
const relatedTagsLoading = ref(false);
const error = ref<string | null>(null);
const sortBy = ref<'latest' | 'popular' | 'hot'>('latest');

// 分页
const postsPagination = ref({
  page: 1,
  size: 10,
  total: 0,
  totalPages: 0,
});

/**
 * 获取标签详情
 */
const fetchTagDetail = async () => {
  const slug = route.params.slug as string;
  if (!slug) return;

  loading.value = true;
  error.value = null;

  try {
    tag.value = await tagApi.getTagBySlug(slug);
    
    // 并行获取文章和相关标签
    await Promise.all([
      fetchPosts(),
      fetchRelatedTags(),
    ]);
  } catch (err: unknown) {
    error.value = getErrorMessage(err);
    console.error('获取标签详情失败:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * 获取标签下的文章
 */
const fetchPosts = async () => {
  if (!tag.value) return;

  postsLoading.value = true;

  try {
    const response: PaginatedResponse<Post> = await tagApi.getPostsByTag(
      tag.value.id,
      {
        page: postsPagination.value.page,
        size: postsPagination.value.size,
        sort: sortBy.value,
      }
    );

    posts.value = response.items;
    postsPagination.value.total = response.total;
    postsPagination.value.totalPages = response.totalPages;
  } catch (err: unknown) {
    console.error('获取文章列表失败:', err);
  } finally {
    postsLoading.value = false;
  }
};

/**
 * 获取相关标签
 */
const fetchRelatedTags = async () => {
  if (!tag.value) return;

  relatedTagsLoading.value = true;

  try {
    relatedTags.value = await tagApi.getRelatedTags(tag.value.id, 10);
  } catch (err: unknown) {
    console.error('获取相关标签失败:', err);
  } finally {
    relatedTagsLoading.value = false;
  }
};

/**
 * 处理排序变化
 */
const handleSortChange = () => {
  postsPagination.value.page = 1;
  fetchPosts();
};

/**
 * 跳转到指定页
 */
const goToPage = (page: number) => {
  postsPagination.value.page = page;
  fetchPosts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * 切换关注状态
 */
const toggleFollow = async () => {
  if (!tag.value) return;

  try {
    if (tag.value.isFollowing) {
      const result = await tagApi.unfollowTag(tag.value.id);
      tag.value.isFollowing = result.isFollowing;
      tag.value.followersCount = result.followersCount;
    } else {
      const result = await tagApi.followTag(tag.value.id);
      tag.value.isFollowing = result.isFollowing;
      tag.value.followersCount = result.followersCount;
    }
  } catch (err: unknown) {
    console.error('切换关注状态失败:', err);
    error.value = getErrorMessage(err);
  }
};

/**
 * 导航到文章详情页
 */
const navigateToPost = (postId: string) => {
  router.push(`/posts/${postId}`);
};

/**
 * 导航到标签详情页
 */
const navigateToTag = (slug: string) => {
  router.push(`/tags/${slug}`);
};

// 监听路由变化
watch(() => route.params.slug, () => {
  if (route.name === 'TagDetail') {
    fetchTagDetail();
  }
});

// 生命周期
onMounted(() => {
  fetchTagDetail();
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

.follow-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  border: 2px solid white;
  border-radius: 8px;
  background: transparent;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-button svg {
  width: 20px;
  height: 20px;
}

.follow-button:hover {
  background: white;
  color: var(--color-cta);
}

.follow-button.following {
  background: white;
  color: var(--color-cta);
}

.follow-button.following:hover {
  background: rgba(255, 255, 255, 0.9);
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-xl);
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

.sort-select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}

.sort-select:hover {
  border-color: var(--color-cta);
}

.sort-select:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

/* 侧边栏 */
.sidebar {
  position: sticky;
  top: var(--space-lg);
  height: fit-content;
}

.sidebar-section {
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.sidebar-loading,
.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-md) 0;
}

.sidebar-empty p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.related-tags {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.related-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.related-tag:hover {
  background: var(--color-background-secondary);
}

.related-tag .tag-name {
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 500;
}

.related-tag .tag-count {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

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
