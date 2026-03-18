<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHotSearchesQuery } from '@/queries/search/useHotSearchesQuery';
import { useSearchPostsQuery } from '@/queries/search/useSearchPostsQuery';
import { getErrorMessage } from '@/types/errors';
import type { SearchPostItem } from '@/api/search';

const route = useRoute();
const router = useRouter();
const pageSize = 10;

const searchQuery = computed(() => {
  const raw = route.query.q;
  return typeof raw === 'string' ? raw.trim() : '';
});

const currentPage = computed(() => {
  const raw = Number(route.query.page ?? '1');
  if (!Number.isFinite(raw) || raw < 1) {
    return 1;
  }

  return Math.floor(raw);
});

const queryParams = computed(() => ({
  page: currentPage.value - 1,
  size: pageSize,
}));

const {
  data,
  isLoading,
  error,
  refetch,
} = useSearchPostsQuery(searchQuery, queryParams);

const {
  data: hotKeywordsData,
} = useHotSearchesQuery(10);

const posts = computed(() => data.value?.items ?? []);
const totalResults = computed(() => data.value?.total ?? 0);
const totalPages = computed(() => {
  if (!data.value || data.value.total === 0) {
    return 0;
  }

  return Math.ceil(data.value.total / data.value.size);
});
const errorMessage = computed(() => error.value ? getErrorMessage(error.value) : null);
const loading = computed(() => isLoading.value && !!searchQuery.value);
const hotKeywords = computed(() => hotKeywordsData.value ?? []);

const stripHtml = (value?: string) => (value ?? '').replace(/<[^>]*>/g, '').trim();

const getPostTitle = (post: SearchPostItem) => stripHtml(post.highlightTitle || post.title) || post.title;
const getPostExcerpt = (post: SearchPostItem) => {
  const value = stripHtml(post.highlightContent || post.excerpt);
  return value || '暂无摘要';
};

const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const navigateToPost = (postId: string) => {
  void router.push({ name: 'PostDetail', params: { id: postId } });
};

const navigateToKeyword = (keyword: string, page: number = 1) => {
  void router.push({
    path: '/search',
    query: {
      q: keyword,
      page: page > 1 ? String(page) : undefined,
    },
  });
};

const handleRetry = () => {
  void refetch();
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || !searchQuery.value) {
    return;
  }

  navigateToKeyword(searchQuery.value, page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="search-results">
    <header class="search-results__header">
      <div class="search-results__header-inner">
        <p class="search-results__eyebrow">
          Public Search
        </p>
        <h1 class="search-results__title">
          文章搜索
          <span
            v-if="searchQuery"
            class="search-results__query"
          >“{{ searchQuery }}”</span>
        </h1>
        <p
          v-if="searchQuery && !loading && !errorMessage"
          class="search-results__summary"
        >
          找到 {{ totalResults }} 条结果
        </p>
        <p
          v-else
          class="search-results__summary"
        >
          当前仅对齐 backend-confirmed 的文章搜索能力
        </p>
      </div>
    </header>

    <main class="search-results__body">
      <section
        v-if="!searchQuery"
        class="search-results__panel"
      >
        <h2 class="search-results__panel-title">
          热门搜索
        </h2>
        <p class="search-results__panel-text">
          从已确认的热门关键词开始搜索文章。
        </p>
        <div
          v-if="hotKeywords.length > 0"
          class="search-results__keywords"
        >
          <button
            v-for="keyword in hotKeywords"
            :key="keyword"
            class="search-results__keyword"
            @click="navigateToKeyword(keyword)"
          >
            {{ keyword }}
          </button>
        </div>
        <p
          v-else
          class="search-results__empty-text"
        >
          暂无热门搜索词
        </p>
      </section>

      <div
        v-else-if="loading"
        class="search-results__state"
      >
        <div class="search-results__spinner" />
        <p>搜索中...</p>
      </div>

      <div
        v-else-if="errorMessage"
        class="search-results__state"
      >
        <p class="search-results__error">
          {{ errorMessage }}
        </p>
        <button
          class="search-results__retry"
          @click="handleRetry"
        >
          重试
        </button>
      </div>

      <section
        v-else-if="posts.length > 0"
        class="search-results__results"
      >
        <article
          v-for="post in posts"
          :key="post.id"
          class="search-results__card"
          @click="navigateToPost(post.id)"
        >
          <div class="search-results__card-main">
            <div class="search-results__meta">
              <span v-if="post.authorName">{{ post.authorName }}</span>
              <span v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
              <span v-if="post.score !== undefined">相关度 {{ post.score.toFixed(1) }}</span>
            </div>

            <h2 class="search-results__card-title">
              {{ getPostTitle(post) }}
            </h2>

            <p class="search-results__card-excerpt">
              {{ getPostExcerpt(post) }}
            </p>

            <div
              v-if="post.tags.length > 0"
              class="search-results__tags"
            >
              <span
                v-for="tag in post.tags"
                :key="`${post.id}-${tag}`"
                class="search-results__tag"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <div class="search-results__stats">
            <span>赞 {{ post.likeCount }}</span>
            <span>评 {{ post.commentCount }}</span>
            <span>阅 {{ post.viewCount }}</span>
          </div>
        </article>

        <div
          v-if="totalPages > 1"
          class="search-results__pagination"
        >
          <button
            class="search-results__pagination-button"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            上一页
          </button>
          <span class="search-results__pagination-info">
            第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <button
            class="search-results__pagination-button"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </section>

      <section
        v-else
        class="search-results__panel"
      >
        <h2 class="search-results__panel-title">
          没有找到相关文章
        </h2>
        <p class="search-results__panel-text">
          试试更短或更通用的关键词，或者从下面的热门搜索开始。
        </p>
        <div
          v-if="hotKeywords.length > 0"
          class="search-results__keywords"
        >
          <button
            v-for="keyword in hotKeywords"
            :key="keyword"
            class="search-results__keyword"
            @click="navigateToKeyword(keyword)"
          >
            {{ keyword }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.search-results {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(217, 119, 6, 0.16), transparent 26%),
    linear-gradient(180deg, #fffaf1 0%, #fff 44%, #f8f5ef 100%);
}

.search-results__header {
  border-bottom: 1px solid rgba(120, 53, 15, 0.12);
  background: rgba(255, 250, 241, 0.88);
  backdrop-filter: blur(10px);
}

.search-results__header-inner,
.search-results__body {
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
}

.search-results__header-inner {
  padding: 48px 0 28px;
}

.search-results__eyebrow {
  margin: 0 0 8px;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #b45309;
}

.search-results__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(2rem, 4vw, 3.25rem);
  color: #3f2a18;
}

.search-results__query {
  color: #b45309;
}

.search-results__summary {
  margin: 12px 0 0;
  color: #6b5b4d;
}

.search-results__body {
  padding: 28px 0 56px;
}

.search-results__panel,
.search-results__card,
.search-results__state {
  border: 1px solid rgba(120, 53, 15, 0.12);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 45px rgba(63, 42, 24, 0.08);
}

.search-results__panel,
.search-results__state {
  padding: 28px;
  text-align: center;
}

.search-results__panel-title {
  margin: 0 0 10px;
  font-size: 1.25rem;
  color: #3f2a18;
}

.search-results__panel-text,
.search-results__empty-text {
  margin: 0;
  color: #6b5b4d;
}

.search-results__keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.search-results__keyword {
  border: 1px solid rgba(180, 83, 9, 0.18);
  border-radius: 999px;
  background: #fff7ed;
  color: #9a3412;
  padding: 10px 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.search-results__keyword:hover {
  transform: translateY(-1px);
  border-color: rgba(180, 83, 9, 0.34);
  box-shadow: 0 10px 24px rgba(180, 83, 9, 0.12);
}

.search-results__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.search-results__spinner {
  width: 42px;
  height: 42px;
  border: 3px solid rgba(217, 119, 6, 0.18);
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-results__error {
  margin: 0;
  color: #b91c1c;
}

.search-results__retry,
.search-results__pagination-button {
  border: none;
  border-radius: 999px;
  background: #b45309;
  color: #fff;
  padding: 10px 18px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.search-results__retry:hover,
.search-results__pagination-button:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.search-results__pagination-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.search-results__results {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.search-results__card {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.search-results__card:hover {
  transform: translateY(-2px);
  border-color: rgba(180, 83, 9, 0.28);
  box-shadow: 0 22px 50px rgba(63, 42, 24, 0.12);
}

.search-results__card-main {
  min-width: 0;
}

.search-results__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 0.875rem;
  color: #8a735d;
}

.search-results__card-title {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.35;
  color: #3f2a18;
}

.search-results__card-excerpt {
  margin: 12px 0 0;
  line-height: 1.7;
  color: #5f5144;
}

.search-results__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.search-results__tag {
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  padding: 6px 10px;
  font-size: 0.85rem;
}

.search-results__stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 84px;
  text-align: right;
  font-size: 0.875rem;
  color: #8a735d;
}

.search-results__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding-top: 10px;
}

.search-results__pagination-info {
  color: #6b5b4d;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .search-results__header-inner {
    padding-top: 36px;
  }

  .search-results__body {
    padding-top: 20px;
  }

  .search-results__card {
    flex-direction: column;
  }

  .search-results__stats {
    flex-direction: row;
    justify-content: flex-start;
    min-width: 0;
    text-align: left;
  }

  .search-results__pagination {
    flex-wrap: wrap;
  }
}
</style>
