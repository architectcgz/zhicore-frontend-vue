<!--
  评论项组件
  功能：
  - 实现评论卡片布局（头像、用户名、时间、内容）
  - 实现点赞按钮
  - 实现回复按钮
  - 实现删除按钮（作者/管理员）
  - 实现 @用户名 高亮
-->
<template>
  <div class="comment-item">
    <!-- 主评论 -->
    <div class="comment-main">
      <!-- 用户头像 -->
      <div class="comment-avatar">
        <img
          :src="comment.user.avatar || '/default-avatar.png'"
          :alt="comment.user.nickname"
          class="avatar-img"
          @error="handleAvatarError"
        >
      </div>

      <!-- 评论内容区域 -->
      <div class="comment-content">
        <!-- 用户信息和时间 -->
        <div class="comment-header">
          <div class="user-info">
            <router-link
              :to="`/users/${comment.user.id}`"
              class="user-name"
            >
              {{ comment.user.nickname }}
            </router-link>
            <span
              v-if="comment.user.role === 'ADMIN'"
              class="admin-badge"
            >
              管理员
            </span>
          </div>
          <div class="comment-time">
            {{ formatTime(comment.createdAt) }}
          </div>
        </div>

        <!-- 评论正文 -->
        <div class="comment-body">
          <div
            class="comment-text"
            v-html="processCommentContent(comment.content)"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="comment-actions">
          <!-- 点赞按钮 -->
          <button
            :class="[
              'action-btn like-btn',
              { 'liked': comment.isLiked }
            ]"
            @click="handleLike"
          >
            <svg
              class="action-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span class="action-text">{{ comment.likeCount || '点赞' }}</span>
          </button>

          <!-- 回复按钮 -->
          <button
            class="action-btn reply-btn"
            @click="handleReply"
          >
            <svg
              class="action-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
            </svg>
            <span class="action-text">回复</span>
          </button>

          <!-- 删除按钮（仅作者和管理员可见） -->
          <button
            v-if="canDelete"
            class="action-btn delete-btn"
            @click="handleDelete"
          >
            <svg
              class="action-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            <span class="action-text">删除</span>
          </button>

          <!-- 举报按钮 -->
          <button
            v-if="!isOwnComment"
            class="action-btn report-btn"
            @click="handleReport"
          >
            <svg
              class="action-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
            </svg>
            <span class="action-text">举报</span>
          </button>
        </div>

        <!-- 回复列表 -->
        <div
          v-if="comment.replies.length > 0"
          class="replies-container"
        >
          <CommentItem
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :post-id="postId"
            :is-reply="true"
            @reply="$emit('reply', $event)"
            @like="$emit('like', $event)"
            @delete="$emit('delete', $event)"
            @load-replies="$emit('load-replies', $event)"
          />
        </div>

        <!-- 加载更多回复按钮 -->
        <div
          v-if="comment.hasMore && comment.repliesCount > comment.replies.length"
          class="load-more-replies"
        >
          <button
            class="load-more-replies-btn"
            @click="handleLoadReplies"
          >
            查看更多回复 ({{ comment.repliesCount - comment.replies.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- 举报对话框 -->
    <div
      v-if="showReportDialog"
      class="report-dialog-overlay"
      @click="closeReportDialog"
    >
      <div
        class="report-dialog"
        @click.stop
      >
        <div class="report-header">
          <h3 class="report-title">
            举报评论
          </h3>
          <button
            class="close-btn"
            @click="closeReportDialog"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        <div class="report-content">
          <div class="report-options">
            <label
              v-for="reason in reportReasons"
              :key="reason.value"
              class="report-option"
            >
              <input
                v-model="selectedReportReason"
                type="radio"
                :value="reason.value"
                class="report-radio"
              >
              <span class="report-label">{{ reason.label }}</span>
            </label>
          </div>
          <div class="report-actions">
            <button
              class="cancel-btn"
              @click="closeReportDialog"
            >
              取消
            </button>
            <button
              :disabled="!selectedReportReason"
              class="submit-btn"
              @click="submitReport"
            >
              提交举报
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { commentApi } from '@/api/comment';
import type { Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 组件属性
interface Props {
  comment: Comment;
  postId: string;
  isReply?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isReply: false,
});

// 组件事件
interface Emits {
  (e: 'reply', comment: Comment): void;
  (e: 'like', commentId: string): void;
  (e: 'delete', commentId: string): void;
  (e: 'load-replies', commentId: string): void;
}

const emit = defineEmits<Emits>();

// 状态管理
const authStore = useAuthStore();

// 响应式数据
const showReportDialog = ref(false);
const selectedReportReason = ref('');

// 举报原因选项
const reportReasons = [
  { value: 'spam', label: '垃圾信息' },
  { value: 'harassment', label: '骚扰辱骂' },
  { value: 'inappropriate', label: '不当内容' },
  { value: 'copyright', label: '版权侵犯' },
  { value: 'other', label: '其他' },
];

// 计算属性
const isOwnComment = computed(() => {
  return authStore.user?.id === props.comment.user.id;
});

const canDelete = computed(() => {
  return isOwnComment.value || authStore.user?.role === 'ADMIN';
});

// 方法
/**
 * 格式化时间
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: zhCN,
  });
};

/**
 * 处理评论内容，高亮 @用户名
 */
const processCommentContent = (content: string): string => {
  // 转义 HTML 特殊字符
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // 高亮 @用户名
  return escaped.replace(
    /@([a-zA-Z0-9_\u4e00-\u9fa5]+)/g,
    '<span class="mention">@$1</span>'
  );
};

/**
 * 处理头像加载错误
 */
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/default-avatar.png';
};

/**
 * 处理点赞
 */
const handleLike = () => {
  emit('like', props.comment.id);
};

/**
 * 处理回复
 */
const handleReply = () => {
  emit('reply', props.comment);
};

/**
 * 处理删除
 */
const handleDelete = async () => {
  if (!confirm('确定要删除这条评论吗？')) {
    return;
  }
  
  emit('delete', props.comment.id);
};

/**
 * 处理举报
 */
const handleReport = () => {
  showReportDialog.value = true;
  selectedReportReason.value = '';
};

/**
 * 关闭举报对话框
 */
const closeReportDialog = () => {
  showReportDialog.value = false;
  selectedReportReason.value = '';
};

/**
 * 提交举报
 */
const submitReport = async () => {
  if (!selectedReportReason.value) return;

  try {
    await commentApi.reportComment(props.comment.id, selectedReportReason.value);
    closeReportDialog();
    // 可以显示成功提示
    console.log('举报提交成功');
  } catch (err) {
    console.error('举报提交失败:', err);
  }
};

/**
 * 处理加载更多回复
 */
const handleLoadReplies = () => {
  emit('load-replies', props.comment.id);
};
</script>

<style scoped>
.comment-item {
  @apply relative;
}

.comment-main {
  @apply flex space-x-3;
}

.comment-avatar {
  @apply flex-shrink-0;
}

.avatar-img {
  @apply w-10 h-10 rounded-full object-cover;
  @apply ring-2 ring-gray-100 dark:ring-gray-700;
}

.comment-content {
  @apply flex-1 min-w-0;
}

.comment-header {
  @apply flex items-center justify-between mb-2;
}

.user-info {
  @apply flex items-center space-x-2;
}

.user-name {
  @apply font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400;
  @apply transition-colors;
}

.admin-badge {
  @apply px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full;
  @apply dark:bg-red-900/20 dark:text-red-400;
}

.comment-time {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.comment-body {
  @apply mb-3;
}

.comment-text {
  @apply text-gray-800 dark:text-gray-200 leading-relaxed;
}

.comment-text :deep(.mention) {
  @apply text-blue-600 dark:text-blue-400 font-medium;
}

.comment-actions {
  @apply flex items-center space-x-4;
}

.action-btn {
  @apply flex items-center space-x-1 px-2 py-1 text-sm font-medium rounded;
  @apply text-gray-500 hover:text-gray-700 hover:bg-gray-100;
  @apply dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800;
  @apply transition-colors;
}

.action-icon {
  @apply w-4 h-4;
}

.like-btn.liked {
  @apply text-red-500 dark:text-red-400;
}

.delete-btn {
  @apply hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20;
}

.report-btn {
  @apply hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-orange-900/20;
}

.replies-container {
  @apply mt-4 space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700;
}

.load-more-replies {
  @apply mt-3;
}

.load-more-replies-btn {
  @apply text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300;
  @apply font-medium transition-colors;
}

/* 举报对话框样式 */
.report-dialog-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.report-dialog {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4;
}

.report-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700;
}

.report-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
}

.close-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200;
}

.close-btn svg {
  @apply w-5 h-5;
}

.report-content {
  @apply p-4;
}

.report-options {
  @apply space-y-3 mb-4;
}

.report-option {
  @apply flex items-center space-x-3 cursor-pointer;
}

.report-radio {
  @apply w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500;
}

.report-label {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.report-actions {
  @apply flex justify-end space-x-3;
}

.cancel-btn {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded;
  @apply dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600;
  @apply transition-colors;
}

.submit-btn {
  @apply px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors;
}
</style>