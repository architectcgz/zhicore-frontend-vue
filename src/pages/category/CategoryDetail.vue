<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { postApi } from '@/api/post';
import { searchApi } from '@/api/search';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import PostCard from '@/components/post/PostCard.vue';
import type { Post } from '@/types';

type CategoryItem = {
  id: string;
  name: string;
  count: number;
  slug?: string;
};

type RawCategoryItem = {
  id: string | number;
  name?: string;
  count?: number;
  slug?: string;
};

const props = defineProps<{
  id?: string;
}>();

const route = useRoute();
const router = useRouter();

const pageSize = 10;
const sortBy = ref<'latest' | 'popular' | 'hot'>('latest');
const category = ref<CategoryItem | null>(null);
const posts = ref<Post[]>([]);
const page = ref(1);
const nextCursor = ref<string | null>(null);
const total = ref(0);
const hasMore = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref('');

const getQueryValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0].trim();
  }

  return '';
};

const routeCategoryParam = computed(() => String(props.id ?? route.params.id ?? '').trim());
const routeQueryId = computed(() => getQueryValue(route.query.id));
const routeQueryName = computed(() => getQueryValue(route.query.name));
const routeQuerySlug = computed(() => getQueryValue(route.query.slug));

const activeCategoryId = computed(() => {
  return category.value?.id || routeQueryId.value || routeCategoryParam.value;
});

const displayCategoryName = computed(() => {
  return category.value?.name || routeQueryName.value || '分类';
});

const showInitialLoading = computed(() => loading.value && posts.value.length === 0);

const normalizeCategory = (source: RawCategoryItem): CategoryItem => {
  return {
    id: String(source.id),
    name: source.name?.trim() || '未命名分类',
    count: Number(source.count ?? 0),
    slug: source.slug?.trim() || undefined,
  };
};

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === 'string' && err) {
    return err;
  }

  return '加载分类文章失败，请稍后重试';
};

const resolveCategoryMeta = async () => {
  const fallbackId = routeQueryId.value || routeCategoryParam.value;
  const fallbackName = routeQueryName.value || '分类';

  try {
    const filters = await searchApi.getSearchFilters();
    const categoryList = (filters.categories ?? []).map((item) => normalizeCategory(item as RawCategoryItem));

    const matched = categoryList.find((item) => {
      return (
        item.id === routeCategoryParam.value ||
        item.id === routeQueryId.value ||
        (!!routeQuerySlug.value && item.slug === routeQuerySlug.value) ||
        (!!routeQueryName.value && item.name === routeQueryName.value)
      );
    });

    if (matched) {
      category.value = matched;
      return;
    }
  } catch {
    // 分类元信息加载失败时，不阻塞文章列表请求，直接回退到路由信息
  }

  category.value = fallbackId
    ? {
        id: fallbackId,
        name: fallbackName,
        count: 0,
        slug: routeQuerySlug.value || undefined,
      }
    : null;
};

const fetchPosts = async (reset: boolean) => {
  const categoryId = activeCategoryId.value;
  const isLatestSort = sortBy.value === 'latest';

  if (!categoryId) {
    error.value = '分类参数缺失';
    posts.value = [];
    total.value = 0;
    hasMore.value = false;
    return;
  }

  if (reset) {
    loading.value = true;
    error.value = '';
    page.value = 1;
    nextCursor.value = null;
  } else {
    loadingMore.value = true;
  }

  const targetPage = reset ? 1 : page.value + 1;
  const currentCursor = reset ? undefined : nextCursor.value || undefined;

  try {
    const response = await postApi.getPosts({
      page: isLatestSort ? undefined : targetPage,
      cursor: isLatestSort ? currentCursor : undefined,
      size: pageSize,
      sort: sortBy.value,
      status: 'PUBLISHED',
      categoryId,
    });

    if (reset) {
      posts.value = response.items;
    } else {
      posts.value = [...posts.value, ...response.items];
    }

    page.value = targetPage;
    total.value = response.total;
    nextCursor.value = isLatestSort ? response.cursor ?? null : null;
    hasMore.value = isLatestSort ? response.hasMore && Boolean(response.cursor) : response.hasMore;
  } catch (err) {
    error.value = getErrorMessage(err);
    if (reset) {
      posts.value = [];
      total.value = 0;
      hasMore.value = false;
      nextCursor.value = null;
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const initializePage = async () => {
  await resolveCategoryMeta();
  await fetchPosts(true);
};

const goToCategoryList = () => {
  router.push('/categories');
};

const loadMore = () => {
  if (!hasMore.value || loadingMore.value || loading.value) {
    return;
  }

  void fetchPosts(false);
};

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

watch(
  [routeCategoryParam, routeQueryId, routeQueryName, routeQuerySlug],
  () => {
    void initializePage();
  },
  { immediate: true }
);

watch(sortBy, () => {
  void fetchPosts(true);
});
</script>

<template>
  <div class="category-detail-page">
    <header class="category-detail-page__header">
      <button
        class="category-detail-page__back"
        type="button"
        @click="goToCategoryList"
      >
        返回分类列表
      </button>

      <h1 class="category-detail-page__title">
        {{ displayCategoryName }}
      </h1>

      <p class="category-detail-page__meta">
        共 {{ total }} 篇文章
      </p>
    </header>

    <div class="category-detail-page__toolbar">
      <label
        class="category-detail-page__sort-label"
        for="category-sort"
      >
        排序
      </label>
      <select
        id="category-sort"
        v-model="sortBy"
        class="category-detail-page__sort"
      >
        <option value="latest">
          最新
        </option>
        <option value="popular">
          最热
        </option>
        <option value="hot">
          热度
        </option>
      </select>
      <button
        class="category-detail-page__refresh"
        type="button"
        :disabled="loading"
        @click="initializePage"
      >
        刷新
      </button>
    </div>

    <div
      v-if="showInitialLoading"
      class="category-detail-page__state"
    >
      <LoadingSpinner />
      <p>正在加载文章...</p>
    </div>

    <div
      v-else-if="error && posts.length === 0"
      class="category-detail-page__state"
    >
      <SiteErrorState
        title="加载分类文章失败"
        :message="error"
        mode="section"
        retry-text="重试加载"
        @retry="initializePage"
      />
    </div>

    <div
      v-else-if="posts.length === 0"
      class="category-detail-page__state"
    >
      <p>该分类下暂无文章</p>
    </div>

    <div
      v-else
      class="category-detail-page__content"
    >
      <div class="category-detail-page__posts">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          class="category-detail-page__post"
          @like-change="handleLikeChange"
          @favorite-change="handleFavoriteChange"
        />
      </div>

      <div
        v-if="hasMore"
        class="category-detail-page__more"
      >
        <button
          class="category-detail-page__more-button"
          type="button"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.category-detail-page__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.category-detail-page__back {
  align-self: flex-start;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.category-detail-page__title {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
  line-height: 1.2;
}

.category-detail-page__meta {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.category-detail-page__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  margin-bottom: var(--space-md);
}

.category-detail-page__sort-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.category-detail-page__sort {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

.category-detail-page__refresh,
.category-detail-page__retry,
.category-detail-page__more-button {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  cursor: pointer;
}

.category-detail-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 260px;
  color: var(--color-text-secondary);
}

.category-detail-page__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.category-detail-page__posts {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.category-detail-page__more {
  display: flex;
  justify-content: center;
  padding: var(--space-sm) 0 var(--space-lg);
}

@media (max-width: 768px) {
  .category-detail-page {
    padding: var(--space-md);
  }

  .category-detail-page__toolbar {
    flex-wrap: wrap;
  }
}
</style>
