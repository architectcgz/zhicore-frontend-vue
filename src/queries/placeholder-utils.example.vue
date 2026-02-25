<!--
  PlaceholderData 使用示例

  本文件展示如何在实际组件中使用 placeholderData 功能。
-->

<template>
  <div class="placeholder-examples">
    <!-- 示例 1: 文章列表的占位数据 -->
    <section class="example-section">
      <h2>示例 1: 文章列表的占位数据</h2>
      <p>切换页面时使用前一页数据作为占位，提供即时反馈</p>
      
      <div class="controls">
        <button
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} 页</span>
        <button
          :disabled="!postsQuery.data?.value?.hasMore"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>

      <div
        v-if="postsQuery.isLoading.value"
        class="loading"
      >
        首次加载中...
      </div>

      <div
        v-else-if="postsQuery.data.value"
        class="post-list"
      >
        <article
          v-for="post in postsQuery.data.value.items"
          :key="post.id"
          class="post-item"
          :class="{ 'is-placeholder': post.title === '加载中...' }"
        >
          <h3>{{ post.title }}</h3>
          <p>{{ post.summary }}</p>
          <div class="meta">
            <span>作者: {{ post.author.nickname }}</span>
            <span>浏览: {{ post.viewCount }}</span>
          </div>
        </article>
      </div>

      <div
        v-if="postsQuery.isFetching.value && !postsQuery.isLoading.value"
        class="fetching"
      >
        正在加载新数据...
      </div>
    </section>

    <!-- 示例 2: 文章详情的占位数据 -->
    <section class="example-section">
      <h2>示例 2: 文章详情的占位数据</h2>
      <p>从列表缓存中获取文章数据作为占位，实现即时显示</p>
      
      <div class="controls">
        <select v-model="selectedPostId">
          <option value="1">
            文章 1
          </option>
          <option value="2">
            文章 2
          </option>
          <option value="3">
            文章 3
          </option>
        </select>
      </div>

      <div
        v-if="postQuery.data.value"
        class="post-detail"
      >
        <h3 :class="{ 'is-placeholder': postQuery.data.value.title === '加载中...' }">
          {{ postQuery.data.value.title }}
        </h3>
        <div class="meta">
          <span>作者: {{ postQuery.data.value.author.nickname }}</span>
          <span>发布时间: {{ formatDate(postQuery.data.value.publishedAt) }}</span>
        </div>
        <div class="content">
          {{ postQuery.data.value.content || '正在加载内容...' }}
        </div>
        <div class="stats">
          <span>👁️ {{ postQuery.data.value.viewCount }}</span>
          <span>👍 {{ postQuery.data.value.likeCount }}</span>
          <span>💬 {{ postQuery.data.value.commentCount }}</span>
        </div>
      </div>

      <div
        v-if="postQuery.isFetching.value && !postQuery.isLoading.value"
        class="fetching"
      >
        正在更新数据...
      </div>
    </section>

    <!-- 示例 3: 评论列表的占位数据 -->
    <section class="example-section">
      <h2>示例 3: 评论列表的占位数据</h2>
      <p>评论分页时使用占位数据</p>
      
      <div class="controls">
        <button
          :disabled="commentPage <= 1"
          @click="commentPage--"
        >
          上一页
        </button>
        <span>第 {{ commentPage }} 页</span>
        <button
          :disabled="!commentsQuery.data?.value?.hasMore"
          @click="commentPage++"
        >
          下一页
        </button>
      </div>

      <div
        v-if="commentsQuery.data.value"
        class="comment-list"
      >
        <article
          v-for="comment in commentsQuery.data.value.items"
          :key="comment.id"
          class="comment-item"
          :class="{ 'is-placeholder': comment.content === '加载中...' }"
        >
          <div class="comment-header">
            <span class="author">{{ comment.user.nickname }}</span>
            <span class="time">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <span>👍 {{ comment.likeCount }}</span>
            <span>💬 {{ comment.repliesCount }}</span>
          </div>
        </article>
      </div>
    </section>

    <!-- 示例 4: 无限滚动的占位数据 -->
    <section class="example-section">
      <h2>示例 4: 无限滚动的占位数据</h2>
      <p>无限滚动列表使用占位数据</p>
      
      <div
        ref="infiniteListRef"
        class="infinite-list"
      >
        <template v-if="infiniteQuery.data.value">
          <article
            v-for="(page, pageIndex) in infiniteQuery.data.value.pages"
            :key="pageIndex"
          >
            <div
              v-for="post in page.items"
              :key="post.id"
              class="post-item"
              :class="{ 'is-placeholder': post.title === '加载中...' }"
            >
              <h4>{{ post.title }}</h4>
              <p>{{ post.summary }}</p>
            </div>
          </article>
        </template>

        <div
          v-if="infiniteQuery.isFetchingNextPage.value"
          class="loading-more"
        >
          加载更多...
        </div>

        <div
          v-if="!infiniteQuery.hasNextPage.value"
          class="no-more"
        >
          没有更多了
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuery, useInfiniteQuery } from '@tanstack/vue-query';
import { queryKeys } from './query-keys';
import { CACHE_TIMES } from './query-config';
import {
  usePostsPlaceholder,
  usePostPlaceholder,
  useCommentsPlaceholder,
  useInfiniteQueryPlaceholder,
} from './placeholder-utils';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';

// ============================================================================
// 示例 1: 文章列表的占位数据
// ============================================================================

const currentPage = ref(1);

const postsParams = computed(() => ({
  page: currentPage.value,
  size: 10,
}));

const postsPlaceholder = usePostsPlaceholder(postsParams.value);

const postsQuery = useQuery({
  queryKey: computed(() => queryKeys.posts.list(postsParams.value)),
  queryFn: () => postApi.getPosts(postsParams.value),
  placeholderData: postsPlaceholder,
  ...CACHE_TIMES.POST_LIST,
});

// 监听页面变化，更新占位数据
watch(currentPage, () => {
  // 占位数据会自动使用前一页的数据
});

// ============================================================================
// 示例 2: 文章详情的占位数据
// ============================================================================

const selectedPostId = ref('1');

const postPlaceholder = usePostPlaceholder(selectedPostId.value);

const postQuery = useQuery({
  queryKey: computed(() => queryKeys.posts.detail(selectedPostId.value)),
  queryFn: () => postApi.getPostById(selectedPostId.value),
  placeholderData: postPlaceholder,
  ...CACHE_TIMES.POST_CONTENT,
});

// ============================================================================
// 示例 3: 评论列表的占位数据
// ============================================================================

const commentPage = ref(1);
const currentPostId = ref('1');

const commentsParams = computed(() => ({
  page: commentPage.value,
  size: 10,
}));

const commentsPlaceholder = useCommentsPlaceholder(
  currentPostId.value,
  commentsParams.value
);

const commentsQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.comments.list(currentPostId.value, commentsParams.value)
  ),
  queryFn: () =>
    commentApi.getCommentsByPostId(currentPostId.value, commentsParams.value),
  placeholderData: commentsPlaceholder,
  ...CACHE_TIMES.COMMENT_LIST,
});

// ============================================================================
// 示例 4: 无限滚动的占位数据
// ============================================================================

const infiniteListRef = ref<HTMLElement>();

const infiniteParams = computed(() => ({
  size: 10,
}));

const infinitePlaceholder = useInfiniteQueryPlaceholder(() =>
  queryKeys.posts.list(infiniteParams.value)
);

const infiniteQuery = useInfiniteQuery({
  queryKey: computed(() => queryKeys.posts.list(infiniteParams.value)),
  queryFn: ({ pageParam = 1 }) =>
    postApi.getPosts({ ...infiniteParams.value, page: pageParam }),
  getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  placeholderData: infinitePlaceholder,
  ...CACHE_TIMES.POST_LIST,
});

// 无限滚动监听
onMounted(() => {
  if (!infiniteListRef.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0].isIntersecting &&
        infiniteQuery.hasNextPage.value &&
        !infiniteQuery.isFetchingNextPage.value
      ) {
        infiniteQuery.fetchNextPage();
      }
    },
    { rootMargin: '100px' }
  );

  // 观察列表底部
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  infiniteListRef.value.appendChild(sentinel);
  observer.observe(sentinel);
});

// ============================================================================
// 工具函数
// ============================================================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.placeholder-examples {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.example-section h2 {
  margin-top: 0;
  color: #333;
}

.example-section p {
  color: #666;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.controls button {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.controls select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.loading,
.fetching,
.loading-more {
  padding: 16px;
  text-align: center;
  color: #1890ff;
}

.post-list,
.comment-list,
.infinite-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item,
.comment-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.3s;
}

.is-placeholder {
  background-color: #f5f5f5;
  opacity: 0.6;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

.post-item h3,
.post-item h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.post-item p {
  margin: 0 0 8px 0;
  color: #666;
}

.meta,
.stats,
.comment-actions {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #999;
}

.post-detail {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

.post-detail h3 {
  margin-top: 0;
}

.post-detail .content {
  margin: 20px 0;
  line-height: 1.6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-header .author {
  font-weight: bold;
  color: #333;
}

.comment-header .time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin-bottom: 8px;
  color: #666;
}

.no-more {
  padding: 16px;
  text-align: center;
  color: #999;
}
</style>
