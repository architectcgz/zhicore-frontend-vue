<template>
  <div class="search-results">
    <!-- 搜索头部 -->
    <div class="search-results__header">
      <div class="search-results__header-content">
        <h1 class="search-results__title">
          搜索结果
          <span
            v-if="searchQuery"
            class="search-results__query"
          >"{{ searchQuery }}"</span>
        </h1>
        <p
          v-if="totalResults > 0"
          class="search-results__count"
        >
          找到 <strong>{{ totalResults }}</strong> 个结果
          <span
            v-if="searchTime"
            class="search-results__time"
          >
            (耗时 {{ searchTime }}ms)
          </span>
        </p>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="search-results__container">
      <!-- 筛选器侧边栏 -->
      <aside class="search-results__filters">
        <div class="search-results__filters-header">
          <h2 class="search-results__filters-title">
            筛选条件
          </h2>
          <button
            v-if="hasActiveFilters"
            class="search-results__filters-clear"
            @click="handleClearFilters"
          >
            清空
          </button>
        </div>

        <!-- 排序选项 -->
        <div class="search-results__filter-section">
          <h3 class="search-results__filter-title">
            排序方式
          </h3>
          <div class="search-results__filter-options">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="search-results__filter-option"
              :class="{ 'search-results__filter-option--active': filters.sort === option.value }"
              @click="handleSortChange(option.value)"
            >
              <i :class="option.icon" />
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>

        <!-- 日期范围 -->
        <div class="search-results__filter-section">
          <h3 class="search-results__filter-title">
            发布时间
          </h3>
          <div class="search-results__filter-options">
            <button
              v-for="range in dateRanges"
              :key="range.value"
              class="search-results__filter-option"
              :class="{ 'search-results__filter-option--active': filters.dateRange === range.value }"
              @click="handleDateRangeChange(range.value)"
            >
              {{ range.label }}
            </button>
          </div>
        </div>

        <!-- 标签筛选 -->
        <div
          v-if="availableTags.length > 0"
          class="search-results__filter-section"
        >
          <h3 class="search-results__filter-title">
            标签
          </h3>
          <div class="search-results__filter-tags">
            <button
              v-for="tag in availableTags"
              :key="tag.id"
              class="search-results__filter-tag"
              :class="{ 'search-results__filter-tag--active': filters.tagIds.includes(tag.id) }"
              @click="handleTagToggle(tag.id)"
            >
              #{{ tag.name }}
              <span class="search-results__filter-tag-count">{{ tag.postCount }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- 结果列表 -->
      <main class="search-results__main">
        <!-- 标签页 -->
        <div class="search-results__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="search-results__tab"
            :class="{ 'search-results__tab--active': activeTab === tab.value }"
            @click="handleTabChange(tab.value)"
          >
            <i :class="tab.icon" />
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.count !== undefined"
              class="search-results__tab-count"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- 加载状态 -->
        <div
          v-if="loading"
          class="search-results__loading"
        >
          <div class="search-results__spinner" />
          <p>搜索中...</p>
        </div>

        <!-- 文章结果 -->
        <div
          v-else-if="activeTab === 'POST' && posts.length > 0"
          class="search-results__posts"
        >
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            class="search-results__post-card"
            @like-change="handleLikeChange"
            @favorite-change="handleFavoriteChange"
          />

          <!-- 加载更多 -->
          <div
            v-if="hasMorePosts"
            class="search-results__load-more"
          >
            <button
              class="search-results__load-more-button"
              :disabled="loadingMore"
              @click="handleLoadMore"
            >
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>

        <!-- 用户结果 -->
        <div
          v-else-if="activeTab === 'USER' && users.length > 0"
          class="search-results__users"
        >
          <UserCard
            v-for="user in users"
            :key="user.id"
            :user="user"
            class="search-results__user-card"
          />

          <!-- 加载更多 -->
          <div
            v-if="hasMoreUsers"
            class="search-results__load-more"
          >
            <button
              class="search-results__load-more-button"
              :disabled="loadingMore"
              @click="handleLoadMore"
            >
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-else-if="!loading"
          type="no-results"
          :title="`未找到与 &quot;${searchQuery}&quot; 相关的${activeTab === 'POST' ? '文章' : '用户'}`"
          description="尝试使用不同的关键词或调整筛选条件"
          show-action
          action-text="清空筛选"
          @action="handleClearFilters"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { searchApi, type AdvancedSearchParams } from '@/api/search';
import type { Post, User, Tag } from '@/types';
import PostCard from '@/components/post/PostCard.vue';
import UserCard from '@/components/user/UserCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';

/**
 * 路由和路由器
 */
const route = useRoute();

/**
 * 搜索关键词
 */
const searchQuery = ref('');

/**
 * 当前激活的标签页
 */
const activeTab = ref<'POST' | 'USER'>('POST');

/**
 * 标签页配置
 */
const tabs = computed(() => [
  {
    value: 'POST',
    label: '文章',
    icon: 'el-icon-document',
    count: totalPosts.value,
  },
  {
    value: 'USER',
    label: '用户',
    icon: 'el-icon-user',
    count: totalUsers.value,
  },
]);

/**
 * 筛选条件
 */
const filters = ref<{
  sort: 'relevance' | 'latest' | 'popular' | 'hot';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  tagIds: string[];
}>({
  sort: 'relevance',
  dateRange: 'all',
  tagIds: [],
});

/**
 * 排序选项
 */
const sortOptions = [
  { value: 'relevance', label: '相关度', icon: 'el-icon-star-off' },
  { value: 'latest', label: '最新', icon: 'el-icon-time' },
  { value: 'popular', label: '最热', icon: 'el-icon-hot-water' },
  { value: 'hot', label: '热门', icon: 'el-icon-trophy' },
];

/**
 * 日期范围选项
 */
const dateRanges = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'year', label: '今年' },
];

/**
 * 可用标签
 */
const availableTags = ref<Tag[]>([]);

/**
 * 文章结果
 */
const posts = ref<Post[]>([]);
const totalPosts = ref(0);
const currentPostPage = ref(1);
const hasMorePosts = ref(false);

/**
 * 用户结果
 */
const users = ref<User[]>([]);
const totalUsers = ref(0);
const currentUserPage = ref(1);
const hasMoreUsers = ref(false);

/**
 * 总结果数
 */
const totalResults = computed(() => {
  return activeTab.value === 'POST' ? totalPosts.value : totalUsers.value;
});

/**
 * 搜索耗时
 */
const searchTime = ref(0);

/**
 * 加载状态
 */
const loading = ref(false);
const loadingMore = ref(false);

/**
 * 点赞/收藏状态变化：更新本地列表（避免 PostCard 直接修改 props）
 */
const handleLikeChange = (data: { postId: string; isLiked: boolean; likeCount: number }) => {
  posts.value = posts.value.map((post) =>
    post.id === data.postId ? { ...post, isLiked: data.isLiked, likeCount: data.likeCount } : post
  );
};

const handleFavoriteChange = (data: { postId: string; isFavorited: boolean; favoriteCount: number }) => {
  posts.value = posts.value.map((post) =>
    post.id === data.postId
      ? { ...post, isFavorited: data.isFavorited, favoriteCount: data.favoriteCount }
      : post
  );
};

/**
 * 是否有激活的筛选条件
 */
const hasActiveFilters = computed(() => {
  return (
    filters.value.sort !== 'relevance' ||
    filters.value.dateRange !== 'all' ||
    filters.value.tagIds.length > 0
  );
});

/**
 * 获取日期范围
 */
const getDateRange = (range: string) => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return undefined;
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
};

/**
 * 构建搜索参数
 */
const buildSearchParams = (page: number = 1): AdvancedSearchParams => {
  return {
    query: searchQuery.value,
    type: activeTab.value,
    page,
    size: 20,
    sort: filters.value.sort,
    dateRange: getDateRange(filters.value.dateRange),
    tagIds: filters.value.tagIds.length > 0 ? filters.value.tagIds : undefined,
  };
};

/**
 * 执行搜索
 */
const performSearch = async (page: number = 1, append: boolean = false) => {
  if (!searchQuery.value.trim()) return;

  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const startTime = Date.now();
    const params = buildSearchParams(page);

    if (activeTab.value === 'POST') {
      const result = await searchApi.searchPosts(params);
      
      if (append) {
        posts.value = [...posts.value, ...result.items];
      } else {
        posts.value = result.items;
      }
      
      totalPosts.value = result.total;
      currentPostPage.value = result.page;
      hasMorePosts.value = result.hasMore;
      
      // 高亮关键词
      highlightKeywords();
    } else {
      const result = await searchApi.searchUsers(params);
      
      if (append) {
        users.value = [...users.value, ...result.items];
      } else {
        users.value = result.items;
      }
      
      totalUsers.value = result.total;
      currentUserPage.value = result.page;
      hasMoreUsers.value = result.hasMore;
    }

    searchTime.value = Date.now() - startTime;
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

/**
 * 高亮关键词
 */
const highlightKeywords = () => {
  // 在下一个 tick 执行，确保 DOM 已更新
  nextTick(() => {
    const keywords = searchQuery.value.trim().split(/\s+/);
    const elements = document.querySelectorAll('.search-results__post-card');

    elements.forEach((element) => {
      const titleEl = element.querySelector('h3');
      const excerptEl = element.querySelector('p');

      if (titleEl) {
        highlightElement(titleEl, keywords);
      }
      if (excerptEl) {
        highlightElement(excerptEl, keywords);
      }
    });
  });
};

/**
 * 高亮元素中的关键词
 */
const highlightElement = (element: Element, keywords: string[]) => {
  const text = element.textContent || '';
  const validKeywords = keywords.filter(k => k.length >= 2);
  if (validKeywords.length === 0) return;

  const pattern = new RegExp(
    `(${validKeywords.map(escapeRegExp).join('|')})`, 'gi'
  );
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  text.replace(pattern, (match, _p1, offset) => {
    if (offset > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
    }
    const mark = document.createElement('mark');
    mark.className = 'search-highlight';
    mark.textContent = match;
    fragment.appendChild(mark);
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  element.textContent = '';
  element.appendChild(fragment);
};

/**
 * 转义正则表达式特殊字符
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * 加载可用标签
 */
const loadAvailableTags = async () => {
  try {
    const tags = await searchApi.searchTags({
      query: searchQuery.value,
      limit: 20,
    });
    availableTags.value = tags;
  } catch (error) {
    console.error('加载标签失败:', error);
  }
};

/**
 * 处理标签页切换
 */
const handleTabChange = (tab: 'POST' | 'USER') => {
  if (activeTab.value === tab) return;
  
  activeTab.value = tab;
  performSearch();
};

/**
 * 处理排序变化
 */
const handleSortChange = (sort: typeof filters.value.sort) => {
  filters.value.sort = sort;
  performSearch();
};

/**
 * 处理日期范围变化
 */
const handleDateRangeChange = (range: typeof filters.value.dateRange) => {
  filters.value.dateRange = range;
  performSearch();
};

/**
 * 处理标签切换
 */
const handleTagToggle = (tagId: string) => {
  const index = filters.value.tagIds.indexOf(tagId);
  
  if (index > -1) {
    filters.value.tagIds.splice(index, 1);
  } else {
    filters.value.tagIds.push(tagId);
  }
  
  performSearch();
};

/**
 * 清空筛选条件
 */
const handleClearFilters = () => {
  filters.value = {
    sort: 'relevance',
    dateRange: 'all',
    tagIds: [],
  };
  performSearch();
};

/**
 * 加载更多
 */
const handleLoadMore = () => {
  const nextPage = activeTab.value === 'POST' ? currentPostPage.value + 1 : currentUserPage.value + 1;
  performSearch(nextPage, true);
};

/**
 * 监听路由查询参数变化
 */
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery && typeof newQuery === 'string') {
      searchQuery.value = newQuery;
      performSearch();
      loadAvailableTags();
    }
  },
  { immediate: true }
);

</script>

<style scoped>
.search-results {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.search-results__header {
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-xl) 0;
}

.search-results__header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.search-results__title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.search-results__query {
  color: var(--color-cta);
}

.search-results__count {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.search-results__time {
  color: var(--color-text-tertiary);
}

.search-results__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: var(--space-xl);
}

/* 筛选器 */
.search-results__filters {
  position: sticky;
  top: var(--space-xl);
  height: fit-content;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
}

.search-results__filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.search-results__filters-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.search-results__filters-clear {
  padding: 4px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-cta);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-results__filters-clear:hover {
  background: var(--color-bg-hover);
}

.search-results__filter-section + .search-results__filter-section {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.search-results__filter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md) 0;
}

.search-results__filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.search-results__filter-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-results__filter-option:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.search-results__filter-option--active {
  background: var(--color-cta);
  color: white;
}

.search-results__filter-option--active:hover {
  background: var(--color-primary);
}

.search-results__filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.search-results__filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-results__filter-tag:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.search-results__filter-tag--active {
  background: var(--color-cta);
  border-color: var(--color-cta);
  color: white;
}

.search-results__filter-tag-count {
  font-size: 11px;
  opacity: 0.7;
}

/* 主内容 */
.search-results__main {
  min-height: 400px;
}

.search-results__tabs {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  border-bottom: 2px solid var(--color-border);
}

.search-results__tab {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-results__tab:hover {
  color: var(--color-text-primary);
}

.search-results__tab--active {
  color: var(--color-cta);
  border-bottom-color: var(--color-cta);
}

.search-results__tab-count {
  padding: 2px 8px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  font-size: 12px;
}

.search-results__tab--active .search-results__tab-count {
  background: var(--color-cta);
  color: white;
}

/* 加载状态 */
.search-results__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  color: var(--color-text-secondary);
}

.search-results__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 结果列表 */
.search-results__posts,
.search-results__users {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.search-results__post-card,
.search-results__user-card {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 加载更多 */
.search-results__load-more {
  display: flex;
  justify-content: center;
  padding: var(--space-xl) 0;
}

.search-results__load-more-button {
  padding: var(--space-md) var(--space-xl);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-results__load-more-button:hover:not(:disabled) {
  background: var(--color-cta);
  border-color: var(--color-cta);
  color: white;
}

.search-results__load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 关键词高亮 */
:deep(.search-highlight) {
  background: rgba(37, 99, 235, 0.2);
  color: var(--color-cta);
  font-weight: 600;
  padding: 0 2px;
  border-radius: 2px;
}

/* 响应式 */
@media (max-width: 1023px) {
  .search-results__container {
    grid-template-columns: 1fr;
  }

  .search-results__filters {
    position: static;
  }
}

@media (max-width: 767px) {
  .search-results__header-content,
  .search-results__container {
    padding: var(--space-md);
  }

  .search-results__title {
    font-size: 20px;
  }

  .search-results__tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .search-results__tab {
    white-space: nowrap;
  }
}
</style>
