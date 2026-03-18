<!--
  首页侧边栏组件
  显示热门标签和热门文章
-->

<template>
  <aside 
    class="home-sidebar" 
    role="complementary" 
    aria-label="侧边栏"
  >
    <!-- 热门标签区域（加载中或加载失败时显示骨架屏） -->
    <section 
      class="home-sidebar__section" 
      aria-labelledby="tags-heading"
    >
      <!-- 骨架屏（加载中或加载失败时显示） -->
      <div
        v-if="isLoading || tagsError"
        class="home-sidebar__skeleton"
      >
        <div class="home-sidebar__skeleton-title" />
        <div class="home-sidebar__tags">
          <div
            v-for="i in 8"
            :key="i"
            class="home-sidebar__skeleton-tag"
          />
        </div>

        <!-- 错误提示叠加层 -->
        <div
          v-if="tagsError"
          class="home-sidebar__error-overlay"
        >
          <div class="home-sidebar__error-card">
            <svg 
              class="home-sidebar__error-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p class="home-sidebar__error-message">
              {{ getErrorMessage(tagsError) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 标签内容 -->
      <div v-else-if="displayTags && displayTags.length > 0">
        <h2 
          id="tags-heading" 
          class="home-sidebar__section-title"
        >
          <svg
            class="home-sidebar__section-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          热门标签
        </h2>

        <!-- 标签列表 -->
        <div class="home-sidebar__tags">
          <button
            v-for="tag in displayTags"
            :key="tag.id"
            class="home-sidebar__tag"
            :aria-label="`标签: ${tag.name}, ${tag.postCount ?? 0} 篇文章`"
            @click="handleTagClick(tag)"
          >
            <span class="home-sidebar__tag-hash">#</span>
            <span class="home-sidebar__tag-name">{{ tag.name }}</span>
            <span class="home-sidebar__tag-count">({{ formatNumber(tag.postCount ?? 0) }})</span>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else
        class="home-sidebar__empty"
      >
        <p class="home-sidebar__empty-text">
          暂无热门标签
        </p>
      </div>
    </section>

    <!-- 热门文章区域（加载中或加载失败时显示骨架屏） -->
    <section 
      class="home-sidebar__section" 
      aria-labelledby="posts-heading"
    >
      <!-- 骨架屏（加载中或加载失败时显示） -->
      <div
        v-if="isLoading || postsError"
        class="home-sidebar__skeleton"
      >
        <div class="home-sidebar__skeleton-title" />
        <div class="home-sidebar__posts">
          <div
            v-for="i in 5"
            :key="i"
            class="home-sidebar__skeleton-post"
          >
            <div class="home-sidebar__skeleton-post-content">
              <div class="home-sidebar__skeleton-rank" />
              <div class="home-sidebar__skeleton-post-info">
                <div class="home-sidebar__skeleton-text" />
                <div class="home-sidebar__skeleton-text home-sidebar__skeleton-text--short" />
                <div class="home-sidebar__skeleton-meta" />
              </div>
            </div>
          </div>
        </div>

        <!-- 错误提示叠加层 -->
        <div
          v-if="postsError"
          class="home-sidebar__error-overlay"
        >
          <div class="home-sidebar__error-card">
            <svg 
              class="home-sidebar__error-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p class="home-sidebar__error-message">
              {{ getErrorMessage(postsError) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 文章内容 -->
      <div v-else-if="displayPosts && displayPosts.length > 0">
        <h2 
          id="posts-heading" 
          class="home-sidebar__section-title"
        >
          <svg
            class="home-sidebar__section-icon home-sidebar__section-icon--red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          热门文章
        </h2>

        <!-- 文章列表 -->
        <div class="home-sidebar__posts">
          <article
            v-for="(post, index) in displayPosts"
            :key="post.id"
            class="home-sidebar__post"
            :aria-label="`第 ${index + 1} 名: ${post.title}`"
            tabindex="0"
            @click="handlePostClick(post)"
            @keydown.enter="handlePostClick(post)"
          >
            <!-- 排名和标题 -->
            <div class="home-sidebar__post-content">
              <!-- 排名徽章 -->
              <div
                class="home-sidebar__rank-badge"
                :class="getRankBadgeClass(index)"
                :aria-label="`排名第 ${index + 1}`"
              >
                {{ index + 1 }}
              </div>

              <!-- 文章信息 -->
              <div class="home-sidebar__post-info">
                <h3 class="home-sidebar__post-title">
                  {{ post.title }}
                </h3>

                <!-- 文章元数据 -->
                <div class="home-sidebar__post-meta">
                  <span class="home-sidebar__post-meta-item">
                    <svg
                      class="home-sidebar__post-meta-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span class="sr-only">浏览量:</span>
                    {{ formatNumber(post.viewCount) }}
                  </span>

                  <span class="home-sidebar__post-meta-item">
                    <svg
                      class="home-sidebar__post-meta-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span class="sr-only">点赞数:</span>
                    {{ formatNumber(post.likeCount) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 分隔线（最后一项不显示） -->
            <div
              v-if="index < displayPosts.length - 1"
              class="home-sidebar__post-divider"
            />
          </article>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else
        class="home-sidebar__empty"
      >
        <p class="home-sidebar__empty-text">
          暂无热门文章
        </p>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Tag, Post } from '@/types';

/**
 * 组件属性定义
 */
interface Props {
  /** 热门标签列表 */
  tags?: Tag[];
  /** 热门文章列表 */
  trendingPosts?: Post[];
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 标签加载错误 */
  tagsError?: Error | null;
  /** 文章加载错误 */
  postsError?: Error | null;
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 点击标签 */
  (e: 'tag-click', tag: Tag): void;
  /** 点击文章 */
  (e: 'post-click', post: Post): void;
}

// 组件属性和事件
const props = withDefaults(defineProps<Props>(), {
  tags: undefined,
  trendingPosts: undefined,
  isLoading: false,
  tagsError: null,
  postsError: null,
});

const emit = defineEmits<Emits>();

/**
 * 性能优化: 限制显示的标签数量
 * 最多显示 15 个热门标签
 */
const displayTags = computed(() => {
  if (!props.tags) return [];
  return props.tags.slice(0, 15);
});

/**
 * 性能优化: 限制显示的文章数量
 * 最多显示 10 篇热门文章
 */
const displayPosts = computed(() => {
  if (!props.trendingPosts) return [];
  return props.trendingPosts.slice(0, 10);
});

/**
 * 获取错误消息
 */
const getErrorMessage = (err: any): string => {
  if (err?.message) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return '加载数据时发生错误';
};

// 路由实例
const router = useRouter();

/**
 * 格式化数字显示
 */
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

/**
 * 获取排名徽章样式类
 */
const getRankBadgeClass = (index: number): string => {
  if (index === 0) {
    return 'home-sidebar__rank-badge--first';
  } else if (index === 1) {
    return 'home-sidebar__rank-badge--second';
  } else if (index === 2) {
    return 'home-sidebar__rank-badge--third';
  }
  return 'home-sidebar__rank-badge--other';
};

/**
 * 处理标签点击
 */
const handleTagClick = (tag: Tag) => {
  emit('tag-click', tag);
  router.push(`/tags/${tag.slug}`);
};

/**
 * 处理文章点击
 */
const handlePostClick = (post: Post) => {
  emit('post-click', post);
  router.push(`/posts/${post.id}`);
};
</script>

<style scoped>
/* ============================================
   侧边栏容器
   ============================================ */
.home-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl, 2rem);
  position: sticky;
  top: var(--space-lg, 1.5rem);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  /* 性能优化: 使用 contain 提示浏览器优化布局 */
  contain: layout;
}

/* 自定义滚动条 */
.home-sidebar::-webkit-scrollbar {
  width: 4px;
}

.home-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.home-sidebar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.home-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* ============================================
   区块样式
   ============================================ */
.home-sidebar__section {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base) ease-in-out;
  overflow: hidden;
  /* 移除边框,使用阴影区分 */
  border: none;
  /* 性能优化: 提示浏览器优化 transform 和 box-shadow */
  will-change: transform, box-shadow;
}

.home-sidebar__section:hover {
  box-shadow: var(--shadow-lg);
  /* 性能优化: 使用 transform 而不是 top/left 进行动画 */
  transform: translateY(-2px);
}

/* ============================================
   区块标题
   ============================================ */
.home-sidebar__section-title {
  display: flex;
  align-items: center;
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.home-sidebar__section-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: var(--space-sm);
  /* 热门标签使用蓝色图标 */
  color: #2563eb;
}

.home-sidebar__section-icon--red {
  /* 热门文章使用红色图标 */
  color: #dc2626;
}

/* ============================================
   标签样式
   ============================================ */
.home-sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm, 0.5rem);
}

.home-sidebar__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  background-color: var(--color-bg-tertiary, #f3f4f6);
  border: 1px solid transparent;
  border-radius: var(--radius-full, 9999px);
  color: var(--color-text-secondary, #6b7280);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: all var(--transition-base, 0.2s) ease-in-out;
  /* 性能优化: 提示浏览器优化 transform */
  will-change: transform;
}

.home-sidebar__tag:hover {
  background-color: var(--color-hover, #e5e7eb);
  border-color: var(--color-cta, #3b82f6);
  color: var(--color-text, #111827);
  /* 性能优化: 使用 transform 而不是 top/left 进行动画 */
  transform: translateY(-1px);
}

.home-sidebar__tag:focus-visible {
  outline: 2px solid var(--color-cta, #3b82f6);
  outline-offset: 2px;
}

.home-sidebar__tag-hash {
  opacity: 0.7;
}

.home-sidebar__tag-count {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-tertiary, #9ca3af);
  background: rgba(255, 255, 255, 0.5);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm, 0.25rem);
  margin-left: var(--space-xs, 0.25rem);
}

/* ============================================
   文章列表样式
   ============================================ */
.home-sidebar__posts {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.home-sidebar__post {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base) ease-in-out;
  /* 性能优化: 提示浏览器优化 transform */
  will-change: transform;
}

.home-sidebar__post:hover {
  background-color: var(--color-hover);
  /* 性能优化: 使用 transform 而不是 margin/left 进行动画 */
  transform: translateX(4px);
}

.home-sidebar__post:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

.home-sidebar__post-content {
  display: flex;
  align-items: start;
  gap: var(--space-sm);
}

.home-sidebar__post-info {
  flex: 1;
  min-width: 0;
}

.home-sidebar__post-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--transition-base) ease-in-out;
}

.home-sidebar__post:hover .home-sidebar__post-title {
  color: var(--color-cta);
}

.home-sidebar__post-meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.home-sidebar__post-meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.home-sidebar__post-meta-icon {
  width: 14px;
  height: 14px;
}

.home-sidebar__post-divider {
  margin-top: var(--space-md, 1rem);
  border-top: 1px solid var(--color-border, #e5e7eb);
}

/* ============================================
   排名徽章样式
   ============================================ */
.home-sidebar__rank-badge {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.home-sidebar__rank-badge--first {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.home-sidebar__rank-badge--second {
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  color: white;
}

.home-sidebar__rank-badge--third {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  color: white;
}

.home-sidebar__rank-badge--other {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

/* ============================================
   空状态样式
   ============================================ */
.home-sidebar__empty {
  padding: var(--space-xl, 2rem) 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
}

.home-sidebar__empty-text {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-secondary, #6b7280);
}

/* ============================================
   骨架屏样式
   ============================================ */
.home-sidebar__skeleton {
  position: relative;
}

.home-sidebar__skeleton-title {
  height: 1.25rem;
  width: 6rem;
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #f0f0f0) 25%,
    var(--skeleton-highlight, #e0e0e0) 50%,
    var(--skeleton-base, #f0f0f0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm, 0.25rem);
  margin-bottom: var(--space-md, 1rem);
}

.home-sidebar__skeleton-tag {
  height: 1.75rem;
  width: 4rem;
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #f0f0f0) 25%,
    var(--skeleton-highlight, #e0e0e0) 50%,
    var(--skeleton-base, #f0f0f0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-full, 9999px);
}

.home-sidebar__skeleton-tag:nth-child(2n) {
  width: 5rem;
}

.home-sidebar__skeleton-tag:nth-child(3n) {
  width: 3.5rem;
}

.home-sidebar__skeleton-post {
  padding: 0.75rem 0;
}

.home-sidebar__skeleton-post-content {
  display: flex;
  align-items: start;
  gap: var(--space-sm, 0.5rem);
}

.home-sidebar__skeleton-rank {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #f0f0f0) 25%,
    var(--skeleton-highlight, #e0e0e0) 50%,
    var(--skeleton-base, #f0f0f0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-full, 9999px);
}

.home-sidebar__skeleton-post-info {
  flex: 1;
}

.home-sidebar__skeleton-text {
  height: 0.875rem;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #f0f0f0) 25%,
    var(--skeleton-highlight, #e0e0e0) 50%,
    var(--skeleton-base, #f0f0f0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm, 0.25rem);
  margin-bottom: 0.5rem;
}

.home-sidebar__skeleton-text--short {
  width: 60%;
}

.home-sidebar__skeleton-meta {
  height: 0.75rem;
  width: 8rem;
  margin-top: var(--space-sm, 0.5rem);
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #f0f0f0) 25%,
    var(--skeleton-highlight, #e0e0e0) 50%,
    var(--skeleton-base, #f0f0f0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm, 0.25rem);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ============================================
   错误叠加层样式
   ============================================ */
.home-sidebar__error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px); /* Safari 支持 */
  z-index: 10;
  animation: fadeIn 0.3s ease-in-out;
  border-radius: var(--radius-lg, 0.75rem);
}

.home-sidebar__error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg, 1.5rem);
  text-align: center;
}

.home-sidebar__error-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #ef4444;
  margin-bottom: var(--space-sm, 0.5rem);
}

.home-sidebar__error-message {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-secondary, #374151);
  line-height: 1.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ============================================
   辅助类
   ============================================ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ============================================
   响应式设计
   ============================================ */
@media (max-width: 1024px) {
  .home-sidebar {
    position: static;
    max-height: none;
  }

  .home-sidebar__section {
    padding: var(--space-md, 1rem);
  }
}

@media (max-width: 768px) {
  .home-sidebar__section-title {
    font-size: var(--font-size-base, 1rem);
  }

  .home-sidebar__post-title {
    font-size: var(--font-size-xs, 0.75rem);
  }

  .home-sidebar__post-meta {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .home-sidebar__section {
    padding: var(--space-sm, 0.5rem);
  }

  .home-sidebar__tag {
    font-size: var(--font-size-xs, 0.75rem);
    padding: 0.125rem var(--space-xs, 0.25rem);
  }
}

/* ============================================
   暗色模式
   ============================================ */
@media (prefers-color-scheme: dark) {
  .home-sidebar__section {
    background-color: var(--color-bg-secondary-dark, #1f2937);
    box-shadow: var(--shadow-md-dark, 0 4px 6px -1px rgba(0, 0, 0, 0.3));
  }

  .home-sidebar__section:hover {
    box-shadow: var(--shadow-lg-dark, 0 10px 15px -3px rgba(0, 0, 0, 0.4));
  }

  .home-sidebar__section-title {
    color: var(--color-text-dark, #f9fafb);
  }

  .home-sidebar__section-icon {
    color: #60a5fa;
  }

  .home-sidebar__section-icon--red {
    color: #f87171;
  }

  .home-sidebar__tag {
    background-color: var(--color-bg-tertiary-dark, #374151);
    color: var(--color-text-secondary-dark, #9ca3af);
  }

  .home-sidebar__tag:hover {
    background-color: var(--color-hover-dark, #4b5563);
    color: var(--color-text-dark, #f9fafb);
  }

  .home-sidebar__tag-count {
    background: rgba(0, 0, 0, 0.3);
    color: var(--color-text-tertiary-dark, #6b7280);
  }

  .home-sidebar__post-title {
    color: var(--color-text-dark, #f9fafb);
  }

  .home-sidebar__post:hover .home-sidebar__post-title {
    color: var(--color-cta-dark, #60a5fa);
  }

  .home-sidebar__post-meta {
    color: var(--color-text-secondary-dark, #9ca3af);
  }

  .home-sidebar__post-divider {
    border-color: var(--color-border-dark, #374151);
  }

  .home-sidebar__rank-badge--other {
    background-color: var(--color-bg-tertiary-dark, #374151);
    color: var(--color-text-secondary-dark, #9ca3af);
  }

  .home-sidebar__empty-text {
    color: var(--color-text-secondary-dark, #9ca3af);
  }

  /* 暗色模式骨架屏颜色 */
  .home-sidebar__skeleton-title,
  .home-sidebar__skeleton-tag,
  .home-sidebar__skeleton-rank,
  .home-sidebar__skeleton-text,
  .home-sidebar__skeleton-meta {
    background: linear-gradient(
      90deg,
      var(--skeleton-base-dark, #374151) 25%,
      var(--skeleton-highlight-dark, #4b5563) 50%,
      var(--skeleton-base-dark, #374151) 75%
    );
    background-size: 200% 100%;
  }

  .home-sidebar__error-overlay {
    background: rgba(31, 41, 55, 0.95);
  }

  .home-sidebar__error-message {
    color: var(--color-text-secondary-dark, #d1d5db);
  }
}

/* ============================================
   减少动画（用户偏好）
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  .home-sidebar__section,
  .home-sidebar__tag,
  .home-sidebar__post,
  .home-sidebar__post-title {
    transition: none;
  }

  .home-sidebar__section:hover,
  .home-sidebar__tag:hover,
  .home-sidebar__post:hover {
    transform: none;
  }

  .home-sidebar__skeleton-title,
  .home-sidebar__skeleton-tag,
  .home-sidebar__skeleton-rank,
  .home-sidebar__skeleton-text,
  .home-sidebar__skeleton-meta {
    animation: none;
  }

  .home-sidebar__error-overlay {
    animation: none;
  }
}
</style>
