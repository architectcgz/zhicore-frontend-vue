<!--
  评论列表组件
  功能：
  - 渲染评论列表（树形结构）
  - 支持评论排序（最新、最热）
  - 支持评论分页/加载更多
  - 调用 comment API 获取评论
-->
<template>
  <div class="comment-list">
    <!-- 评论排序选择器 -->
    <div class="comment-sort-bar">
      <div class="sort-options">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          :class="[
            'sort-btn',
            { 'active': currentSort === option.value }
          ]"
          @click="handleSortChange(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="comment-count">
        共 {{ totalComments }} 条评论
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading && comments.length === 0"
      class="loading-container"
    >
      <LoadingSpinner size="medium" />
      <span class="loading-text">加载评论中...</span>
    </div>

    <!-- 评论列表 -->
    <div
      v-else-if="comments.length > 0"
      class="comments-container"
    >
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        @reply="handleReply"
        @like="handleLike"
        @delete="handleDelete"
        @load-replies="handleLoadReplies"
      />

      <!-- 加载更多按钮 -->
      <div
        v-if="hasMore"
        class="load-more-container"
      >
        <button
          :disabled="loading"
          class="load-more-btn"
          @click="loadMore"
        >
          <LoadingSpinner
            v-if="loading"
            size="small"
          />
          <span v-else>加载更多评论</span>
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <EmptyState
      v-else
      icon="💬"
      title="暂无评论"
      description="成为第一个评论的人吧！"
    />

    <!-- 错误状态 -->
    <div
      v-if="error"
      class="error-container"
    >
      <div class="error-message">
        {{ error }}
      </div>
      <button
        class="retry-btn"
        @click="refresh"
      >
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useInfiniteCommentsQuery } from '@/queries/comments/useInfiniteCommentsQuery';
import { useLikeCommentMutation } from '@/queries/comments/useLikeCommentMutation';
import { useDeleteCommentMutation } from '@/queries/comments/useDeleteCommentMutation';
import { commentApi } from '@/api/comment';
import type { Comment } from '@/types';
import CommentItem from './CommentItem.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

// 组件属性
interface Props {
  postId: string;
  initialSort?: 'latest' | 'hot';
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialSort: 'latest',
  pageSize: 20,
});

// 组件事件
interface Emits {
  (e: 'comment-count-change', count: number): void;
  (e: 'reply', comment: Comment): void;
}

const emit = defineEmits<Emits>();

// 响应式数据
const currentSort = ref(props.initialSort);

// 排序选项
const sortOptions = [
  { value: 'latest', label: '最新' },
  { value: 'hot', label: '最热' },
] as const;

// 查询参数
const queryParams = computed(() => ({
  sort: currentSort.value,
  loadReplies: false, // 不预加载回复，按需加载
}));

// 使用 TanStack Query hooks
const commentsQuery = useInfiniteCommentsQuery(
  computed(() => props.postId),
  queryParams
);
const likeCommentMutation = useLikeCommentMutation();
const deleteCommentMutation = useDeleteCommentMutation();

// 计算属性：扁平化的评论列表
const comments = computed(() => {
  const pages = commentsQuery.data.value?.pages || [];
  return pages.flatMap(page => page.items || []);
});

// 计算属性：是否正在加载
const loading = computed(() => {
  return commentsQuery.isLoading.value || commentsQuery.isFetchingNextPage.value;
});

// 计算属性：是否还有更多数据
const hasMore = computed(() => {
  return commentsQuery.hasNextPage.value ?? false;
});

// 计算属性：错误信息
const error = computed(() => {
  return commentsQuery.error.value?.message || null;
});

// 计算属性：总评论数
const totalComments = computed(() => {
  const firstPage = commentsQuery.data.value?.pages[0];
  return firstPage?.total || 0;
});

// 监听总评论数变化，通知父组件
watch(totalComments, (count) => {
  emit('comment-count-change', count);
}, { immediate: true });

// 方法
/**
 * 加载更多评论
 */
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    commentsQuery.fetchNextPage();
  }
};

/**
 * 刷新评论列表
 */
const refresh = () => {
  commentsQuery.refetch();
};

/**
 * 处理排序变化
 */
const handleSortChange = (sort: 'latest' | 'hot') => {
  if (sort === currentSort.value) return;
  
  currentSort.value = sort;
  // TanStack Query 会自动重新获取数据
};

/**
 * 处理回复评论
 */
const handleReply = (comment: Comment) => {
  emit('reply', comment);
};

/**
 * 处理点赞评论
 */
const handleLike = (commentId: string) => {
  const comment = findCommentById(commentId);
  if (!comment) return;

  likeCommentMutation.mutate({
    commentId,
    isLiked: comment.isLiked,
  });
};

/**
 * 处理删除评论
 */
const handleDelete = (commentId: string) => {
  deleteCommentMutation.mutate(commentId);
};

/**
 * 处理加载回复
 */
const handleLoadReplies = async (commentId: string) => {
  try {
    const comment = findCommentById(commentId);
    if (!comment) return;

    const response = await commentApi.getCommentReplies(commentId, {
      page: 1,
      size: 10,
      sort: 'latest',
    });

    comment.replies = response.items;
    comment.hasMore = response.hasMore;
  } catch (err) {
    console.error('加载回复失败:', err);
  }
};

/**
 * 根据 ID 查找评论（包括回复）
 */
const findCommentById = (commentId: string): Comment | null => {
  for (const comment of comments.value) {
    if (comment.id === commentId) {
      return comment;
    }
    
    // 在回复中查找
    const reply = findCommentInReplies(comment.replies, commentId);
    if (reply) {
      return reply;
    }
  }
  return null;
};

/**
 * 在回复列表中递归查找评论
 */
const findCommentInReplies = (replies: Comment[], commentId: string): Comment | null => {
  for (const reply of replies) {
    if (reply.id === commentId) {
      return reply;
    }
    
    // 递归查找子回复
    const subReply = findCommentInReplies(reply.replies, commentId);
    if (subReply) {
      return subReply;
    }
  }
  return null;
};

/**
 * 添加新评论到列表
 */
const addComment = (_comment: Comment) => {
  // TanStack Query 会自动处理缓存更新
  // 这里只需要刷新查询
  refresh();
};

// 暴露方法给父组件
defineExpose({
  refresh,
  addComment,
});
</script>

<style scoped>
.comment-list {
  @apply space-y-4;
}

.comment-sort-bar {
  @apply flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700;
}

.sort-options {
  @apply flex space-x-2;
}

.sort-btn {
  @apply px-3 py-1.5 text-sm font-medium rounded-lg transition-colors;
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100;
  @apply dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800;
}

.sort-btn.active {
  @apply text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20;
}

.comment-count {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.loading-container {
  @apply flex items-center justify-center py-8 space-x-2;
}

.loading-text {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.comments-container {
  @apply space-y-4;
}

.load-more-container {
  @apply flex justify-center pt-4;
}

.load-more-btn {
  @apply flex items-center space-x-2 px-6 py-2 text-sm font-medium;
  @apply text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors;
  @apply dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.error-container {
  @apply flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg;
  @apply dark:bg-red-900/20 dark:border-red-800;
}

.error-message {
  @apply text-sm text-red-600 dark:text-red-400;
}

.retry-btn {
  @apply px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700;
  @apply bg-white hover:bg-red-50 border border-red-300 rounded;
  @apply dark:text-red-400 dark:hover:text-red-300 dark:bg-red-900/20 dark:border-red-700;
  @apply transition-colors;
}
</style>