<!--
  文章详情页面
  遵循 Design System: Motion-Driven, 平滑滚动, 视差效果
  布局: 12列网格, 高信息密度, 连续色彩过渡
-->

<template>
  <div class="post-detail-page">
    <!-- 文章头部 Hero -->
    <section class="post-hero">
      <div class="hero-content">
        <div class="breadcrumb">
          <router-link
            to="/"
            class="breadcrumb-link"
          >
            首页
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">文章详情</span>
        </div>
        
        <h1 class="post-title">
          {{ post?.title || '加载中...' }}
        </h1>
        
        <div
          v-if="post"
          class="post-meta"
        >
          <div class="author-info">
            <img 
              :src="post.author.avatar || defaultAvatar" 
              :alt="post.author.nickname"
              class="author-avatar"
              @error="handleAvatarError"
            >
            <div class="author-details">
              <span class="author-name">{{ post.author.nickname }}</span>
              <span class="post-date">{{ formatDate(post.publishedAt || post.createdAt) }}</span>
            </div>
          </div>
          
          <div class="post-stats">
            <span class="stat-item">
              <svg
                class="stat-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              {{ formatNumber(post.viewCount) }}
            </span>
            <span class="stat-item">
              <svg
                class="stat-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {{ formatNumber(post.likeCount) }}
            </span>
            <span class="stat-item">
              <svg
                class="stat-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {{ formatNumber(post.commentCount) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 文章内容 -->
    <article class="post-content-wrapper">
      <div class="post-container">
        <!-- 加载状态 -->
        <div
          v-if="isLoading"
          class="loading-state"
        >
          <LoadingSpinner
            size="large"
            :show-text="true"
            text="加载文章中..."
          />
        </div>

        <!-- 错误状态 -->
        <div
          v-else-if="error"
          class="error-state"
        >
          <div class="error-card">
            <svg
              class="error-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 class="error-title">
              加载失败
            </h3>
            <p class="error-message">
              {{ getErrorMessage(error) }}
            </p>
            <button
              class="btn-primary"
              @click="() => refetch()"
            >
              重试
            </button>
          </div>
        </div>

        <!-- 文章内容 -->
        <div
          v-else-if="post"
          class="post-content"
        >
          <!-- 封面图 -->
          <div
            v-if="post.coverImage"
            class="cover-image-wrapper"
          >
            <img 
              :src="post.coverImage" 
              :alt="post.title"
              class="cover-image"
              @error="handleImageError"
            >
          </div>

          <!-- 文章正文 -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            class="article-body"
            v-html="sanitizedHtml"
          />

          <!-- 标签 -->
          <div
            v-if="post.tags && post.tags.length > 0"
            class="tags-section"
          >
            <h3 class="tags-title">
              标签
            </h3>
            <div class="tags-list">
              <router-link
                v-for="tag in post.tags"
                :key="tag.id"
                :to="`/tags/${tag.slug}`"
                class="tag-item"
              >
                #{{ tag.name }}
              </router-link>
            </div>
          </div>

          <!-- 互动按钮 -->
          <div class="action-buttons">
            <button 
              class="action-btn"
              :class="{ 'action-btn-active': post.isLiked }"
              @click="handleLike"
            >
              <svg
                class="action-icon"
                :fill="post.isLiked ? 'currentColor' : 'none'"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{{ post.isLiked ? '已点赞' : '点赞' }}</span>
              <span class="action-count">{{ formatNumber(post.likeCount) }}</span>
            </button>

            <button 
              class="action-btn"
              :class="{ 'action-btn-active': post.isFavorited }"
              @click="handleFavorite"
            >
              <svg
                class="action-icon"
                :fill="post.isFavorited ? 'currentColor' : 'none'"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span>{{ post.isFavorited ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
        </div>
      </div>
    </article>

    <section
      v-if="post && !isLoading && !error"
      ref="commentsSectionRef"
      class="comments-section"
    >
      <div class="comments-section__inner">
        <div class="comments-section__header">
          <h2 class="comments-section__title">
            评论
          </h2>
          <span class="comments-section__count">
            {{ formatNumber(commentCount) }}
          </span>
        </div>
        <CommentList
          :post-id="post.id"
          @comment-count-change="handleCommentCountChange"
        />
      </div>
    </section>

    <!-- 浮动 CTA -->
    <div
      v-if="post && !isLoading"
      class="floating-cta"
    >
      <button
        class="cta-btn"
        @click="scrollToComments"
      >
        <svg
          class="cta-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        评论
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import DOMPurify from 'dompurify';
import { useRoute } from 'vue-router';
import { usePostQuery } from '@/queries/posts/usePostQuery';
import { postApi } from '@/api/post';
import CommentList from '@/components/comment/CommentList.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Post } from '@/types';

interface Props {
  id: string;
}

const props = defineProps<Props>();
const route = useRoute();
const postId = props.id || route.params.id as string;

// 默认头像
const defaultAvatar = '/images/default-avatar.png';

// 获取文章数据
const {
  data: postData,
  isLoading,
  error,
  refetch,
} = usePostQuery(postId);

const postOverrides = ref<Partial<Post>>({});
const commentsSectionRef = ref<HTMLElement | null>(null);
const loadedCommentCount = ref<number | null>(null);

const post = computed<Post | undefined>(() => {
  if (!postData.value) {
    return undefined;
  }

  return {
    ...postData.value,
    ...postOverrides.value,
  };
});

const sanitizedHtml = computed(() => {
  const html = post.value?.htmlContent || post.value?.content || '';
  return DOMPurify.sanitize(html);
});

const commentCount = computed(() => loadedCommentCount.value ?? post.value?.commentCount ?? 0);

// 加载状态
const likeLoading = ref(false);
const favoriteLoading = ref(false);

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
 * 格式化日期显示
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 获取错误消息
 */
const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return '加载文章时发生错误，请稍后重试';
};

/**
 * 处理点赞
 */
const handleLike = async () => {
  if (!post.value || likeLoading.value) return;
  
  likeLoading.value = true;
  try {
    const nextIsLiked = !post.value.isLiked;

    if (post.value.isLiked) {
      await postApi.unlikePost(post.value.id);
    } else {
      await postApi.likePost(post.value.id);
    }

    postOverrides.value = {
      ...postOverrides.value,
      isLiked: nextIsLiked,
      likeCount: Math.max(0, post.value.likeCount + (nextIsLiked ? 1 : -1)),
    };
  } catch (error) {
    console.error('点赞操作失败:', error);
  } finally {
    likeLoading.value = false;
  }
};

/**
 * 处理收藏
 */
const handleFavorite = async () => {
  if (!post.value || favoriteLoading.value) return;
  
  favoriteLoading.value = true;
  try {
    const nextIsFavorited = !post.value.isFavorited;

    if (post.value.isFavorited) {
      await postApi.unfavoritePost(post.value.id);
    } else {
      await postApi.favoritePost(post.value.id);
    }

    postOverrides.value = {
      ...postOverrides.value,
      isFavorited: nextIsFavorited,
      favoriteCount: Math.max(0, post.value.favoriteCount + (nextIsFavorited ? 1 : -1)),
    };
  } catch (error) {
    console.error('收藏操作失败:', error);
  } finally {
    favoriteLoading.value = false;
  }
};

/**
 * 滚动到评论区
 */
const scrollToComments = () => {
  commentsSectionRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const handleCommentCountChange = (count: number) => {
  loadedCommentCount.value = count;
  postOverrides.value = {
    ...postOverrides.value,
    commentCount: count,
  };
};

/**
 * 处理图片加载错误
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/images/default-post-cover.png';
};

/**
 * 处理头像加载错误
 */
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar;
};
</script>

<style scoped>
/* 页面容器 */
.post-detail-page {
  min-height: 100vh;
  background: var(--color-background);
}

/* Hero 区域 */
.post-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: var(--space-3xl) var(--space-lg) var(--space-2xl);
  position: relative;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: white;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.5);
}

.breadcrumb-current {
  color: white;
}

/* 文章标题 */
.post-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: white;
  margin-bottom: var(--space-xl);
  line-height: 1.2;
}

/* 文章元信息 */
.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.author-name {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.post-date {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.post-stats {
  display: flex;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.stat-icon {
  width: 20px;
  height: 20px;
}

/* 内容包装器 */
.post-content-wrapper {
  background: white;
  margin-top: calc(var(--space-2xl) * -1);
  border-radius: 24px 24px 0 0;
  position: relative;
  z-index: 2;
  box-shadow: var(--shadow-xl);
}

.post-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-lg);
}

.comments-section {
  padding: 0 var(--space-lg) var(--space-3xl);
}

.comments-section__inner {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 0 0 24px 24px;
  box-shadow: var(--shadow-xl);
  padding: 0 var(--space-lg) var(--space-2xl);
}

.comments-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-xl) 0 var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.comments-section__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.comments-section__count {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

/* 加载和错误状态 */
.loading-state,
.error-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-card {
  text-align: center;
  padding: var(--space-2xl);
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--color-error);
  margin: 0 auto var(--space-lg);
}

.error-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.error-message {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  line-height: 1.6;
}

/* 文章内容 */
.post-content {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cover-image-wrapper {
  margin-bottom: var(--space-2xl);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.cover-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.4s;
}

.cover-image:hover {
  transform: scale(1.02);
}

.article-body {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--space-2xl);
}

.article-body :deep(h2) {
  font-size: 2rem;
  font-weight: 600;
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-lg);
  color: var(--color-primary);
}

.article-body :deep(h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: var(--space-xl);
  margin-bottom: var(--space-md);
  color: var(--color-primary);
}

.article-body :deep(p) {
  margin-bottom: var(--space-lg);
}

.article-body :deep(a) {
  color: var(--color-cta);
  text-decoration: underline;
  transition: opacity 0.2s;
}

.article-body :deep(a:hover) {
  opacity: 0.8;
}

.article-body :deep(code) {
  background: #F3F4F6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}

.article-body :deep(pre) {
  background: #1F2937;
  color: #F9FAFB;
  padding: var(--space-lg);
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: var(--space-lg);
}

/* 标签区域 */
.tags-section {
  margin-bottom: var(--space-2xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.tags-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tag-item {
  display: inline-block;
  padding: var(--space-sm) var(--space-md);
  background: #EFF6FF;
  color: var(--color-cta);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.tag-item:hover {
  background: var(--color-cta);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: var(--space-md);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 12px 24px;
  background: white;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn-active {
  background: var(--color-cta);
  border-color: var(--color-cta);
  color: white;
}

.action-btn-active:hover {
  opacity: 0.9;
}

.action-icon {
  width: 20px;
  height: 20px;
}

.action-count {
  margin-left: var(--space-xs);
  font-size: 0.875rem;
}

/* 浮动 CTA */
.floating-cta {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  z-index: 100;
}

.cta-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 16px 24px;
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.cta-icon {
  width: 20px;
  height: 20px;
}

/* 按钮 */
.btn-primary {
  background: var(--color-cta);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .post-container {
    padding: var(--space-2xl) var(--space-lg);
  }

  .comments-section__inner {
    padding: 0 var(--space-lg) var(--space-xl);
  }
}

@media (max-width: 768px) {
  .post-hero {
    padding: var(--space-2xl) var(--space-md) var(--space-xl);
  }
  
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .post-container {
    padding: var(--space-xl) var(--space-md);
  }

  .comments-section {
    padding: 0 var(--space-md) var(--space-2xl);
  }

  .comments-section__inner {
    padding: 0 var(--space-md) var(--space-xl);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .floating-cta {
    bottom: var(--space-lg);
    right: var(--space-lg);
  }
}

@media (max-width: 375px) {
  .post-title {
    font-size: 1.75rem;
  }
  
  .article-body {
    font-size: 1rem;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 焦点状态 */
.breadcrumb-link:focus-visible,
.tag-item:focus-visible,
.action-btn:focus-visible,
.cta-btn:focus-visible,
.btn-primary:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}
</style>
