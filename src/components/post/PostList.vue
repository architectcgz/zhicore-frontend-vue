<!--
  文章列表组件
  支持无限滚动加载、多种布局模式、筛选排序等功能
-->

<template>
  <div class="post-list">
    <!-- 列表头部：筛选和排序 -->
    <div 
      v-if="showHeader" 
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <!-- 左侧：标题和统计 -->
      <div class="flex items-center space-x-4">
        <h2
          v-if="title"
          class="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {{ title }}
        </h2>
        <span 
          v-if="showCount && !isEmpty && !isInitialLoad" 
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          共 {{ totalItems }} 篇文章
        </span>
      </div>

      <!-- 右侧：排序和布局切换 -->
      <div class="flex items-center space-x-3">
        <!-- 排序选择器 -->
        <div
          v-if="showSort"
          class="flex items-center space-x-2"
        >
          <label class="text-sm text-gray-600 dark:text-gray-400">排序：</label>
          <select
            v-model="currentSort"
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="handleSortChange"
          >
            <option value="latest">
              最新发布
            </option>
            <option value="popular">
              最受欢迎
            </option>
            <option value="hot">
              最热文章
            </option>
            <option value="views">
              浏览最多
            </option>
            <option value="likes">
              点赞最多
            </option>
            <option value="comments">
              评论最多
            </option>
          </select>
        </div>

        <!-- 布局切换 -->
        <div
          v-if="showLayoutToggle"
          class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
        >
          <button
            class="px-3 py-1.5 text-sm transition-colors"
            :class="[
              layout === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
            @click="setLayout('grid')"
          >
            <svg
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            class="px-3 py-1.5 text-sm transition-colors"
            :class="[
              layout === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
            @click="setLayout('list')"
          >
            <svg
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- 刷新按钮 -->
        <RefreshButton
          v-if="showRefresh"
          :loading="loading && isInitialLoad"
          @click="handleRefresh"
        />
      </div>
    </div>

    <!-- 文章列表内容 -->
    <div class="post-list-content">
      <!-- 初始加载状态 -->
      <div 
        v-if="loading && isInitialLoad" 
        class="flex flex-col items-center justify-center py-12"
      >
        <LoadingSpinner size="large" />
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          正在加载文章...
        </p>
      </div>

      <!-- 错误状态 -->
      <div 
        v-else-if="error" 
        class="flex flex-col items-center justify-center py-12"
      >
        <div class="text-center">
          <svg
            class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            加载失败
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            {{ error }}
          </p>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            @click="handleRetry"
          >
            重试
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-else-if="isEmpty"
        :title="emptyTitle"
        :description="emptyDescription"
        :show-action="showEmptyAction"
        :action-text="emptyActionText"
        @action="handleEmptyAction"
      />

      <!-- 文章列表 -->
      <div 
        v-else
        class="post-list-grid"
        :class="gridClasses"
      >
        <PostCard
          v-for="(post, index) in items"
          :key="post.id"
          :post="post"
          :data-index="index"
          class="post-list-item"
          @click="handlePostClick"
          @author-click="handleAuthorClick"
          @tag-click="handleTagClick"
          @category-click="handleCategoryClick"
          @like-change="handleLikeChange"
          @favorite-change="handleFavoriteChange"
        />
      </div>

      <!-- 加载更多状态 -->
      <div 
        v-if="!isEmpty && hasMore" 
        ref="triggerRef"
        class="flex items-center justify-center py-8"
      >
        <div
          v-if="loading && !isInitialLoad"
          class="flex items-center space-x-3"
        >
          <LoadingSpinner size="small" />
          <span class="text-gray-500 dark:text-gray-400">正在加载更多...</span>
        </div>
        <button
          v-else-if="!loading"
          class="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          @click="handleLoadMore"
        >
          加载更多
        </button>
      </div>

      <!-- 没有更多内容提示 -->
      <div 
        v-if="!isEmpty && !hasMore && !loading" 
        class="text-center py-8"
      >
        <p class="text-gray-500 dark:text-gray-400">
          没有更多文章了
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue';
import { useInfinitePostsQuery } from '@/queries/posts/useInfinitePostsQuery';
import type { PostQueryParams } from '@/api/post';
import PostCard from './PostCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import RefreshButton from '@/components/common/RefreshButton.vue';
import type { Post, Tag, User } from '@/types';

/**
 * 组件属性定义
 */
interface Props {
  /** 列表标题 */
  title?: string;
  /** 查询参数 */
  queryParams?: PostQueryParams;
  /** 布局模式 */
  layout?: 'grid' | 'list';
  /** 是否显示头部 */
  showHeader?: boolean;
  /** 是否显示排序 */
  showSort?: boolean;
  /** 是否显示布局切换 */
  showLayoutToggle?: boolean;
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 是否显示文章数量 */
  showCount?: boolean;
  /** 空状态标题 */
  emptyTitle?: string;
  /** 空状态描述 */
  emptyDescription?: string;
  /** 是否显示空状态操作按钮 */
  showEmptyAction?: boolean;
  /** 空状态操作按钮文本 */
  emptyActionText?: string;
  /** 每页数量 */
  pageSize?: number;
  /** 是否启用无限滚动 */
  enableInfiniteScroll?: boolean;
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 文章点击 */
  (e: 'post-click', post: Post): void;
  /** 作者点击 */
  (e: 'author-click', author: User): void;
  /** 标签点击 */
  (e: 'tag-click', tag: Tag): void;
  /** 分类点击 */
  (e: 'category-click', category: Post['category']): void;
  /** 排序变化 */
  (e: 'sort-change', sort: string): void;
  /** 布局变化 */
  (e: 'layout-change', layout: 'grid' | 'list'): void;
  /** 空状态操作 */
  (e: 'empty-action'): void;
  /** 点赞变化 */
  (e: 'like-change', data: { postId: string; isLiked: boolean; likeCount: number }): void;
  /** 收藏变化 */
  (e: 'favorite-change', data: { postId: string; isFavorited: boolean; favoriteCount: number }): void;
}

// 组件属性和事件
const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  showHeader: true,
  showSort: true,
  showLayoutToggle: true,
  showRefresh: true,
  showCount: true,
  emptyTitle: '暂无文章',
  emptyDescription: '还没有发布任何文章',
  showEmptyAction: false,
  emptyActionText: '发布文章',
  pageSize: 12,
  enableInfiniteScroll: true,
});

const emit = defineEmits<Emits>();

// 响应式状态
const currentSort = ref(props.queryParams?.sort || 'latest');
const currentLayout = ref(props.layout);

// 查询参数
const queryParams = computed(() => ({
  ...props.queryParams,
  size: props.pageSize,
  sort: currentSort.value as any,
}));

// 使用 TanStack Query 的无限查询
const postsQuery = useInfinitePostsQuery(queryParams);

// 计算属性：扁平化的数据列表
const items = computed(() => {
  const pages = postsQuery.data.value?.pages || [];
  return pages.flatMap(page => page.items || []);
});

// 计算属性：是否正在加载
const loading = computed(() => {
  return postsQuery.isLoading.value || postsQuery.isFetchingNextPage.value;
});

// 计算属性：是否还有更多数据
const hasMore = computed(() => {
  return postsQuery.hasNextPage.value ?? false;
});

// 计算属性：错误信息
const error = computed(() => {
  return postsQuery.error.value?.message || null;
});

// 计算属性：是否为初始加载
const isInitialLoad = computed(() => {
  return postsQuery.isLoading.value && !postsQuery.data.value;
});

// 计算属性：是否可以加载更多
const canLoadMore = computed(() => {
  return hasMore.value && 
         !loading.value && 
         !postsQuery.isError.value;
});

// 计算属性：是否为空状态
const isEmpty = computed(() => {
  return !loading.value && 
         !isInitialLoad.value && 
         items.value.length === 0;
});

// 计算属性：总数据量
const totalItems = computed(() => items.value.length);

// Intersection Observer 相关
const triggerRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 防抖处理的加载函数
 */
const debouncedLoad = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    loadMore();
  }, 300);
};

/**
 * 加载更多数据
 */
const loadMore = () => {
  if (canLoadMore.value) {
    postsQuery.fetchNextPage();
  }
};

/**
 * 重置状态并重新加载
 */
const refresh = () => {
  postsQuery.refetch();
};

/**
 * 重试加载
 */
const retry = () => {
  postsQuery.refetch();
};

/**
 * 设置 Intersection Observer
 */
const setupObserver = () => {
  // 清理现有的 observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // 如果没有触发元素或未启用，则不设置 observer
  if (!triggerRef.value || !props.enableInfiniteScroll) {
    return;
  }

  // 创建新的 observer
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && canLoadMore.value) {
        debouncedLoad();
      }
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }
  );

  observer.observe(triggerRef.value);
};

/**
 * 计算属性：网格样式类
 */
const gridClasses = computed(() => {
  const baseClasses = 'gap-6';
  
  if (currentLayout.value === 'grid') {
    return `${baseClasses} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
  } else {
    return `${baseClasses} flex flex-col`;
  }
});

/**
 * 处理排序变化
 */
const handleSortChange = () => {
  emit('sort-change', currentSort.value);
  refresh();
};

/**
 * 设置布局模式
 */
const setLayout = (layout: 'grid' | 'list') => {
  currentLayout.value = layout;
  emit('layout-change', layout);
};

/**
 * 处理刷新
 */
const handleRefresh = () => {
  refresh();
};

/**
 * 处理重试
 */
const handleRetry = () => {
  retry();
};

/**
 * 处理加载更多
 */
const handleLoadMore = () => {
  loadMore();
};

/**
 * 处理文章点击
 */
const handlePostClick = (post: Post) => {
  emit('post-click', post);
};

/**
 * 处理作者点击
 */
const handleAuthorClick = (author: User) => {
  emit('author-click', author);
};

/**
 * 处理标签点击
 */
const handleTagClick = (tag: Tag) => {
  emit('tag-click', tag);
};

/**
 * 处理分类点击
 */
const handleCategoryClick = (category: Post['category']) => {
  if (category) {
    emit('category-click', category);
  }
};

/**
 * 处理空状态操作
 */
const handleEmptyAction = () => {
  emit('empty-action');
};

/**
 * 处理点赞变化
 */
const handleLikeChange = (data: { postId: string; isLiked: boolean; likeCount: number }) => {
  emit('like-change', data);
};

/**
 * 处理收藏变化
 */
const handleFavoriteChange = (data: { postId: string; isFavorited: boolean; favoriteCount: number }) => {
  emit('favorite-change', data);
};

// 监听查询参数变化
watch(
  () => props.queryParams,
  () => {
    refresh();
  },
  { deep: true }
);

// 监听布局属性变化
watch(
  () => props.layout,
  (newLayout) => {
    currentLayout.value = newLayout;
  }
);

// 设置触发元素
watch(triggerRef, async (el) => {
  if (el && props.enableInfiniteScroll) {
    await nextTick();
    setupObserver();
  }
});

// 组件挂载时的初始化
onMounted(async () => {
  // 设置 observer
  await nextTick();
  setupObserver();
});

// 组件卸载时清理
onUnmounted(() => {
  // 清理 observer
  if (observer) {
    observer.disconnect();
  }
  
  // 清理防抖定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>

<style scoped>
/* 列表项动画 */
.post-list-item {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.post-list-item:nth-child(1) { animation-delay: 0.1s; }
.post-list-item:nth-child(2) { animation-delay: 0.2s; }
.post-list-item:nth-child(3) { animation-delay: 0.3s; }
.post-list-item:nth-child(4) { animation-delay: 0.4s; }
.post-list-item:nth-child(5) { animation-delay: 0.5s; }
.post-list-item:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .post-list-grid.grid {
    grid-template-columns: 1fr;
  }
}

/* 加载状态动画 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 平滑过渡 */
.post-list-content {
  transition: all 0.3s ease-in-out;
}

/* 列表模式下的卡片样式调整 */
.post-list-grid:not(.grid) .post-list-item {
  max-width: none;
}

/* 触发元素样式 */
.post-list-trigger {
  min-height: 1px;
}
</style>