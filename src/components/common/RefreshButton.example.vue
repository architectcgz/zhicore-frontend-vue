<!--
  RefreshButton 组件使用示例
  展示如何在不同场景中使用刷新按钮
-->

<template>
  <div class="examples-container">
    <h1>RefreshButton 组件示例</h1>

    <!-- 示例 1: 基础用法 -->
    <section class="example-section">
      <h2>1. 基础用法</h2>
      <div class="example-content">
        <RefreshButton
          :loading="loading1"
          @click="handleRefresh1"
        />
        <p class="status">
          {{ status1 }}
        </p>
      </div>
    </section>

    <!-- 示例 2: 带文本 -->
    <section class="example-section">
      <h2>2. 带文本的按钮</h2>
      <div class="example-content">
        <RefreshButton
          :loading="loading2"
          show-text
          @click="handleRefresh2"
        />
        <p class="status">
          {{ status2 }}
        </p>
      </div>
    </section>

    <!-- 示例 3: 主要样式 -->
    <section class="example-section">
      <h2>3. 主要样式按钮</h2>
      <div class="example-content">
        <RefreshButton
          :loading="loading3"
          variant="primary"
          show-text
          @click="handleRefresh3"
        />
        <p class="status">
          {{ status3 }}
        </p>
      </div>
    </section>

    <!-- 示例 4: 小尺寸 -->
    <section class="example-section">
      <h2>4. 小尺寸按钮</h2>
      <div class="example-content">
        <RefreshButton
          :loading="loading4"
          size="small"
          @click="handleRefresh4"
        />
        <RefreshButton
          :loading="loading4"
          size="small"
          show-text
          @click="handleRefresh4"
        />
        <p class="status">
          {{ status4 }}
        </p>
      </div>
    </section>

    <!-- 示例 5: 禁用状态 -->
    <section class="example-section">
      <h2>5. 禁用状态</h2>
      <div class="example-content">
        <RefreshButton disabled />
        <RefreshButton
          disabled
          show-text
        />
        <p class="status">
          按钮已禁用
        </p>
      </div>
    </section>

    <!-- 示例 6: 与 TanStack Query 集成 -->
    <section class="example-section">
      <h2>6. 与 TanStack Query 集成</h2>
      <div class="example-content">
        <div class="query-example">
          <div class="query-header">
            <h3>文章列表</h3>
            <RefreshButton
              :loading="postsQuery.isFetching.value"
              @click="handleRefreshPosts"
            />
          </div>
          
          <div
            v-if="postsQuery.isLoading.value"
            class="loading"
          >
            加载中...
          </div>
          
          <div
            v-else-if="postsQuery.error.value"
            class="error"
          >
            加载失败: {{ postsQuery.error.value.message }}
          </div>
          
          <div
            v-else
            class="posts-list"
          >
            <div
              v-for="post in posts"
              :key="post.id"
              class="post-item"
            >
              <h4>{{ post.title }}</h4>
              <p>{{ post.excerpt }}</p>
            </div>
          </div>
          
          <div
            v-if="postsQuery.isFetching.value && !postsQuery.isLoading.value"
            class="refresh-indicator"
          >
            正在刷新...
          </div>
        </div>
      </div>
    </section>

    <!-- 示例 7: 自定义标签 -->
    <section class="example-section">
      <h2>7. 自定义标签</h2>
      <div class="example-content">
        <RefreshButton
          :loading="loading7"
          show-text
          label="重新加载"
          loading-text="加载中..."
          @click="handleRefresh7"
        />
        <p class="status">
          {{ status7 }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import RefreshButton from './RefreshButton.vue';
import { usePostsQuery } from '@/queries/posts/usePostsQuery';

// 示例 1
const loading1 = ref(false);
const status1 = ref('点击刷新按钮');

const handleRefresh1 = async () => {
  loading1.value = true;
  status1.value = '正在刷新...';
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  loading1.value = false;
  status1.value = '刷新完成！';
  
  setTimeout(() => {
    status1.value = '点击刷新按钮';
  }, 2000);
};

// 示例 2
const loading2 = ref(false);
const status2 = ref('点击刷新按钮');

const handleRefresh2 = async () => {
  loading2.value = true;
  status2.value = '正在刷新...';
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  loading2.value = false;
  status2.value = '刷新完成！';
  
  setTimeout(() => {
    status2.value = '点击刷新按钮';
  }, 2000);
};

// 示例 3
const loading3 = ref(false);
const status3 = ref('点击刷新按钮');

const handleRefresh3 = async () => {
  loading3.value = true;
  status3.value = '正在刷新...';
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  loading3.value = false;
  status3.value = '刷新完成！';
  
  setTimeout(() => {
    status3.value = '点击刷新按钮';
  }, 2000);
};

// 示例 4
const loading4 = ref(false);
const status4 = ref('点击刷新按钮');

const handleRefresh4 = async () => {
  loading4.value = true;
  status4.value = '正在刷新...';
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  loading4.value = false;
  status4.value = '刷新完成！';
  
  setTimeout(() => {
    status4.value = '点击刷新按钮';
  }, 2000);
};

// 示例 6: TanStack Query 集成
const queryParams = ref({ page: 1, size: 5 });
const postsQuery = usePostsQuery(queryParams);

const posts = computed(() => postsQuery.data.value?.items || []);

const handleRefreshPosts = async () => {
  await postsQuery.refetch();
};

// 示例 7
const loading7 = ref(false);
const status7 = ref('点击重新加载按钮');

const handleRefresh7 = async () => {
  loading7.value = true;
  status7.value = '正在加载...';
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  loading7.value = false;
  status7.value = '加载完成！';
  
  setTimeout(() => {
    status7.value = '点击重新加载按钮';
  }, 2000);
};
</script>

<style scoped>
.examples-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
}

.example-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.example-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.example-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.status {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

/* Query 示例样式 */
.query-example {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-background);
  border-radius: 0.5rem;
}

.query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.query-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.error {
  color: #ef4444;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  padding: 1rem;
  background-color: var(--color-surface);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.post-item h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.post-item p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.refresh-indicator {
  margin-top: 1rem;
  padding: 0.5rem;
  text-align: center;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

/* 暗色主题 */
[data-theme='dark'] .example-section {
  background-color: var(--color-surface-dark);
}

[data-theme='dark'] .query-example {
  background-color: var(--color-background-dark);
}

[data-theme='dark'] .post-item {
  background-color: var(--color-surface-dark);
  border-color: var(--color-border-dark);
}
</style>
