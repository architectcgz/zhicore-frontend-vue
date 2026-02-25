<!--
  通知下拉组件
  显示最近的通知列表，支持标记已读、查看全部等功能
  用于导航栏的通知图标下拉菜单
-->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { ElMessage } from 'element-plus';
import type { Notification } from '@/types';

// 定义 Props
interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'close': [];
}>();

// 路由和状态
const router = useRouter();
const notificationStore = useNotificationStore();

// 本地状态
const isLoadingRecent = ref(false);
const recentNotifications = ref<Notification[]>([]);

// 计算属性
const hasNotifications = computed(() => recentNotifications.value.length > 0);
const unreadCount = computed(() => notificationStore.unreadCount);

/**
 * 获取通知类型图标
 * @param type 通知类型
 * @returns 图标字符串
 */
const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    LIKE: '❤️',
    COMMENT: '💬',
    FOLLOW: '👤',
    SYSTEM: '🔔',
  };
  return icons[type] || '📢';
};

/**
 * 获取通知类型颜色
 * @param type 通知类型
 * @returns 颜色类名
 */
const getNotificationColor = (type: string): string => {
  const colors: Record<string, string> = {
    LIKE: 'notification-item--like',
    COMMENT: 'notification-item--comment',
    FOLLOW: 'notification-item--follow',
    SYSTEM: 'notification-item--system',
  };
  return colors[type] || '';
};

/**
 * 格式化时间
 * @param dateString 日期字符串
 * @returns 格式化后的时间字符串
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * 加载最近通知
 */
const loadRecentNotifications = async () => {
  if (isLoadingRecent.value) return;
  
  isLoadingRecent.value = true;
  
  try {
    const notifications = await notificationStore.fetchRecentNotifications(10);
    recentNotifications.value = notifications;
  } catch (error) {
    console.error('Failed to load recent notifications:', error);
    ElMessage.error('加载通知失败');
  } finally {
    isLoadingRecent.value = false;
  }
};

/**
 * 处理通知点击
 * @param notification 通知对象
 */
const handleNotificationClick = async (notification: Notification) => {
  // 标记为已读
  if (!notification.isRead) {
    try {
      await notificationStore.markAsRead(notification.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }
  
  // 关闭下拉菜单
  emit('update:visible', false);
  emit('close');
  
  // 根据通知类型导航到相应页面
  if (notification.relatedType === 'POST' && notification.relatedId) {
    router.push(`/posts/${notification.relatedId}`);
  } else if (notification.relatedType === 'USER' && notification.relatedId) {
    router.push(`/users/${notification.relatedId}`);
  } else if (notification.relatedType === 'COMMENT' && notification.relatedId) {
    // 评论通知，需要找到对应的文章
    // 这里简化处理，实际应该从通知内容中解析文章 ID
    router.push(`/posts/${notification.relatedId}`);
  }
};

/**
 * 标记所有通知为已读
 */
const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
    
    // 更新本地列表
    recentNotifications.value = recentNotifications.value.map(n => ({
      ...n,
      isRead: true,
    }));
    
    ElMessage.success('已标记所有通知为已读');
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    ElMessage.error('操作失败，请重试');
  }
};

/**
 * 查看全部通知
 */
const handleViewAll = () => {
  emit('update:visible', false);
  emit('close');
  router.push('/notifications');
};

/**
 * 关闭下拉菜单
 */
const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

// 监听 visible 变化，加载通知
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    loadRecentNotifications();
  }
});

// 组件挂载时加载通知
onMounted(() => {
  if (props.visible) {
    loadRecentNotifications();
  }
});
</script>

<template>
  <div
    v-if="visible"
    class="notification-dropdown"
    @click.stop
  >
    <!-- 头部 -->
    <div class="notification-dropdown__header">
      <h3 class="notification-dropdown__title">
        通知
        <span
          v-if="unreadCount > 0"
          class="notification-dropdown__count"
        >
          {{ unreadCount }}
        </span>
      </h3>
      
      <div class="notification-dropdown__actions">
        <button
          v-if="hasNotifications && unreadCount > 0"
          class="notification-dropdown__action-btn"
          @click="handleMarkAllAsRead"
        >
          全部已读
        </button>
        
        <button
          class="notification-dropdown__close-btn"
          @click="handleClose"
        >
          ✕
        </button>
      </div>
    </div>
    
    <!-- 通知列表 -->
    <div class="notification-dropdown__content">
      <!-- 加载状态 -->
      <div
        v-if="isLoadingRecent"
        class="notification-dropdown__loading"
      >
        <div class="notification-dropdown__spinner" />
        <p>加载中...</p>
      </div>
      
      <!-- 通知列表 -->
      <div
        v-else-if="hasNotifications"
        class="notification-list"
      >
        <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          class="notification-item"
          :class="[
            getNotificationColor(notification.type),
            { 'notification-item--unread': !notification.isRead }
          ]"
          @click="handleNotificationClick(notification)"
        >
          <!-- 通知图标 -->
          <div class="notification-item__icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          
          <!-- 通知内容 -->
          <div class="notification-item__content">
            <div class="notification-item__title">
              {{ notification.title }}
            </div>
            <div class="notification-item__text">
              {{ notification.content }}
            </div>
            <div class="notification-item__time">
              {{ formatTime(notification.createdAt) }}
            </div>
          </div>
          
          <!-- 未读标记 -->
          <div
            v-if="!notification.isRead"
            class="notification-item__unread-dot"
          />
        </div>
      </div>
      
      <!-- 空状态 -->
      <div
        v-else
        class="notification-dropdown__empty"
      >
        <div class="notification-dropdown__empty-icon">
          🔔
        </div>
        <p class="notification-dropdown__empty-text">
          暂无新通知
        </p>
      </div>
    </div>
    
    <!-- 底部 -->
    <div
      v-if="hasNotifications"
      class="notification-dropdown__footer"
    >
      <button
        class="notification-dropdown__view-all"
        @click="handleViewAll"
      >
        查看全部通知
      </button>
    </div>
  </div>
</template>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  width: 380px;
  max-width: calc(100vw - var(--space-lg) * 2);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 头部 ========== */

.notification-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

.notification-dropdown__title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.notification-dropdown__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-xs);
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  line-height: 1;
}

.notification-dropdown__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.notification-dropdown__action-btn {
  padding: var(--space-xs) var(--space-sm);
  background: none;
  border: none;
  color: var(--color-cta);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.notification-dropdown__action-btn:hover {
  background-color: var(--color-hover);
  color: var(--color-primary);
}

.notification-dropdown__close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.notification-dropdown__close-btn:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
}

/* ========== 内容区域 ========== */

.notification-dropdown__content {
  max-height: 400px;
  overflow-y: auto;
}

.notification-dropdown__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.notification-dropdown__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notification-dropdown__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
}

.notification-dropdown__empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.notification-dropdown__empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* ========== 通知列表 ========== */

.notification-list {
  padding: var(--space-xs) 0;
}

.notification-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  transition: background-color var(--transition-base);
  border-left: 3px solid transparent;
}

.notification-item:hover {
  background-color: var(--color-hover);
}

.notification-item--unread {
  background-color: var(--color-bg-secondary);
}

.notification-item--like {
  border-left-color: var(--color-danger);
}

.notification-item--comment {
  border-left-color: var(--color-cta);
}

.notification-item--follow {
  border-left-color: var(--color-success);
}

.notification-item--system {
  border-left-color: var(--color-warning);
}

.notification-item__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
}

.notification-item__content {
  flex: 1;
  min-width: 0;
}

.notification-item__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-item__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.notification-item__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.notification-item__unread-dot {
  position: absolute;
  top: var(--space-md);
  right: var(--space-lg);
  width: 8px;
  height: 8px;
  background-color: var(--color-cta);
  border-radius: 50%;
}

/* ========== 底部 ========== */

.notification-dropdown__footer {
  border-top: 1px solid var(--color-border-light);
  padding: var(--space-sm);
}

.notification-dropdown__view-all {
  width: 100%;
  padding: var(--space-sm);
  background: none;
  border: none;
  color: var(--color-cta);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.notification-dropdown__view-all:hover {
  background-color: var(--color-hover);
  color: var(--color-primary);
}

/* ========== 响应式设计 ========== */

@media (max-width: 479px) {
  .notification-dropdown {
    width: calc(100vw - var(--space-md) * 2);
    right: calc(-1 * var(--space-sm));
  }
  
  .notification-dropdown__header {
    padding: var(--space-sm) var(--space-md);
  }
  
  .notification-item {
    padding: var(--space-sm) var(--space-md);
  }
  
  .notification-item__icon {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-base);
  }
}
</style>
