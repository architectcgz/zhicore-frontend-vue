<!--
  文章卡片组件
  显示文章的基本信息，包括封面图、标题、摘要、作者信息、标签等
  支持点赞、收藏等交互功能
-->

<template>
  <article 
    class="post-card group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
    :class="{ 'cursor-pointer': !isActionClick }"
    @click="handleCardClick"
  >
    <!-- 封面图片 -->
    <div 
      v-if="post.coverImage" 
      class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700"
    >
      <img
        :src="post.coverImage"
        :alt="post.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        @error="handleImageError"
      >
      
      <!-- 文章状态标识 -->
      <div 
        v-if="post.status !== 'PUBLISHED'" 
        class="absolute top-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded-md"
      >
        {{ getStatusText(post.status) }}
      </div>
      
      <!-- 阅读时间估算 -->
      <div class="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
        {{ estimatedReadTime }} 分钟阅读
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="p-6">
      <!-- 文章标题 -->
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {{ post.title }}
      </h3>

      <!-- 文章摘要 -->
      <p 
        v-if="post.excerpt" 
        class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3"
      >
        {{ post.excerpt }}
      </p>

      <!-- 标签列表 -->
      <div
        v-if="post.tags && post.tags.length > 0"
        class="flex flex-wrap gap-2 mb-4"
      >
        <button
          v-for="tag in displayTags"
          :key="tag.id"
          class="inline-flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          @click.stop="handleTagClick(tag)"
        >
          #{{ tag.name }}
        </button>
        
        <!-- 更多标签指示器 -->
        <span 
          v-if="post.tags.length > maxDisplayTags"
          class="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
        >
          +{{ post.tags.length - maxDisplayTags }}
        </span>
      </div>

      <!-- 作者信息和发布时间 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <!-- 作者头像 -->
          <button
            v-if="post.author"
            class="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
            @click.stop="handleAuthorClick"
          >
            <img
              :src="post.author?.avatar || defaultAvatar"
              :alt="post.author?.nickname || '匿名用户'"
              class="w-full h-full object-cover"
              @error="handleAvatarError"
            >
          </button>
          
          <!-- 作者信息 -->
          <div class="min-w-0 flex-1">
            <button
              v-if="post.author"
              class="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
              @click.stop="handleAuthorClick"
            >
              {{ post.author?.nickname || '匿名用户' }}
            </button>
            <span
              v-else
              class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate block"
            >
              匿名用户
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(post.publishedAt || post.createdAt) }}
            </p>
          </div>
        </div>

        <!-- 分类标识 -->
        <button
          v-if="post.category"
          class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          @click.stop="handleCategoryClick"
        >
          {{ post.category.name }}
        </button>
      </div>

      <!-- 文章统计和操作按钮 -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <!-- 统计信息 -->
        <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span class="flex items-center space-x-1">
            <svg
              class="w-4 h-4"
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
            <span>{{ formatNumber(post.viewCount) }}</span>
          </span>
          
          <span class="flex items-center space-x-1">
            <svg
              class="w-4 h-4"
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
            <span>{{ formatNumber(post.commentCount) }}</span>
          </span>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center space-x-2">
          <!-- 点赞按钮 -->
          <button
            class="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            :class="[
              post.isLiked 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50' 
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
            :disabled="likeLoading"
            @click.stop="handleLike"
          >
            <svg 
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'scale-110': post.isLiked }"
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
            <span>{{ formatNumber(post.likeCount) }}</span>
          </button>

          <!-- 收藏按钮 -->
          <button
            class="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            :class="[
              post.isFavorited 
                ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50' 
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
            :disabled="favoriteLoading"
            @click.stop="handleFavorite"
          >
            <svg 
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'scale-110': post.isFavorited }"
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
            <span>{{ formatNumber(post.favoriteCount) }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态遮罩 -->
    <div 
      v-if="likeLoading || favoriteLoading"
      class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center"
    >
      <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { postApi } from '@/api/post';
import type { Post, Tag } from '@/types';

/**
 * 组件属性定义
 */
interface Props {
  /** 文章数据 */
  post: Post;
  /** 最大显示标签数量 */
  maxDisplayTags?: number;
  /** 是否显示封面图 */
  showCover?: boolean;
  /** 是否显示摘要 */
  showExcerpt?: boolean;
  /** 是否显示统计信息 */
  showStats?: boolean;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 卡片尺寸 */
  size?: 'small' | 'medium' | 'large';
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 点击文章卡片 */
  (e: 'click', post: Post): void;
  /** 点击作者 */
  (e: 'author-click', author: Post['author']): void;
  /** 点击标签 */
  (e: 'tag-click', tag: Tag): void;
  /** 点击分类 */
  (e: 'category-click', category: Post['category']): void;
  /** 点赞状态变化 */
  (e: 'like-change', data: { postId: string; isLiked: boolean; likeCount: number }): void;
  /** 收藏状态变化 */
  (e: 'favorite-change', data: { postId: string; isFavorited: boolean; favoriteCount: number }): void;
}

// 组件属性和事件
const props = withDefaults(defineProps<Props>(), {
  maxDisplayTags: 3,
  showCover: true,
  showExcerpt: true,
  showStats: true,
  showActions: true,
  size: 'medium',
});

const emit = defineEmits<Emits>();

// 路由实例
const router = useRouter();

// 响应式状态
const likeLoading = ref(false);
const favoriteLoading = ref(false);
const isActionClick = ref(false);

// 默认头像
const defaultAvatar = '/images/default-avatar.png';

/**
 * 计算属性：显示的标签列表
 */
const displayTags = computed(() => {
  return props.post.tags?.slice(0, props.maxDisplayTags) || [];
});

/**
 * 计算属性：估算阅读时间（基于内容长度）
 */
const estimatedReadTime = computed(() => {
  // 中文阅读速度通常更快，且这里按字符数估算（去除空白字符）
  const charsPerMinute = 400;
  const rawText = props.post.content || props.post.excerpt || '';
  const charCount = rawText.replace(/\s+/g, '').length;
  const minutes = Math.ceil(charCount / charsPerMinute);
  return Math.max(1, minutes);
});

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
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * 获取文章状态文本
 */
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
  };
  return statusMap[status] || status;
};

/**
 * 处理卡片点击
 */
const handleCardClick = () => {
  if (!isActionClick.value) {
    emit('click', props.post);
    router.push(`/posts/${props.post.id}`);
  }
  isActionClick.value = false;
};

/**
 * 处理作者点击
 */
const handleAuthorClick = () => {
  if (!props.post.author) return;
  
  isActionClick.value = true;
  emit('author-click', props.post.author);
  router.push(`/users/${props.post.author.id}`);
};

/**
 * 处理标签点击
 */
const handleTagClick = (tag: Tag) => {
  isActionClick.value = true;
  emit('tag-click', tag);
  router.push(`/tags/${tag.slug}`);
};

/**
 * 处理分类点击
 */
const handleCategoryClick = () => {
  if (props.post.category) {
    isActionClick.value = true;
    emit('category-click', props.post.category);
    router.push(`/categories/${props.post.category.slug}`);
  }
};

/**
 * 处理点赞
 */
const handleLike = async () => {
  if (likeLoading.value) return;
  
  isActionClick.value = true;
  likeLoading.value = true;

  try {
    const result = props.post.isLiked 
      ? await postApi.unlikePost(props.post.id)
      : await postApi.likePost(props.post.id);

    // 发出事件
    emit('like-change', {
      postId: props.post.id,
      isLiked: result.isLiked,
      likeCount: result.likeCount,
    });

  } catch (error) {
    console.error('点赞操作失败:', error);
    // 这里可以添加错误提示
  } finally {
    likeLoading.value = false;
  }
};

/**
 * 处理收藏
 */
const handleFavorite = async () => {
  if (favoriteLoading.value) return;
  
  isActionClick.value = true;
  favoriteLoading.value = true;

  try {
    const result = props.post.isFavorited 
      ? await postApi.unfavoritePost(props.post.id)
      : await postApi.favoritePost(props.post.id);

    // 发出事件
    emit('favorite-change', {
      postId: props.post.id,
      isFavorited: result.isFavorited,
      favoriteCount: result.favoriteCount,
    });

  } catch (error) {
    console.error('收藏操作失败:', error);
    // 这里可以添加错误提示
  } finally {
    favoriteLoading.value = false;
  }
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
/* 悬停动画效果 */
.post-card {
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card:hover {
  transform: translateY(-2px);
}

/* 按钮悬停效果 */
.post-card button {
  transition: all 0.2s ease-in-out;
}

.post-card button:hover {
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .post-card {
    margin: 0 -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
</style>
