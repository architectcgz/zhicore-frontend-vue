<!--
  评论表单组件
  功能：
  - 实现评论输入框
  - 实现表单验证
  - 实现提交评论功能
  - 实现回复评论功能
  - 调用 comment API 创建评论
-->
<template>
  <div class="comment-form">
    <!-- 回复提示 -->
    <div
      v-if="replyTo"
      class="reply-indicator"
    >
      <div class="reply-info">
        <span class="reply-text">回复 @{{ replyTo.user.nickname }}:</span>
        <span class="reply-content">{{ truncateText(replyTo.content, 50) }}</span>
      </div>
      <button
        class="cancel-reply-btn"
        @click="cancelReply"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>

    <!-- 评论表单 -->
    <form
      class="comment-form-container"
      @submit.prevent="handleSubmit"
    >
      <!-- 用户头像 -->
      <div class="user-avatar">
        <img
          :src="currentUser?.avatar || '/default-avatar.png'"
          :alt="currentUser?.nickname || '用户'"
          class="avatar-img"
        >
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <!-- 文本输入框 -->
        <div class="textarea-wrapper">
          <textarea
            ref="textareaRef"
            v-model="content"
            :placeholder="placeholder"
            :disabled="submitting"
            class="comment-textarea"
            rows="3"
            maxlength="1000"
            @input="handleInput"
            @keydown="handleKeydown"
            @focus="handleFocus"
            @blur="handleBlur"
          />
          
          <!-- 字符计数 -->
          <div class="char-count">
            {{ content.length }}/1000
          </div>
        </div>

        <!-- 表单验证错误 -->
        <div
          v-if="error"
          class="error-message"
        >
          {{ error }}
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <!-- 表情按钮 -->
          <div class="emoji-container">
            <button
              type="button"
              class="emoji-btn"
              @click="toggleEmojiPicker"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </button>
            
            <!-- 简单表情选择器 -->
            <div
              v-if="showEmojiPicker"
              class="emoji-picker"
            >
              <button
                v-for="emoji in commonEmojis"
                :key="emoji"
                type="button"
                class="emoji-option"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="submit-container">
            <button
              v-if="replyTo"
              type="button"
              class="cancel-btn"
              @click="cancelReply"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="submit-btn"
            >
              <LoadingSpinner
                v-if="submitting"
                size="small"
              />
              <span v-else>{{ replyTo ? '回复' : '发表评论' }}</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- 登录提示 -->
    <div
      v-if="!isAuthenticated"
      class="login-prompt"
    >
      <div class="login-message">
        <span>请先</span>
        <router-link
          to="/auth/login"
          class="login-link"
        >
          登录
        </router-link>
        <span>后发表评论</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { commentApi } from '@/api/comment';
import type { Comment } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

// 组件属性
interface Props {
  postId: string;
  replyTo?: Comment | null;
  autoFocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  replyTo: null,
  autoFocus: false,
});

// 组件事件
interface Emits {
  (e: 'comment-created', comment: Comment): void;
  (e: 'cancel-reply'): void;
}

const emit = defineEmits<Emits>();

// 状态管理
const authStore = useAuthStore();

// 响应式数据
const content = ref('');
const submitting = ref(false);
const error = ref<string | null>(null);
const focused = ref(false);
const showEmojiPicker = ref(false);
const textareaRef = ref<HTMLTextAreaElement>();

// 常用表情
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '👍', '👎', '👌', '🤝', '👏', '🙌', '🤲', '❤️',
];

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);

const placeholder = computed(() => {
  if (!isAuthenticated.value) {
    return '请先登录后发表评论...';
  }
  return props.replyTo 
    ? `回复 @${props.replyTo.user.nickname}...`
    : '写下你的评论...';
});

const canSubmit = computed(() => {
  return isAuthenticated.value && 
         content.value.trim().length > 0 && 
         content.value.length <= 1000 && 
         !submitting.value;
});

// 方法
/**
 * 处理输入
 */
const handleInput = () => {
  error.value = null;
  
  // 自动调整高度
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

/**
 * 处理键盘事件
 */
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + Enter 提交
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  }
  
  // Escape 取消回复
  if (event.key === 'Escape' && props.replyTo) {
    cancelReply();
  }
};

/**
 * 处理焦点
 */
const handleFocus = () => {
  focused.value = true;
};

/**
 * 处理失焦
 */
const handleBlur = () => {
  focused.value = false;
  // 延迟隐藏表情选择器，避免点击表情时立即隐藏
  setTimeout(() => {
    showEmojiPicker.value = false;
  }, 200);
};

/**
 * 切换表情选择器
 */
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

/**
 * 插入表情
 */
const insertEmoji = (emoji: string) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = content.value;

  content.value = text.slice(0, start) + emoji + text.slice(end);
  
  // 恢复光标位置
  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
  });

  showEmojiPicker.value = false;
};

/**
 * 截断文本
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * 验证评论内容
 */
const validateContent = (): boolean => {
  const trimmedContent = content.value.trim();
  
  if (!trimmedContent) {
    error.value = '评论内容不能为空';
    return false;
  }
  
  if (trimmedContent.length < 2) {
    error.value = '评论内容至少需要2个字符';
    return false;
  }
  
  if (trimmedContent.length > 1000) {
    error.value = '评论内容不能超过1000个字符';
    return false;
  }
  
  return true;
};

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  if (!isAuthenticated.value) {
    error.value = '请先登录后发表评论';
    return;
  }

  if (!validateContent()) {
    return;
  }

  try {
    submitting.value = true;
    error.value = null;

    const commentData = {
      postId: props.postId,
      content: content.value.trim(),
      parentId: props.replyTo?.id,
    };

    const newComment = await commentApi.createComment(commentData);
    
    // 清空表单
    content.value = '';
    
    // 重置文本框高度
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }

    // 通知父组件
    emit('comment-created', newComment);

    // 如果是回复，取消回复状态
    if (props.replyTo) {
      emit('cancel-reply');
    }

  } catch (err: any) {
    console.error('发表评论失败:', err);
    error.value = err.response?.data?.message || '发表评论失败，请稍后重试';
  } finally {
    submitting.value = false;
  }
};

/**
 * 取消回复
 */
const cancelReply = () => {
  content.value = '';
  error.value = null;
  emit('cancel-reply');
};

/**
 * 聚焦到输入框
 */
const focus = () => {
  nextTick(() => {
    textareaRef.value?.focus();
  });
};

/**
 * 处理点击外部区域
 */
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.emoji-container')) {
    showEmojiPicker.value = false;
  }
};

// 生命周期
onMounted(() => {
  if (props.autoFocus && isAuthenticated.value) {
    focus();
  }
  
  // 监听点击外部区域
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 暴露方法给父组件
defineExpose({
  focus,
  clear: () => {
    content.value = '';
    error.value = null;
  },
});
</script>

<style scoped>
.comment-form {
  @apply space-y-3;
}

.reply-indicator {
  @apply flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg;
  @apply dark:bg-blue-900/20 dark:border-blue-800;
}

.reply-info {
  @apply flex items-center space-x-2 text-sm;
}

.reply-text {
  @apply font-medium text-blue-700 dark:text-blue-300;
}

.reply-content {
  @apply text-gray-600 dark:text-gray-400;
}

.cancel-reply-btn {
  @apply p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300;
}

.cancel-reply-btn svg {
  @apply w-4 h-4;
}

.comment-form-container {
  @apply flex space-x-3;
}

.user-avatar {
  @apply flex-shrink-0;
}

.avatar-img {
  @apply w-10 h-10 rounded-full object-cover;
  @apply ring-2 ring-gray-100 dark:ring-gray-700;
}

.input-container {
  @apply flex-1 space-y-3;
}

.textarea-wrapper {
  @apply relative;
}

.comment-textarea {
  @apply w-full px-4 py-3 text-sm border border-gray-300 rounded-lg resize-none;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100;
  @apply dark:focus:ring-blue-400 dark:focus:border-blue-400;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors;
  min-height: 80px;
  max-height: 200px;
}

.char-count {
  @apply absolute bottom-2 right-3 text-xs text-gray-400;
}

.error-message {
  @apply text-sm text-red-600 dark:text-red-400;
}

.form-actions {
  @apply flex items-center justify-between;
}

.emoji-container {
  @apply relative;
}

.emoji-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded;
  @apply dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800;
  @apply transition-colors;
}

.emoji-btn svg {
  @apply w-5 h-5;
}

.emoji-picker {
  @apply absolute bottom-full left-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg;
  @apply dark:bg-gray-800 dark:border-gray-700;
  @apply grid grid-cols-8 gap-1;
  @apply z-10;
}

.emoji-option {
  @apply p-1 text-lg hover:bg-gray-100 rounded;
  @apply dark:hover:bg-gray-700;
  @apply transition-colors;
}

.submit-container {
  @apply flex items-center space-x-2;
}

.cancel-btn {
  @apply px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800;
  @apply dark:text-gray-400 dark:hover:text-gray-200;
  @apply transition-colors;
}

.submit-btn {
  @apply flex items-center space-x-2 px-4 py-2 text-sm font-medium;
  @apply text-white bg-blue-600 hover:bg-blue-700 rounded-lg;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors;
}

.login-prompt {
  @apply p-4 bg-gray-50 border border-gray-200 rounded-lg text-center;
  @apply dark:bg-gray-800 dark:border-gray-700;
}

.login-message {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.login-link {
  @apply text-blue-600 hover:text-blue-700 font-medium;
  @apply dark:text-blue-400 dark:hover:text-blue-300;
  @apply transition-colors;
}
</style>