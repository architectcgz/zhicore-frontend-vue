<!--
  标签列表页面
  功能：展示所有标签，支持网格/云视图切换和搜索
-->
<template>
  <div class="tag-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        探索标签
      </h1>
      <p class="page-description">
        发现感兴趣的话题，探索更多精彩内容
      </p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-filter-bar">
      <!-- 搜索框 -->
      <div class="search-box">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索标签..."
          class="search-input"
        >
        <button
          v-if="searchKeyword"
          class="clear-button"
          @click="clearSearch"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 视图切换按钮 -->
      <div class="view-toggle">
        <button
          :class="['view-button', { active: viewMode === 'grid' }]"
          title="网格视图"
          @click="viewMode = 'grid'"
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          :class="['view-button', { active: viewMode === 'cloud' }]"
          title="云视图"
          @click="viewMode = 'cloud'"
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
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </button>
      </div>
    </div>

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

    <!-- 空状态 -->
    <div
      v-else-if="!loading && !errorMessage && tags.length === 0"
      class="empty-container"
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
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
      <p class="empty-message">
        暂无标签
      </p>
      <p class="empty-description">
        {{ searchKeyword ? '没有找到匹配的标签' : '还没有任何标签' }}
      </p>
    </div>

    <!-- 标签内容 -->
    <div v-else>
      <!-- 网格视图 -->
      <div
        v-if="viewMode === 'grid'"
        class="tags-grid"
      >
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="tag-card"
          @click="navigateToTag(tag.slug)"
        >
          <div class="tag-card-header">
            <h3 class="tag-name">
              {{ tag.name }}
            </h3>
            <span
              v-if="tag.postCount !== undefined"
              class="tag-post-count"
            >{{ tag.postCount }} 篇文章</span>
          </div>
          <p
            v-if="tag.description"
            class="tag-description"
          >
            {{ tag.description }}
          </p>
          <div class="tag-card-footer">
            <span class="tag-slug">#{{ tag.slug }}</span>
          </div>
        </div>
      </div>

      <!-- 云视图 -->
      <div
        v-else
        class="tags-cloud"
      >
        <a
          v-for="tag in tags"
          :key="tag.id"
          :href="`/tags/${tag.slug}`"
          class="tag-cloud-item"
          :style="getTagCloudStyle(tag)"
          @click.prevent="navigateToTag(tag.slug)"
        >
          {{ tag.name }}
        </a>
      </div>

      <!-- 分页 -->
      <div
        v-if="showPagination"
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage } from '@/types/errors';
import { useDebounce } from '@/composables/useDebounce';
import { useTagsQuery } from '@/queries/tags/useTagsQuery';
import type { Tag } from '@/types';

const router = useRouter();
const searchKeyword = ref('');
const viewMode = ref<'grid' | 'cloud'>('grid');
const currentPage = ref(0);
const pageSize = 24;
const debouncedKeyword = useDebounce(searchKeyword, 500);

const queryParams = computed(() => ({
  page: currentPage.value,
  size: pageSize,
  keyword: debouncedKeyword.value.trim() || undefined,
}));

const {
  data,
  isLoading,
  error,
  refetch,
} = useTagsQuery(queryParams);

const tags = computed<Tag[]>(() => data.value?.items ?? []);
const loading = computed(() => isLoading.value);
const errorMessage = computed(() => error.value ? getErrorMessage(error.value) : null);
const isSearchMode = computed(() => !!queryParams.value.keyword);
const totalPages = computed(() => {
  if (!data.value || data.value.total === 0 || isSearchMode.value) {
    return 0;
  }

  return Math.ceil(data.value.total / pageSize);
});
const displayPage = computed(() => currentPage.value + 1);
const showPagination = computed(() => totalPages.value > 1 && !isSearchMode.value);

const handleRetry = () => {
  void refetch();
};

const clearSearch = () => {
  searchKeyword.value = '';
};

const goToPage = (page: number) => {
  if (page < 0 || page >= totalPages.value) {
    return;
  }

  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const navigateToTag = (slug: string) => {
  router.push(`/tags/${slug}`);
};

const getTagCloudStyle = (tag: Tag) => {
  const tagsWithCount = tags.value.filter(item => item.postCount !== undefined);

  if (tagsWithCount.length === 0 || tag.postCount === undefined) {
    return {
      fontSize: '16px',
    };
  }

  const counts = tagsWithCount.map(item => item.postCount ?? 0);
  const maxPostCount = Math.max(...counts);
  const minPostCount = Math.min(...counts);
  const range = maxPostCount - minPostCount || 1;
  const minSize = 14;
  const maxSize = 32;
  const fontSize = minSize + (((tag.postCount ?? minPostCount) - minPostCount) / range) * (maxSize - minSize);

  return {
    fontSize: `${fontSize}px`,
  };
};

watch(searchKeyword, () => {
  currentPage.value = 0;
});
</script>

<style scoped>
/* 页面容器 */
.tag-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.page-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
}

/* 搜索和筛选栏 */
.search-filter-bar {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  align-items: center;
}

/* 搜索框 */
.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md) var(--space-sm) 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: var(--color-background);
  color: var(--color-text);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.clear-button {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color 0.2s;
}

.clear-button:hover {
  color: var(--color-text);
}

.clear-button svg {
  width: 100%;
  height: 100%;
}

/* 视图切换 */
.view-toggle {
  display: flex;
  gap: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 4px;
  background: var(--color-background);
}

.view-button {
  padding: var(--space-sm);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-button svg {
  width: 20px;
  height: 20px;
}

.view-button:hover {
  background: var(--color-background-secondary);
  color: var(--color-text);
}

.view-button.active {
  background: var(--color-cta);
  color: white;
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
}

/* 网格视图 */
.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.tag-card {
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  cursor: pointer;
  transition: all 0.3s;
}

.tag-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-cta);
}

.tag-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.tag-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.tag-post-count {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.tag-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tag-card-footer {
  display: flex;
  justify-content: flex-end;
}

/* 云视图 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  justify-content: center;
  padding: var(--space-xl) 0;
  margin-bottom: var(--space-xl);
}

.tag-cloud-item {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 6px;
  font-weight: 500;
}

.tag-cloud-item:hover {
  color: var(--color-cta);
  background: rgba(37, 99, 235, 0.1);
  transform: scale(1.1);
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
  .tag-list-page {
    padding: var(--space-lg) var(--space-md);
  }

  .page-title {
    font-size: 2rem;
  }

  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .view-toggle {
    align-self: center;
  }

  .tags-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
