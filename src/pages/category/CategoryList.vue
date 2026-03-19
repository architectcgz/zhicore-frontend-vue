<template>
  <div class="category-list-page">
    <header class="category-list-page__header">
      <h1 class="category-list-page__title">
        分类
      </h1>
      <p class="category-list-page__description">
        按内容分类快速浏览文章。
      </p>
    </header>

    <div class="category-list-page__toolbar">
      <input
        v-model="keyword"
        type="text"
        class="category-list-page__search"
        placeholder="搜索分类..."
      >
      <button
        class="category-list-page__refresh"
        type="button"
        :disabled="loading"
        @click="fetchCategories"
      >
        刷新
      </button>
    </div>

    <div
      v-if="loading"
      class="category-list-page__state"
    >
      <LoadingSpinner />
      <p>正在加载分类...</p>
    </div>

    <div
      v-else-if="error"
      class="category-list-page__state"
    >
      <SiteErrorState
        title="加载分类失败"
        :message="error"
        mode="section"
        retry-text="重试加载"
        @retry="fetchCategories"
      />
    </div>

    <div
      v-else-if="filteredCategories.length === 0"
      class="category-list-page__state"
    >
      <p>{{ keyword ? '没有匹配的分类' : '暂无分类数据' }}</p>
    </div>

    <div
      v-else
      class="category-list-page__list"
    >
      <button
        v-for="category in filteredCategories"
        :key="category.id"
        class="category-list-page__item"
        type="button"
        @click="goToCategory(category)"
      >
        <span class="category-list-page__item-name">{{ category.name }}</span>
        <span class="category-list-page__item-count">{{ category.count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { searchApi } from '@/api/search';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';

type CategoryItem = {
  id: string;
  name: string;
  count: number;
  slug?: string;
};

type RawCategoryItem = {
  id: string | number;
  name: string;
  count?: number;
  slug?: string;
};

const router = useRouter();
const loading = ref(false);
const error = ref('');
const keyword = ref('');
const categories = ref<CategoryItem[]>([]);

const filteredCategories = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  if (!query) {
    return categories.value;
  }

  return categories.value.filter((category) => category.name.toLowerCase().includes(query));
});

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return '加载分类失败，请稍后重试';
};

const fetchCategories = async () => {
  loading.value = true;
  error.value = '';

  try {
    const filters = await searchApi.getSearchFilters();
    categories.value = (filters.categories ?? [])
      .map((item) => {
        const source = item as RawCategoryItem;
        return {
          id: String(source.id),
          name: source.name || '未命名分类',
          count: Number(source.count ?? 0),
          slug: source.slug,
        };
      })
      .sort((a, b) => b.count - a.count);
  } catch (err) {
    error.value = getErrorMessage(err);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

const goToCategory = (category: CategoryItem) => {
  const query: Record<string, string> = {
    id: category.id,
    name: category.name,
  };

  if (category.slug) {
    query.slug = category.slug;
  }

  router.push({
    path: `/categories/${category.id}`,
    query,
  });
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.category-list-page__header {
  margin-bottom: var(--space-lg);
}

.category-list-page__title {
  margin: 0 0 var(--space-xs) 0;
  color: var(--color-text);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
}

.category-list-page__description {
  margin: 0;
  color: var(--color-text-secondary);
}

.category-list-page__toolbar {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.category-list-page__search {
  flex: 1;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

.category-list-page__refresh,
.category-list-page__retry {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

.category-list-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 220px;
  color: var(--color-text-secondary);
}

.category-list-page__list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
}

.category-list-page__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 var(--space-sm);
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  background: transparent;
  color: var(--color-text);
  text-align: left;
}

.category-list-page__item:hover {
  background: var(--color-bg-hover);
}

.category-list-page__item-name {
  font-weight: var(--font-weight-medium);
}

.category-list-page__item-count {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
</style>
