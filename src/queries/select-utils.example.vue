<!--
  Data Transformation (Select) 使用示例

  本文件展示如何使用 select 选项优化数据转换，减少不必要的重新渲染。
-->

<template>
  <div class="select-examples">
    <!-- 示例 1: 选择部分字段 -->
    <section class="example-section">
      <h2>示例 1: 选择部分字段</h2>
      <p>只选择需要的字段，减少组件依赖</p>
      
      <div
        v-if="postSummaryQuery.data.value"
        class="post-summary"
      >
        <h3>{{ postSummaryQuery.data.value.title }}</h3>
        <p>{{ postSummaryQuery.data.value.summary }}</p>
        <p class="note">
          注意：这个组件只依赖 title 和 summary，
          其他字段的变化不会触发重新渲染
        </p>
      </div>
    </section>

    <!-- 示例 2: 选择统计信息 -->
    <section class="example-section">
      <h2>示例 2: 选择统计信息</h2>
      <p>只选择统计数据，用于显示计数器</p>
      
      <div
        v-if="postStatsQuery.data.value"
        class="post-stats"
      >
        <div class="stat-item">
          <span class="icon">👁️</span>
          <span class="count">{{ postStatsQuery.data.value.viewCount }}</span>
        </div>
        <div class="stat-item">
          <span class="icon">👍</span>
          <span class="count">{{ postStatsQuery.data.value.likeCount }}</span>
        </div>
        <div class="stat-item">
          <span class="icon">⭐</span>
          <span class="count">{{ postStatsQuery.data.value.favoriteCount }}</span>
        </div>
        <div class="stat-item">
          <span class="icon">💬</span>
          <span class="count">{{ postStatsQuery.data.value.commentCount }}</span>
        </div>
      </div>
    </section>

    <!-- 示例 3: 选择 ID 列表 -->
    <section class="example-section">
      <h2>示例 3: 选择 ID 列表</h2>
      <p>只提取 ID，用于批量操作</p>
      
      <div
        v-if="postIdsQuery.data.value"
        class="id-list"
      >
        <p>文章 ID 列表：</p>
        <ul>
          <li
            v-for="id in postIdsQuery.data.value"
            :key="id"
          >
            {{ id }}
          </li>
        </ul>
        <button @click="handleBatchOperation">
          批量操作 ({{ postIdsQuery.data.value.length }} 项)
        </button>
      </div>
    </section>

    <!-- 示例 4: 过滤和排序 -->
    <section class="example-section">
      <h2>示例 4: 过滤和排序</h2>
      <p>使用 select 进行数据过滤和排序</p>
      
      <div
        v-if="filteredPostsQuery.data.value"
        class="filtered-posts"
      >
        <h3>已发布的文章（按点赞数排序）</h3>
        <article
          v-for="post in filteredPostsQuery.data.value.items"
          :key="post.id"
          class="post-item"
        >
          <h4>{{ post.title }}</h4>
          <div class="meta">
            <span>👍 {{ post.likeCount }}</span>
            <span>状态: {{ post.status }}</span>
          </div>
        </article>
      </div>
    </section>

    <!-- 示例 5: 组合选择器 -->
    <section class="example-section">
      <h2>示例 5: 组合选择器</h2>
      <p>组合多个选择器进行复杂转换</p>
      
      <div
        v-if="composedQuery.data.value"
        class="composed-result"
      >
        <h3>前 5 篇已发布文章的标题</h3>
        <ul>
          <li
            v-for="(title, index) in composedQuery.data.value"
            :key="index"
          >
            {{ title }}
          </li>
        </ul>
      </div>
    </section>

    <!-- 示例 6: 条件选择 -->
    <section class="example-section">
      <h2>示例 6: 条件选择</h2>
      <p>根据条件选择不同的数据</p>
      
      <div class="controls">
        <label>
          <input
            v-model="showFullContent"
            type="checkbox"
          >
          显示完整内容
        </label>
      </div>

      <div
        v-if="conditionalQuery.data.value"
        class="conditional-result"
      >
        <h3>{{ conditionalQuery.data.value.title }}</h3>
        <p>{{ conditionalQuery.data.value.content }}</p>
      </div>
    </section>

    <!-- 示例 7: 性能对比 -->
    <section class="example-section">
      <h2>示例 7: 性能对比</h2>
      <p>对比使用和不使用 select 的渲染次数</p>
      
      <div class="performance-comparison">
        <div class="comparison-item">
          <h4>不使用 select</h4>
          <p>渲染次数: {{ withoutSelectRenderCount }}</p>
          <div v-if="withoutSelectQuery.data.value">
            <p>标题: {{ withoutSelectQuery.data.value.title }}</p>
          </div>
        </div>

        <div class="comparison-item">
          <h4>使用 select</h4>
          <p>渲染次数: {{ withSelectRenderCount }}</p>
          <div v-if="withSelectQuery.data.value">
            <p>标题: {{ withSelectQuery.data.value }}</p>
          </div>
        </div>

        <button @click="triggerUpdate">
          触发更新（修改其他字段）
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { queryKeys } from './query-keys';
import { CACHE_TIMES } from './query-config';
import {
  selectPostSummary,
  selectPostStats,
  selectPostIds,
  selectorFactory,
  composeSelectors,
  commonSelectors,
} from './select-utils';
import { postApi } from '@/api/post';
import type { Post, PaginatedResponse } from '@/types';

// ============================================================================
// 示例 1: 选择部分字段
// ============================================================================

const postSummaryQuery = useQuery({
  queryKey: queryKeys.posts.detail('1'),
  queryFn: () => postApi.getPostById('1'),
  select: selectPostSummary,
  ...CACHE_TIMES.POST_CONTENT,
});

// ============================================================================
// 示例 2: 选择统计信息
// ============================================================================

const postStatsQuery = useQuery({
  queryKey: queryKeys.posts.detail('1'),
  queryFn: () => postApi.getPostById('1'),
  select: selectPostStats,
  ...CACHE_TIMES.POST_CONTENT,
});

// ============================================================================
// 示例 3: 选择 ID 列表
// ============================================================================

const postIdsQuery = useQuery({
  queryKey: queryKeys.posts.list({ page: 1, size: 10 }),
  queryFn: () => postApi.getPosts({ page: 1, size: 10 }),
  select: selectPostIds,
  ...CACHE_TIMES.POST_LIST,
});

const handleBatchOperation = () => {
  const ids = postIdsQuery.data.value;
  console.log('批量操作 IDs:', ids);
  // 执行批量操作...
};

// ============================================================================
// 示例 4: 过滤和排序
// ============================================================================

// 创建组合选择器：过滤已发布 + 按点赞数排序
const selectPublishedAndSorted = composeSelectors(
  selectorFactory.filterArray<Post>((post) => post.status === 'PUBLISHED'),
  selectorFactory.sortArray<Post>((a, b) => b.likeCount - a.likeCount)
);

const filteredPostsQuery = useQuery({
  queryKey: queryKeys.posts.list({ page: 1, size: 10 }),
  queryFn: () => postApi.getPosts({ page: 1, size: 10 }),
  select: selectPublishedAndSorted,
  ...CACHE_TIMES.POST_LIST,
});

// ============================================================================
// 示例 5: 组合选择器
// ============================================================================

// 组合选择器：过滤 + 切片 + 映射
const selectTopPublishedTitles = composeSelectors(
  selectorFactory.filterArray<Post>((post) => post.status === 'PUBLISHED'),
  selectorFactory.sliceArray<Post>(0, 5),
  selectorFactory.mapArray<Post, string>((post) => post.title)
);

const composedQuery = useQuery({
  queryKey: queryKeys.posts.list({ page: 1, size: 20 }),
  queryFn: () => postApi.getPosts({ page: 1, size: 20 }),
  select: selectTopPublishedTitles,
  ...CACHE_TIMES.POST_LIST,
});

// ============================================================================
// 示例 6: 条件选择
// ============================================================================

const showFullContent = ref(false);

const selectConditionalContent = (post: Post) => {
  if (showFullContent.value) {
    return {
      title: post.title,
      content: post.content,
    };
  } else {
    return {
      title: post.title,
      content: post.summary,
    };
  }
};

const conditionalQuery = useQuery({
  queryKey: computed(() => ['post-conditional', '1', showFullContent.value]),
  queryFn: () => postApi.getPostById('1'),
  select: selectConditionalContent,
  ...CACHE_TIMES.POST_CONTENT,
});

// ============================================================================
// 示例 7: 性能对比
// ============================================================================

const withoutSelectRenderCount = ref(0);
const withSelectRenderCount = ref(0);

// 不使用 select
const withoutSelectQuery = useQuery({
  queryKey: queryKeys.posts.detail('2'),
  queryFn: () => postApi.getPostById('2'),
  ...CACHE_TIMES.POST_CONTENT,
});

// 使用 select（只选择标题）
const withSelectQuery = useQuery({
  queryKey: queryKeys.posts.detail('2'),
  queryFn: () => postApi.getPostById('2'),
  select: (post: Post) => post.title,
  ...CACHE_TIMES.POST_CONTENT,
});

// 监听数据变化，统计渲染次数
watch(
  () => withoutSelectQuery.data.value,
  () => {
    withoutSelectRenderCount.value++;
  }
);

watch(
  () => withSelectQuery.data.value,
  () => {
    withSelectRenderCount.value++;
  }
);

const queryClient = useQueryClient();

const triggerUpdate = () => {
  // 模拟更新文章的其他字段（不是标题）
  const currentData = queryClient.getQueryData<Post>(queryKeys.posts.detail('2'));
  if (currentData) {
    queryClient.setQueryData<Post>(queryKeys.posts.detail('2'), {
      ...currentData,
      viewCount: currentData.viewCount + 1, // 修改浏览数
    });
  }
};
</script>

<style scoped>
.select-examples {
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

.note {
  padding: 12px;
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
  color: #0050b3;
  font-size: 14px;
}

.post-summary {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.post-summary h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.post-stats {
  display: flex;
  gap: 24px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item .icon {
  font-size: 24px;
}

.stat-item .count {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.id-list {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.id-list ul {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.id-list li {
  padding: 4px 0;
  font-family: monospace;
  color: #666;
}

.id-list button {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filtered-posts {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.post-item {
  padding: 12px;
  margin-bottom: 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.post-item h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #999;
}

.composed-result {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.composed-result ul {
  list-style: decimal;
  padding-left: 24px;
}

.composed-result li {
  padding: 4px 0;
  color: #333;
}

.controls {
  margin-bottom: 16px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.conditional-result {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.conditional-result h3 {
  margin-top: 0;
}

.performance-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.comparison-item {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.comparison-item h4 {
  margin-top: 0;
  color: #333;
}

.performance-comparison button {
  grid-column: 1 / -1;
  padding: 10px 20px;
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.performance-comparison button:hover {
  background-color: #73d13d;
}
</style>
