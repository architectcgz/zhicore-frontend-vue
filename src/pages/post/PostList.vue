<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import PostListCard from '@/components/post/PostListCard.vue';
import PostListFilter from '@/components/post/PostListFilter.vue';
import PostListSidebar from '@/components/post/PostListSidebar.vue';
import { usePostsListPage } from '@/composables/usePostsListPage';

const {
  sort,
  tagIds,
  timeRange,
  page,
  isMobile,
  availableTags,
  hotTags,
  hotCreators,
  posts,
  total,
  isLoading,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  updateFilters,
  updatePage,
  handleLike,
  handleFavorite,
  loadMore,
} = usePostsListPage();

const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const handleSidebarTagClick = (tagId: string) => {
  updateFilters({
    sort: sort.value,
    tagIds: [tagId],
    timeRange: timeRange.value,
  });
};

const setupObserver = async () => {
  observer?.disconnect();
  observer = null;

  if (!isMobile.value || !hasNextPage.value) {
    return;
  }

  await nextTick();

  if (!loadMoreTrigger.value) {
    return;
  }

  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      loadMore();
    }
  }, {
    rootMargin: '120px 0px',
  });

  observer.observe(loadMoreTrigger.value);
};

watch([isMobile, hasNextPage, loadMoreTrigger], () => {
  void setupObserver();
});

onMounted(() => {
  void setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div class="post-list-page">
    <header class="post-list-page__header">
      <div>
        <p class="post-list-page__eyebrow">
          Community Posts
        </p>
        <h1>文章广场</h1>
      </div>
      <p class="post-list-page__description">
        浏览全站已发布内容，按时间、热度和标签快速定位值得阅读的文章。
      </p>
    </header>

    <PostListFilter
      :sort="sort"
      :tag-ids="tagIds"
      :time-range="timeRange"
      :available-tags="availableTags"
      @change="updateFilters"
    />

    <div class="post-list-page__layout">
      <section class="post-list-page__feed">
        <p
          v-if="errorMessage"
          class="post-list-page__state post-list-page__state--error"
        >
          {{ errorMessage }}
        </p>

        <p
          v-else-if="isLoading && posts.length === 0"
          class="post-list-page__state"
        >
          正在加载文章列表...
        </p>

        <p
          v-else-if="posts.length === 0"
          class="post-list-page__state"
        >
          暂无符合条件的文章。
        </p>

        <div
          v-else
          class="post-list-page__cards"
        >
          <PostListCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @like="handleLike"
            @favorite="handleFavorite"
          />
        </div>

        <div
          v-if="isMobile && hasNextPage"
          ref="loadMoreTrigger"
          class="post-list-page__load-more-trigger"
        >
          <span>{{ isFetchingNextPage ? '正在加载更多...' : '向下滚动加载更多' }}</span>
        </div>

        <ElPagination
          v-if="!isMobile && total > 0"
          class="post-list-page__pagination"
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="10"
          :current-page="page"
          @current-change="updatePage"
        />
      </section>

      <PostListSidebar
        v-if="!isMobile"
        :is-mobile="isMobile"
        :selected-tag-ids="tagIds"
        :hot-tags="hotTags"
        :hot-creators="hotCreators"
        @tag-click="handleSidebarTagClick"
      />
    </div>
  </div>
</template>

<style scoped>
.post-list-page {
  display: grid;
  gap: var(--space-lg);
}

.post-list-page__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-lg);
}

.post-list-page__eyebrow {
  margin-bottom: 8px;
  color: var(--color-text-tertiary);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.74rem;
}

.post-list-page__description {
  max-width: 44ch;
  color: var(--color-text-secondary);
  line-height: 1.7;
  text-align: right;
}

.post-list-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--space-lg);
}

.post-list-page__feed {
  display: grid;
  gap: var(--space-md);
}

.post-list-page__cards {
  display: grid;
  gap: var(--space-md);
}

.post-list-page__state {
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.post-list-page__state--error {
  color: var(--color-danger, #d14343);
}

.post-list-page__load-more-trigger {
  display: flex;
  justify-content: center;
  padding: var(--space-md);
  color: var(--color-text-secondary);
}

.post-list-page__pagination {
  justify-self: center;
}

@media (max-width: 767px) {
  .post-list-page__header {
    flex-direction: column;
    align-items: start;
  }

  .post-list-page__description {
    text-align: left;
  }

  .post-list-page__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
