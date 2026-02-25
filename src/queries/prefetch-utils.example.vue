<!--
  Query Prefetch 使用示例

  本文件展示如何在实际组件中使用查询预取功能。
-->

<template>
  <div class="prefetch-examples">
    <!-- 示例 1: 文章列表中的预取 -->
    <section class="example-section">
      <h2>示例 1: 文章列表中的预取</h2>
      <p>当鼠标悬停在文章链接上时，预取文章详情</p>
      
      <div class="post-list">
        <article
          v-for="post in posts"
          :key="post.id"
          class="post-item"
        >
          <router-link
            :to="`/post/${post.id}`"
            @mouseenter="handlePostHover(post.id)"
          >
            <h3>{{ post.title }}</h3>
            <p>{{ post.summary }}</p>
          </router-link>
        </article>
      </div>
    </section>

    <!-- 示例 2: 批量预取 -->
    <section class="example-section">
      <h2>示例 2: 批量预取可见文章</h2>
      <p>使用 Intersection Observer 预取进入视口的文章</p>
      
      <div class="infinite-list">
        <article
          v-for="post in infinitePosts"
          :key="post.id"
          :ref="(el) => setPostRef(el, post.id)"
          :data-post-id="post.id"
          class="post-item"
        >
          <h3>{{ post.title }}</h3>
          <p>{{ post.summary }}</p>
        </article>
      </div>
    </section>

    <!-- 示例 3: 导航前预取 -->
    <section class="example-section">
      <h2>示例 3: 导航前预取</h2>
      <p>点击按钮时先预取数据，然后导航</p>
      
      <div class="navigation-buttons">
        <button @click="navigateToPostList">
          前往文章列表（预取数据）
        </button>
        <button @click="navigateToHome">
          前往首页（预取数据）
        </button>
      </div>
    </section>

    <!-- 示例 4: 相关内容预取 -->
    <section class="example-section">
      <h2>示例 4: 相关内容预取</h2>
      <p>在文章详情页，自动预取相关文章和评论</p>
      
      <div
        v-if="currentPost"
        class="post-detail"
      >
        <h3>{{ currentPost.title }}</h3>
        <p>{{ currentPost.content }}</p>
        <button @click="prefetchRelatedContent">
          预取相关内容
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  usePrefetchPost,
  usePrefetchPosts,
  usePrefetchPostsBatch,
  usePrefetchComments,
  usePrefetchRelatedPosts,
  usePrefetchHotPosts,
  usePrefetchRecommendedPosts,
} from './prefetch-utils';

// ============================================================================
// 示例 1: 文章列表中的预取
// ============================================================================

const posts = ref([
  { id: '1', title: '文章 1', summary: '摘要 1' },
  { id: '2', title: '文章 2', summary: '摘要 2' },
  { id: '3', title: '文章 3', summary: '摘要 3' },
]);

const prefetchPost = usePrefetchPost();

/**
 * 处理文章悬停事件
 * 当用户鼠标悬停在文章链接上时，预取文章详情
 */
const handlePostHover = async (postId: string) => {
  await prefetchPost(postId);
  console.log(`预取文章 ${postId} 完成`);
};

// ============================================================================
// 示例 2: 批量预取可见文章
// ============================================================================

const infinitePosts = ref([
  { id: '10', title: '文章 10', summary: '摘要 10' },
  { id: '11', title: '文章 11', summary: '摘要 11' },
  { id: '12', title: '文章 12', summary: '摘要 12' },
  { id: '13', title: '文章 13', summary: '摘要 13' },
  { id: '14', title: '文章 14', summary: '摘要 14' },
]);

const prefetchPostsBatch = usePrefetchPostsBatch();
const postRefs = new Map<string, HTMLElement>();
let observer: IntersectionObserver | null = null;

/**
 * 设置文章元素引用
 */
const setPostRef = (el: any, postId: string) => {
  if (el) {
    postRefs.set(postId, el as HTMLElement);
  }
};

/**
 * 初始化 Intersection Observer
 * 当文章进入视口时，批量预取文章详情
 */
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visiblePostIds = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => (entry.target as HTMLElement).dataset.postId)
        .filter((id): id is string => !!id);

      if (visiblePostIds.length > 0) {
        prefetchPostsBatch(visiblePostIds);
        console.log(`批量预取文章: ${visiblePostIds.join(', ')}`);
      }
    },
    {
      rootMargin: '100px', // 提前 100px 开始预取
      threshold: 0.1,
    }
  );

  // 观察所有文章元素
  postRefs.forEach((el) => {
    observer?.observe(el);
  });
});

onUnmounted(() => {
  observer?.disconnect();
});

// ============================================================================
// 示例 3: 导航前预取
// ============================================================================

const router = useRouter();
const prefetchPosts = usePrefetchPosts();
const prefetchHotPosts = usePrefetchHotPosts();
const prefetchRecommendedPosts = usePrefetchRecommendedPosts();

/**
 * 导航到文章列表页
 * 先预取数据，然后导航
 */
const navigateToPostList = async () => {
  console.log('开始预取文章列表...');
  await prefetchPosts({ page: 1, size: 20 });
  console.log('预取完成，开始导航');
  await router.push('/posts');
};

/**
 * 导航到首页
 * 先预取热门文章和推荐文章，然后导航
 */
const navigateToHome = async () => {
  console.log('开始预取首页数据...');
  await Promise.all([
    prefetchHotPosts(),
    prefetchRecommendedPosts(),
  ]);
  console.log('预取完成，开始导航');
  await router.push('/');
};

// ============================================================================
// 示例 4: 相关内容预取
// ============================================================================

const currentPost = ref({
  id: '100',
  title: '当前文章',
  content: '这是当前文章的内容...',
});

const prefetchComments = usePrefetchComments();
const prefetchRelatedPosts = usePrefetchRelatedPosts();

/**
 * 预取相关内容
 * 包括评论列表和相关文章
 */
const prefetchRelatedContent = async () => {
  const postId = currentPost.value.id;
  
  console.log('开始预取相关内容...');
  await Promise.all([
    prefetchComments(postId, { page: 1, size: 20 }),
    prefetchRelatedPosts(postId, { size: 5 }),
  ]);
  console.log('相关内容预取完成');
};

// 自动预取相关内容
onMounted(async () => {
  await prefetchRelatedContent();
});
</script>

<style scoped>
.prefetch-examples {
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

.post-list,
.infinite-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s;
}

.post-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-item h3 {
  margin: 0 0 8px 0;
  color: #1890ff;
}

.post-item p {
  margin: 0;
  color: #666;
}

.navigation-buttons {
  display: flex;
  gap: 16px;
}

.navigation-buttons button {
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.navigation-buttons button:hover {
  background-color: #40a9ff;
}

.post-detail {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.post-detail h3 {
  margin-top: 0;
}

.post-detail button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.post-detail button:hover {
  background-color: #73d13d;
}
</style>
