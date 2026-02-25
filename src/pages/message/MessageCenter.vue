<!--
  消息中心页面
  实现两栏布局：会话列表 | 消息历史
  包含消息发送、接收、时间分组等功能
-->
<template>
  <div class="message-center">
    <!-- 会话列表 -->
    <div class="conversation-list">
      <div class="conversation-header">
        <h2 class="text-xl font-heading">
          消息
        </h2>
        <button 
          class="btn-icon"
          title="新建会话"
          @click="handleNewConversation"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="conversation-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索会话..."
          class="search-input"
        >
      </div>

      <!-- 会话列表 -->
      <div class="conversation-items">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{ active: messageStore.currentConversationId === conversation.id }"
          @click="selectConversation(conversation.id)"
        >
          <div class="conversation-avatar">
            <img 
              :src="getOtherUser(conversation).avatar" 
              :alt="getOtherUser(conversation).nickname"
              class="avatar-img"
            >
            <span 
              v-if="conversation.unreadCount > 0" 
              class="unread-badge"
            >
              {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
            </span>
          </div>

          <div class="conversation-content">
            <div class="conversation-top">
              <span class="conversation-name">{{ getOtherUser(conversation).nickname }}</span>
              <span class="conversation-time">{{ formatTime(conversation.updatedAt) }}</span>
            </div>
            <div class="conversation-message">
              {{ conversation.lastMessage?.content || '暂无消息' }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="filteredConversations.length === 0"
          class="empty-state"
        >
          <svg
            class="w-16 h-16 text-gray-400"
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
          <p class="text-gray-500 mt-4">
            暂无会话
          </p>
        </div>

        <!-- 加载状态 -->
        <div
          v-if="isLoading"
          class="loading-state"
        >
          <div class="spinner" />
        </div>
      </div>
    </div>

    <!-- 消息历史区域 -->
    <div class="message-history">
      <template v-if="currentConversation">
        <!-- 消息头部 -->
        <div class="message-header">
          <div class="message-header-left">
            <img 
              :src="getOtherUser(currentConversation).avatar" 
              :alt="getOtherUser(currentConversation).nickname"
              class="avatar-sm"
            >
            <span class="font-medium">{{ getOtherUser(currentConversation).nickname }}</span>
          </div>
          <div class="message-header-right">
            <button
              class="btn-icon"
              title="更多"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div
          ref="messageListRef"
          class="message-list"
          @scroll="handleScroll"
        >
          <div
            v-for="(group, date) in groupedMessages"
            :key="date"
            class="message-group"
          >
            <!-- 日期分隔符 -->
            <div class="message-date-divider">
              <span>{{ date }}</span>
            </div>

            <!-- 消息项 -->
            <div
              v-for="message in group"
              :key="message.id"
              class="message-item"
              :class="{ 'message-sent': message.senderId === currentUserId }"
            >
              <img 
                :src="message.sender.avatar" 
                :alt="message.sender.nickname"
                class="message-avatar"
              >
              <div class="message-bubble">
                <div class="message-content">
                  {{ message.content }}
                </div>
                <div class="message-time">
                  {{ formatMessageTime(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div
            v-if="hasMoreMessages"
            class="load-more"
          >
            <button
              class="btn-text"
              @click="loadMoreMessages"
            >
              加载更多消息
            </button>
          </div>
        </div>

        <!-- 消息输入框 -->
        <div class="message-input-container">
          <div class="message-input-toolbar">
            <button
              class="btn-icon"
              title="表情"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              class="btn-icon"
              title="图片"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <textarea
            v-model="messageContent"
            placeholder="输入消息..."
            class="message-input"
            rows="3"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="messageContent += '\n'"
          />
          <div class="message-input-actions">
            <span class="text-sm text-gray-500">按 Enter 发送，Shift + Enter 换行</span>
            <button 
              class="btn-primary"
              :disabled="!messageContent.trim() || isSending"
              @click="sendMessage"
            >
              {{ isSending ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </template>

      <!-- 未选中会话 -->
      <div
        v-else
        class="message-empty"
      >
        <svg
          class="w-24 h-24 text-gray-300"
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
        <p class="text-gray-500 mt-4">
          选择一个会话开始聊天
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useMessageStore } from '@/stores/message';
import { useAuthStore } from '@/stores/auth';
import { useMessageWebSocket } from '@/composables/useMessageWebSocket';
import { useConversationsQuery } from '@/queries/messages/useConversationsQuery';
import { useMessagesQuery } from '@/queries/messages/useMessagesQuery';
import { useSendMessageMutation } from '@/queries/messages/useSendMessageMutation';
import { useMarkConversationAsReadMutation } from '@/queries/messages/useMarkConversationAsReadMutation';
import { useCreateConversationMutation } from '@/queries/messages/useCreateConversationMutation';
import type { Conversation, User } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Stores
const messageStore = useMessageStore();
const authStore = useAuthStore();

// WebSocket
const { sendMessageViaWebSocket, sendTypingStatus } = useMessageWebSocket();

// TanStack Query - 会话列表
const { data: conversationsData, isLoading: isLoadingConversations } = useConversationsQuery();

// 计算属性 - 当前会话 ID（需要在 useMessagesQuery 之前定义）
const currentConversationId = computed(() => messageStore.currentConversationId || '');

// TanStack Query - 消息列表（只在有会话 ID 时查询）
const { data: messagesData, isLoading: isLoadingMessages } = useMessagesQuery(currentConversationId);

// TanStack Query - 发送消息
const { mutate: sendMessageMutation, isPending: isSending } = useSendMessageMutation();

// TanStack Query - 标记已读
const { mutate: markAsRead } = useMarkConversationAsReadMutation();

// TanStack Query - 创建会话
const { mutate: createConversation, isPending: isCreatingConversation } = useCreateConversationMutation();

// 响应式数据
const searchQuery = ref('');
const messageContent = ref('');
const messageListRef = ref<HTMLElement | null>(null);
const hasMoreMessages = ref(false);
const isTyping = ref(false);
let typingTimer: ReturnType<typeof setTimeout> | null = null;

// 计算属性
const currentUserId = computed(() => authStore.user?.id || '');
const conversations = computed(() => conversationsData.value?.items || []);
const currentMessages = computed(() => messagesData.value?.items || []);
const isLoading = computed(() => isLoadingConversations.value || isLoadingMessages.value);

// 从会话列表中查找当前会话
const currentConversation = computed(() => {
  const id = messageStore.currentConversationId;
  if (!id) return null;
  return conversations.value.find(c => c.id === id) || null;
});

/**
 * 过滤后的会话列表
 */
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return conversations.value;
  }

  const query = searchQuery.value.toLowerCase();
  return conversations.value.filter(conversation => {
    const otherUser = getOtherUser(conversation);
    return otherUser.nickname.toLowerCase().includes(query) ||
           conversation.lastMessage?.content.toLowerCase().includes(query);
  });
});

/**
 * 按日期分组的消息
 */
const groupedMessages = computed(() => {
  const groups: Record<string, typeof currentMessages.value> = {};

  currentMessages.value.forEach(message => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  return groups;
});

/**
 * 获取会话中的另一个用户
 */
function getOtherUser(conversation: Conversation): User {
  return conversation.participants.find(p => p.id !== currentUserId.value) || conversation.participants[0];
}

/**
 * 格式化时间（相对时间）
 */
function formatTime(time: string): string {
  return dayjs(time).fromNow();
}

/**
 * 格式化日期
 */
function formatDate(time: string): string {
  const date = dayjs(time);
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return '今天';
  } else if (date.isSame(yesterday, 'day')) {
    return '昨天';
  } else if (date.isSame(today, 'year')) {
    return date.format('MM月DD日');
  } else {
    return date.format('YYYY年MM月DD日');
  }
}

/**
 * 格式化消息时间
 */
function formatMessageTime(time: string): string {
  return dayjs(time).format('HH:mm');
}

/**
 * 选择会话
 */
async function selectConversation(conversationId: string) {
  // 设置当前会话 ID（UI 状态）
  messageStore.setCurrentConversation(conversationId);
  
  // 消息会通过 useMessagesQuery 自动加载
  // 不再需要手动调用 fetchMessages
  
  // 使用 TanStack Query mutation 标记为已读
  markAsRead(conversationId);
  
  // 滚动到底部
  await nextTick();
  scrollToBottom();
}

/**
 * 发送消息
 */
async function sendMessage() {
  if (!messageContent.value.trim() || !currentConversation.value || isSending.value) {
    return;
  }

  try {
    const otherUser = getOtherUser(currentConversation.value);
    
    // 使用 TanStack Query mutation 发送消息
    sendMessageMutation({
      receiverId: otherUser.id,
      content: messageContent.value.trim(),
      conversationId: currentConversation.value.id,
    }, {
      onSuccess: async () => {
        // 同时通过 WebSocket 发送（用于实时通知）
        sendMessageViaWebSocket({
          conversationId: currentConversation.value!.id,
          receiverId: otherUser.id,
          content: messageContent.value.trim(),
        });

        // 清空输入框
        messageContent.value = '';

        // 停止正在输入状态
        if (isTyping.value) {
          sendTypingStatus(currentConversation.value!.id, false);
          isTyping.value = false;
        }

        // 滚动到底部
        await nextTick();
        scrollToBottom();
      },
      onError: (error) => {
        console.error('Failed to send message:', error);
        // 错误处理已由 mutation 的 onError 处理（回滚乐观更新）
      },
    });
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
}

/**
 * 处理滚动事件（加载更多）
 */
function handleScroll() {
  if (!messageListRef.value) return;

  const { scrollTop } = messageListRef.value;
  
  // 滚动到顶部时加载更多
  if (scrollTop === 0 && hasMoreMessages.value) {
    loadMoreMessages();
  }
}

/**
 * 加载更多消息
 */
async function loadMoreMessages() {
  if (!currentConversationId.value) return;

  try {
    // TODO: 实现分页加载
    console.log('Load more messages');
  } catch (error) {
    console.error('Failed to load more messages:', error);
  }
}

/**
 * 新建会话
 */
function handleNewConversation() {
  // TODO: 打开用户选择对话框
  console.log('New conversation');
}

/**
 * 处理输入变化（发送正在输入状态）
 */
function handleInputChange() {
  if (!currentConversation.value) return;

  // 发送正在输入状态
  if (!isTyping.value) {
    isTyping.value = true;
    sendTypingStatus(currentConversation.value.id, true);
  }

  // 清除之前的定时器
  if (typingTimer) {
    clearTimeout(typingTimer);
  }

  // 3秒后停止正在输入状态
  typingTimer = setTimeout(() => {
    if (currentConversation.value) {
      isTyping.value = false;
      sendTypingStatus(currentConversation.value.id, false);
    }
  }, 3000);
}

// 生命周期
onMounted(async () => {
  // 会话列表会通过 useConversationsQuery 自动加载
  // 未读数量会通过会话列表查询自动获取
  // 不再需要手动调用 fetchConversations 和 syncUnreadCount
  
  // 检查是否有用户 ID 参数（从其他页面跳转过来）
  const route = useRoute();
  const userId = route.query.user as string;
  
  if (userId) {
    // 使用 TanStack Query mutation 创建或获取会话
    createConversation(userId, {
      onSuccess: async (conversation) => {
        // 选择该会话
        await selectConversation(conversation.id);
      },
      onError: (error) => {
        console.error('Failed to create conversation:', error);
        // 错误消息已由 mutation 的 onError 处理
      },
    });
  }
});

// 监听当前会话变化
watch(currentConversationId, async (newId) => {
  if (newId) {
    await nextTick();
    scrollToBottom();
  }
});

// 监听消息内容变化（发送正在输入状态）
watch(messageContent, () => {
  if (messageContent.value.trim()) {
    handleInputChange();
  }
});
</script>

<style scoped>
/* 消息中心容器 */
.message-center {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 64px);
  background: var(--color-bg-primary);
}

/* 会话列表 */
.conversation-list {
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
}

.conversation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.conversation-search {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.conversation-items {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--color-border);
}

.conversation-item:hover {
  background: var(--color-bg-hover);
}

.conversation-item.active {
  background: var(--color-bg-active);
}

.conversation-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-danger);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.conversation-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.conversation-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.conversation-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 消息历史区域 */
.message-history {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.message-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.message-group {
  margin-bottom: var(--space-lg);
}

.message-date-divider {
  text-align: center;
  margin: var(--space-lg) 0;
}

.message-date-divider span {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: 12px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.message-item {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.message-item.message-sent {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 60%;
  padding: var(--space-sm) var(--space-md);
  border-radius: 12px;
  background: var(--color-bg-secondary);
}

.message-sent .message-bubble {
  background: var(--color-primary);
  color: white;
}

.message-content {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.message-time {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.message-sent .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* 消息输入区域 */
.message-input-container {
  border-top: 1px solid var(--color-border);
  padding: var(--space-md);
  background: var(--color-bg-secondary);
}

.message-input-toolbar {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.message-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.message-input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-sm);
}

/* 空状态 */
.empty-state,
.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-tertiary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: var(--space-lg);
}

.load-more {
  text-align: center;
  padding: var(--space-md);
}

/* 按钮样式 */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.btn-primary {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  padding: var(--space-sm);
}

.btn-text:hover {
  text-decoration: underline;
}

/* 加载动画 */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .message-center {
    grid-template-columns: 1fr;
  }

  .conversation-list {
    display: none;
  }

  .message-bubble {
    max-width: 80%;
  }
}
</style>
