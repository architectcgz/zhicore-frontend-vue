<!--
  文章卡片组件
  显示文章的基本信息，包括封面图、标题、摘要、作者信息、标签等
-->

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { postApi } from '@/api/post';
import type { Post, Tag } from '@/types';

interface Props {
  post: Post;
  maxDisplayTags?: number;
  showCover?: boolean;
  showPlaceholderTitle?: boolean;
  showExcerpt?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'card' | 'plain';
}

interface Emits {
  (e: 'click', post: Post): void;
  (e: 'author-click', author: Post['author']): void;
  (e: 'tag-click', tag: Tag): void;
  (e: 'category-click', category: Post['category']): void;
  (e: 'like-change', data: { postId: string; isLiked: boolean; likeCount: number }): void;
  (e: 'favorite-change', data: { postId: string; isFavorited: boolean; favoriteCount: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplayTags: 3,
  showCover: true,
  showPlaceholderTitle: true,
  showExcerpt: true,
  showStats: true,
  showActions: true,
  size: 'medium',
  variant: 'card',
});

const emit = defineEmits<Emits>();
const router = useRouter();

const likeLoading = ref(false);
const favoriteLoading = ref(false);
const isActionClick = ref(false);

const defaultAvatar = '/images/default-avatar.svg';

const displayTags = computed(() => props.post.tags?.slice(0, props.maxDisplayTags) ?? []);

const estimatedReadTime = computed(() => {
  const charsPerMinute = 400;
  const rawText = props.post.content || props.post.excerpt || '';
  const charCount = rawText.replace(/\s+/g, '').length;
  const minutes = Math.ceil(charCount / charsPerMinute);
  return Math.max(1, minutes);
});

const displayExcerpt = computed(() => {
  if (props.post.excerpt?.trim()) {
    return props.post.excerpt;
  }

  return props.post.content.slice(0, 140);
});

const cardClass = computed(() => [
  'post-card',
  `post-card--${props.size}`,
  `post-card--${props.variant}`,
  {
    'post-card--with-cover': props.showCover,
    'post-card--loading': likeLoading.value || favoriteLoading.value,
  },
]);

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }

  return num.toString();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`;
    }

    return `${diffHours}小时前`;
  }

  if (diffDays === 1) {
    return '昨天';
  }

  if (diffDays < 7) {
    return `${diffDays}天前`;
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
  };

  return statusMap[status] || status;
};

const handleCardClick = () => {
  if (!isActionClick.value) {
    emit('click', props.post);
    router.push(`/posts/${props.post.id}`);
  }

  isActionClick.value = false;
};

const handleAuthorClick = () => {
  if (!props.post.author) {
    return;
  }

  isActionClick.value = true;
  emit('author-click', props.post.author);
  router.push(`/users/${props.post.author.id}`);
};

const handleTagClick = (tag: Tag) => {
  isActionClick.value = true;
  emit('tag-click', tag);
  router.push(`/tags/${tag.slug}`);
};

const handleCategoryClick = () => {
  if (!props.post.category) {
    return;
  }

  isActionClick.value = true;
  emit('category-click', props.post.category);
  router.push({
    path: `/categories/${props.post.category.id || props.post.category.slug}`,
    query: { name: props.post.category.name, id: props.post.category.id },
  });
};

const handleLike = async () => {
  if (likeLoading.value) {
    return;
  }

  isActionClick.value = true;
  likeLoading.value = true;

  try {
    const nextIsLiked = !props.post.isLiked;

    if (props.post.isLiked) {
      await postApi.unlikePost(props.post.id);
    } else {
      await postApi.likePost(props.post.id);
    }

    emit('like-change', {
      postId: props.post.id,
      isLiked: nextIsLiked,
      likeCount: Math.max(0, props.post.likeCount + (nextIsLiked ? 1 : -1)),
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
  } finally {
    likeLoading.value = false;
  }
};

const handleFavorite = async () => {
  if (favoriteLoading.value) {
    return;
  }

  isActionClick.value = true;
  favoriteLoading.value = true;

  try {
    const nextIsFavorited = !props.post.isFavorited;

    if (props.post.isFavorited) {
      await postApi.unfavoritePost(props.post.id);
    } else {
      await postApi.favoritePost(props.post.id);
    }

    emit('favorite-change', {
      postId: props.post.id,
      isFavorited: nextIsFavorited,
      favoriteCount: Math.max(0, props.post.favoriteCount + (nextIsFavorited ? 1 : -1)),
    });
  } catch (error) {
    console.error('收藏操作失败:', error);
  } finally {
    favoriteLoading.value = false;
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.onerror = null;
  img.src = '/images/default-post-cover.svg';
};

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.onerror = null;
  img.src = defaultAvatar;
};
</script>

<template>
  <article
    :class="cardClass"
    tabindex="0"
    @click="handleCardClick"
    @keydown.enter.prevent="handleCardClick"
    @keydown.space.prevent="handleCardClick"
  >
    <div
      v-if="props.showCover"
      class="post-card__media"
    >
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="post-card__image"
        loading="lazy"
        @error="handleImageError"
      >
      <div
        v-else
        class="post-card__image post-card__image--placeholder"
      >
        <span class="post-card__placeholder-kicker">推荐阅读</span>
        <strong
          v-if="props.showPlaceholderTitle"
          class="post-card__placeholder-title"
        >{{ post.title }}</strong>
      </div>

      <div class="post-card__media-overlay">
        <span
          v-if="post.status !== 'PUBLISHED'"
          class="post-card__status"
        >
          {{ getStatusText(post.status) }}
        </span>
        <span class="post-card__read-chip">{{ estimatedReadTime }} 分钟阅读</span>
      </div>
    </div>

    <div class="post-card__body">
      <div class="post-card__eyebrow">
        <button
          v-if="post.category"
          class="post-card__category"
          type="button"
          @click.stop="handleCategoryClick"
        >
          {{ post.category.name }}
        </button>
        <span class="post-card__date">{{ formatDate(post.publishedAt || post.createdAt) }}</span>
      </div>

      <h3 class="post-card__title">
        {{ post.title }}
      </h3>

      <p
        v-if="props.showExcerpt"
        class="post-card__excerpt"
      >
        {{ displayExcerpt }}
      </p>

      <div
        v-if="displayTags.length > 0"
        class="post-card__tags"
      >
        <button
          v-for="tag in displayTags"
          :key="tag.id"
          class="post-card__tag"
          type="button"
          @click.stop="handleTagClick(tag)"
        >
          #{{ tag.name }}
        </button>
        <span
          v-if="post.tags.length > maxDisplayTags"
          class="post-card__tag post-card__tag--muted"
        >
          +{{ post.tags.length - maxDisplayTags }}
        </span>
      </div>

      <div class="post-card__footer">
        <div class="post-card__author-group">
          <button
            v-if="post.author"
            class="post-card__author-avatar"
            type="button"
            @click.stop="handleAuthorClick"
          >
            <img
              :src="post.author?.avatar || defaultAvatar"
              :alt="post.author?.nickname || '匿名用户'"
              class="post-card__author-avatar-image"
              @error="handleAvatarError"
            >
          </button>

          <div class="post-card__author-copy">
            <button
              v-if="post.author"
              class="post-card__author-name"
              type="button"
              @click.stop="handleAuthorClick"
            >
              {{ post.author.nickname || '匿名用户' }}
            </button>
            <span
              v-else
              class="post-card__author-name post-card__author-name--muted"
            >
              匿名用户
            </span>
            <span class="post-card__author-meta">
              {{ estimatedReadTime }} 分钟 · 精选内容
            </span>
          </div>
        </div>

        <div
          v-if="props.showStats"
          class="post-card__stats"
        >
          <span class="post-card__stat">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M2.75 12S6.15 6.75 12 6.75 21.25 12 21.25 12 17.85 17.25 12 17.25 2.75 12 2.75 12Z" />
              <circle
                cx="12"
                cy="12"
                r="2.5"
              />
            </svg>
            {{ formatNumber(post.viewCount) }}
          </span>
          <span class="post-card__stat">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4.75 6.75h14.5A1.75 1.75 0 0 1 21 8.5v7a1.75 1.75 0 0 1-1.75 1.75H9.5L4 21v-3.75H4.75A1.75 1.75 0 0 1 3 15.5v-7a1.75 1.75 0 0 1 1.75-1.75Z" />
            </svg>
            {{ formatNumber(post.commentCount) }}
          </span>
        </div>
      </div>

      <div
        v-if="props.showActions"
        class="post-card__actions"
      >
        <button
          class="post-card__action-button"
          :class="{ 'post-card__action-button--active': post.isLiked }"
          type="button"
          :disabled="likeLoading"
          @click.stop="handleLike"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m12 20.25-1.1-1C5.15 14.08 2.75 11.46 2.75 8.25A4.5 4.5 0 0 1 7.25 3.75c1.74 0 3.41.81 4.5 2.1 1.09-1.29 2.76-2.1 4.5-2.1a4.5 4.5 0 0 1 4.5 4.5c0 3.21-2.4 5.83-8.15 11l-1.1 1Z" />
          </svg>
          <span>{{ formatNumber(post.likeCount) }}</span>
        </button>

        <button
          class="post-card__action-button"
          :class="{ 'post-card__action-button--active': post.isFavorited }"
          type="button"
          :disabled="favoriteLoading"
          @click.stop="handleFavorite"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6.75 3.75h10.5A1.75 1.75 0 0 1 19 5.5v14.75L12 16.5l-7 3.75V5.5a1.75 1.75 0 0 1 1.75-1.75Z" />
          </svg>
          <span>{{ formatNumber(post.favoriteCount) }}</span>
        </button>

        <span class="post-card__read-more">
          阅读全文
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6.75 12h10.5M13.5 7.75 17.75 12l-4.25 4.25" />
          </svg>
        </span>
      </div>
    </div>

    <div
      v-if="likeLoading || favoriteLoading"
      class="post-card__loading"
    >
      <div class="post-card__loading-spinner" />
    </div>
  </article>
</template>

<style scoped>
.post-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  background: var(--gradient-card);
  box-shadow: var(--shadow-md);
  transition:
    transform var(--transition-slow),
    box-shadow var(--transition-slow),
    border-color var(--transition-base);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-border-dark);
}

.post-card__media {
  position: relative;
  min-height: 220px;
  background: linear-gradient(135deg, rgba(18, 49, 76, 0.95), rgba(15, 118, 98, 0.85));
}

.post-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-card__image--placeholder {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  padding: var(--space-xl);
  color: var(--color-text-inverse);
  background:
    radial-gradient(circle at top right, rgba(244, 223, 191, 0.4), transparent 26%),
    linear-gradient(135deg, rgba(18, 49, 76, 0.98), rgba(15, 118, 98, 0.88));
}

.post-card__placeholder-kicker {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}

.post-card__placeholder-title {
  max-width: 24ch;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  line-height: 1.35;
}

.post-card__media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-lg);
  pointer-events: none;
}

.post-card__status,
.post-card__read-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  background: rgba(8, 19, 31, 0.42);
  color: var(--color-text-inverse);
  backdrop-filter: blur(10px);
  font-size: 0.78rem;
}

.post-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-xl);
}

.post-card__eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.post-card__category {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-text);
  font-size: 0.78rem;
  font-weight: var(--font-weight-semibold);
}

.post-card__date {
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.post-card__title {
  color: var(--color-text);
  font-size: 1.45rem;
  line-height: 1.35;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-card__excerpt {
  color: var(--color-text-secondary);
  line-height: 1.75;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-card__tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  transition:
    border-color var(--transition-base),
    color var(--transition-base),
    transform var(--transition-base);
}

.post-card__tag:hover {
  transform: translateY(-1px);
  color: var(--color-text);
  border-color: var(--color-border-dark);
}

.post-card__tag--muted {
  background: transparent;
}

.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.post-card__author-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.post-card__author-avatar {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.post-card__author-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-card__author-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.post-card__author-name {
  border: none;
  background: transparent;
  padding: 0;
  color: var(--color-text);
  font-size: 0.92rem;
  font-weight: var(--font-weight-semibold);
  text-align: left;
}

.post-card__author-name--muted {
  color: var(--color-text-secondary);
}

.post-card__author-meta {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.post-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.post-card__stat,
.post-card__action-button,
.post-card__read-more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.post-card__stat {
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.post-card__stat svg,
.post-card__action-button svg,
.post-card__read-more svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.post-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.post-card__action-button {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base);
}

.post-card__action-button:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-dark);
}

.post-card__action-button--active {
  background: var(--color-hover);
  color: var(--color-cta);
  border-color: rgba(15, 118, 98, 0.22);
}

.post-card__read-more {
  margin-left: auto;
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

.post-card__loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(255, 252, 247, 0.56);
  backdrop-filter: blur(4px);
}

[data-theme='dark'] .post-card__loading {
  background: rgba(8, 19, 31, 0.56);
}

.post-card__loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(15, 118, 98, 0.2);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: post-card-spin 0.75s linear infinite;
}

.post-card--large {
  grid-template-columns: minmax(280px, 38%) minmax(0, 1fr);
}

.post-card--large .post-card__media {
  min-height: 100%;
}

.post-card--large .post-card__title {
  font-size: 1.85rem;
}

.post-card--small .post-card__body {
  padding: var(--space-lg);
}

.post-card--small .post-card__title {
  font-size: 1.18rem;
}

.post-card--small .post-card__media {
  min-height: 180px;
}

.post-card--plain {
  overflow: visible;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.post-card--plain:hover {
  transform: none;
  box-shadow: none;
  border-color: transparent;
}

.post-card--plain .post-card__media {
  border-radius: 0;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border-light);
}

.post-card--plain .post-card__body {
  padding: var(--space-md) 0 var(--space-lg);
}

.post-card--plain .post-card__category {
  border: none;
  background: var(--color-bg-secondary);
}

.post-card--plain .post-card__tag {
  border: none;
  background: var(--color-bg-secondary);
}

.post-card--plain .post-card__actions {
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border-light);
}

.post-card--plain .post-card__action-button {
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
}

.post-card--plain .post-card__action-button:hover {
  transform: none;
  border-color: transparent;
}

@keyframes post-card-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1023px) {
  .post-card--large {
    grid-template-columns: minmax(0, 1fr);
  }

  .post-card--large .post-card__media {
    min-height: 260px;
  }
}

@media (max-width: 767px) {
  .post-card__body {
    padding: var(--space-lg);
  }

  .post-card__title,
  .post-card--large .post-card__title {
    font-size: 1.3rem;
  }

  .post-card__media {
    min-height: 200px;
  }

  .post-card__actions {
    align-items: stretch;
  }

  .post-card__read-more {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .post-card,
  .post-card__tag,
  .post-card__action-button {
    transition: none;
  }

  .post-card:hover {
    transform: none;
  }
}
</style>
