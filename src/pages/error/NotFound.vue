<template>
  <div class="error-container">
    <div class="error-content">
      <!-- 404 数字 -->
      <h1 class="error-number">
        404
      </h1>

      <!-- 错误消息 -->
      <h2 class="error-title">
        哎呀！页面未找到
      </h2>
      <p class="error-description">
        您访问的页面不存在，可能已被移动或删除。
      </p>

      <!-- 搜索框 -->
      <div class="error-search">
        <label class="error-search-label">搜索内容</label>
        <div class="error-search-wrapper">
          <svg
            class="error-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="error-search-input"
            placeholder="搜索文章、话题或作者..."
            @keyup.enter="handleSearch"
          >
          <button
            class="error-search-button"
            @click="handleSearch"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <router-link
          to="/"
          class="error-action-primary"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          返回首页
        </router-link>
        <router-link
          to="/tags"
          class="error-action-secondary"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          浏览标签
        </router-link>
      </div>

      <!-- 有用的链接 -->
      <div class="error-links">
        <h3 class="error-links-title">
          快速导航
        </h3>
        <div class="error-links-grid">
          <router-link
            to="/"
            class="error-link-card"
          >
            <svg
              class="error-link-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <div class="error-link-title">
              首页
            </div>
            <div class="error-link-description">
              返回首页
            </div>
          </router-link>

          <router-link
            to="/tags"
            class="error-link-card"
          >
            <svg
              class="error-link-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <div class="error-link-title">
              标签
            </div>
            <div class="error-link-description">
              浏览所有标签
            </div>
          </router-link>

          <router-link
            to="/ranking"
            class="error-link-card"
          >
            <svg
              class="error-link-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <div class="error-link-title">
              排行榜
            </div>
            <div class="error-link-description">
              热门内容
            </div>
          </router-link>

          <router-link
            v-if="isAuthenticated"
            to="/settings"
            class="error-link-card"
          >
            <svg
              class="error-link-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div class="error-link-title">
              个人中心
            </div>
            <div class="error-link-description">
              我的资料
            </div>
          </router-link>
        </div>
      </div>

      <!-- 热门文章 -->
      <div
        v-if="popularPosts.length > 0"
        class="error-popular"
      >
        <h3 class="error-popular-title">
          热门文章
        </h3>
        <div class="error-popular-grid">
          <router-link
            v-for="post in popularPosts"
            :key="post.id"
            :to="`/posts/${post.id}`"
            class="error-popular-card"
          >
            <img
              v-if="post.coverImage"
              :src="post.coverImage"
              :alt="post.title"
              class="error-popular-image"
            >
            <div
              v-else
              class="error-popular-image"
            />
            <div class="error-popular-content">
              <span class="error-popular-category">推荐</span>
              <h4 class="error-popular-post-title">
                {{ post.title }}
              </h4>
              <div class="error-popular-meta">
                <div class="error-popular-author">
                  <div class="error-popular-avatar" />
                  <span>{{ post.author.nickname }}</span>
                </div>
                <span>·</span>
                <span>{{ formatDate(post.publishedAt) }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { postApi } from '@/api/post';
import type { Post } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const router = useRouter();
const authStore = useAuthStore();

// 搜索查询
const searchQuery = ref('');

// 热门文章
const popularPosts = ref<Post[]>([]);

// 是否已认证
const isAuthenticated = computed(() => authStore.isAuthenticated);

/**
 * 处理搜索
 */
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() },
    });
  }
};

/**
 * 格式化日期
 */
const formatDate = (date?: string) => {
  if (!date) {
    return '刚刚';
  }
  return dayjs(date).fromNow();
};

/**
 * 加载热门文章
 */
const loadPopularPosts = async () => {
  try {
    const response = await postApi.getPosts({
      page: 1,
      size: 3,
      sort: 'hot',
    });
    popularPosts.value = response.items;
  } catch (error) {
    console.error('Failed to load popular posts:', error);
  }
};

onMounted(() => {
  loadPopularPosts();
});
</script>

<style scoped>
/* 容器 */
.error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-xl);
  background: var(--color-background);
  text-align: center;
}

.error-content {
  max-width: 800px;
  width: 100%;
}

/* 404 数字 */
.error-number {
  font-family: var(--font-heading);
  font-size: 80px;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-md);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 错误消息 */
.error-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.error-description {
  font-size: 16px;
  color: #71717a;
  line-height: 1.6;
  margin-bottom: var(--space-2xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 搜索框 */
.error-search {
  max-width: 600px;
  margin: 0 auto var(--space-2xl);
}

.error-search-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
  display: block;
}

.error-search-wrapper {
  position: relative;
  display: flex;
  gap: var(--space-sm);
}

.error-search-input {
  flex: 1;
  padding: 12px 16px;
  padding-left: 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 200ms ease;
  background: white;
}

.error-search-input:focus {
  border-color: var(--color-cta);
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.error-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}

.error-search-button {
  padding: 12px 24px;
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;
}

.error-search-button:hover {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 操作按钮 */
.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-3xl);
  flex-wrap: wrap;
}

.error-action-primary {
  padding: 14px 32px;
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.error-action-primary:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.error-action-secondary {
  padding: 14px 32px;
  background: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-text);
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.error-action-secondary:hover {
  background: var(--color-text);
  color: white;
  transform: translateY(-2px);
}

/* 有用的链接 */
.error-links {
  margin-bottom: var(--space-3xl);
}

.error-links-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
}

.error-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  max-width: 800px;
  margin: 0 auto;
}

.error-link-card {
  background: white;
  padding: var(--space-lg);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  transition: all 200ms ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-link-card:hover {
  border-color: var(--color-cta);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.error-link-icon {
  width: 40px;
  height: 40px;
  color: var(--color-cta);
  margin-bottom: var(--space-sm);
}

.error-link-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.error-link-description {
  font-size: 14px;
  color: #71717a;
}

/* 热门文章 */
.error-popular {
  max-width: 800px;
  margin: 0 auto;
}

.error-popular-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
  text-align: center;
}

.error-popular-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.error-popular-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: all 200ms ease;
  cursor: pointer;
  text-decoration: none;
  display: block;
}

.error-popular-card:hover {
  border-color: var(--color-cta);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.error-popular-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.error-popular-content {
  padding: var(--space-lg);
}

.error-popular-category {
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: var(--space-sm);
}

.error-popular-post-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
  line-height: 1.4;
}

.error-popular-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
  color: #71717a;
}

.error-popular-author {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.error-popular-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
}

/* 响应式 */
@media (max-width: 768px) {
  .error-number {
    font-size: 60px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 14px;
  }

  .error-search-wrapper {
    flex-direction: column;
  }

  .error-search-button {
    width: 100%;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-action-primary,
  .error-action-secondary {
    width: 100%;
    justify-content: center;
  }

  .error-links-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .error-popular-grid {
    grid-template-columns: 1fr;
  }
}
</style>
