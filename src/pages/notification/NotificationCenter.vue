<!--
  通知中心页面
  显示完整的通知列表，支持按类型筛选、按时间分组、分页加载
  提供标记已读、删除等操作
-->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Notification, NotificationQueryParams } from '@/types';

// 路由和状态
const router = useRouter();
const notificationStore = useNotificationStore();

// 本地状态
const selectedType = ref<'ALL' | 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM'>('ALL');
const selectedReadStatus = ref<'ALL' | 'UNREAD' | 'READ'>('ALL');
const isInitialLoading = ref(true);

// 计算属性
const notifications = computed(() => notificationStore.notifications);
const isLoading = computed(() => notificationStore.isLoading);
const isLoadingMore = computed(() => notificationStore.isLoadingMore);
const hasMore = computed(() => notificationStore.hasMore);
const total = computed(() => notificationStore.total);
const unreadCount = computed(() => notificationStore.unreadCount);

/**
 * 按时间分组通知
 */
const groupedNotifications = computed(() => {
  const groups: Record<string, Notification[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  };
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  
  notifications.value.forEach(notification => {
    const notificationDate = new Date(notification.createdAt);
    
    if (notificationDate >= today) {
      groups.today.push(notification);
    } else if (notificationDate >= yesterday) {
      groups.yesterday.push(notification);
    } else if (notificationDate >= thisWeekStart) {
      groups.thisWeek.push(notification);
    } else {
      groups.earlier.push(notification);
    }
  });
  
  return groups;
});

/**
 * 获取通知类型图标
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
 */
const getNotificationColor = (type: string): string => {
  const colors: Record<string, string> = {
    LIKE: 'notification-card--like',
    COMMENT: 'notification-card--comment',
    FOLLOW: 'notification-card--follow',
    SYSTEM: 'notification-card--system',
  };
  return colors[type] || '';
};

/**
 * 格式化时间
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 加载通知列表
 */
const loadNotifications = async (append: boolean = false) => {
  const params: NotificationQueryParams = {
    sort: 'latest',
  };
  
  if (selectedType.value !== 'ALL') {
    params.type = selectedType.value as any;
  }
  
  if (selectedReadStatus.value === 'UNREAD') {
    params.isRead = false;
  } else if (selectedReadStatus.value === 'READ') {
    params.isRead = true;
  }
  
  try {
    if (append) {
      await notificationStore.loadMoreNotifications(params);
    } else {
      await notificationStore.fetchNotifications(params);
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
    ElMessage.error('加载通知失败');
  } finally {
    isInitialLoading.value = false;
  }
};

/**
 * 加载更多通知
 */
const loadMore = () => {
  if (!hasMore.value || isLoadingMore.value) return;
  loadNotifications(true);
};

/**
 * 处理通知点击
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
  
  // 导航到相关页面
  if (notification.relatedType === 'POST' && notification.relatedId) {
    router.push(`/posts/${notification.relatedId}`);
  } else if (notification.relatedType === 'USER' && notification.relatedId) {
    router.push(`/users/${notification.relatedId}`);
  } else if (notification.relatedType === 'COMMENT' && notification.relatedId) {
    router.push(`/posts/${notification.relatedId}`);
  }
};

/**
 * 标记通知为已读
 */
const handleMarkAsRead = async (notificationId: string) => {
  try {
    await notificationStore.markAsRead(notificationId);
    ElMessage.success('已标记为已读');
  } catch (error) {
    console.error('Failed to mark as read:', error);
    ElMessage.error('操作失败');
  }
};

/**
 * 标记所有通知为已读
 */
const handleMarkAllAsRead = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要标记所有通知为已读吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    
    await notificationStore.markAllAsRead();
    ElMessage.success('已标记所有通知为已读');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to mark all as read:', error);
      ElMessage.error('操作失败');
    }
  }
};

/**
 * 删除通知
 */
const handleDeleteNotification = async (notificationId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await notificationStore.deleteNotification(notificationId);
    ElMessage.success('通知已删除');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete notification:', error);
      ElMessage.error('删除失败');
    }
  }
};

/**
 * 清空所有通知
 */
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有通知吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await notificationStore.clearAllNotifications();
    ElMessage.success('已清空所有通知');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to clear all notifications:', error);
      ElMessage.error('操作失败');
    }
  }
};

/**
 * 处理类型筛选变化
 */
const handleTypeChange = () => {
  isInitialLoading.value = true;
  loadNotifications();
};

/**
 * 处理已读状态筛选变化
 */
const handleReadStatusChange = () => {
  isInitialLoading.value = true;
  loadNotifications();
};

// 组件挂载时加载通知
onMounted(() => {
  loadNotifications();
});
</script>

<template>
  <div class="notification-center">
    <div class="notification-center__container">
      <!-- 头部 -->
      <div class="notification-center__header">
        <h1 class="notification-center__title">
          通知中心
        </h1>
        
        <div class="notification-center__stats">
          <span class="notification-center__stat">
            共 {{ total }} 条通知
          </span>
          <span
            v-if="unreadCount > 0"
            class="notification-center__stat notification-center__stat--unread"
          >
            {{ unreadCount }} 条未读
          </span>
        </div>
      </div>
      
      <!-- 筛选栏 -->
      <div class="notification-center__filters">
        <div class="notification-center__filter-group">
          <label class="notification-center__filter-label">
            类型：
          </label>
          <div class="notification-center__filter-buttons">
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedType === 'ALL' }"
              @click="selectedType = 'ALL'; handleTypeChange()"
            >
              全部
            </button>
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedType === 'LIKE' }"
              @click="selectedType = 'LIKE'; handleTypeChange()"
            >
              ❤️ 点赞
            </button>
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedType === 'COMMENT' }"
              @click="selectedType = 'COMMENT'; handleTypeChange()"
            >
              💬 评论
            </button>
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedType === 'FOLLOW' }"
              @click="selectedType = 'FOLLOW'; handleTypeChange()"
            >
              👤 关注
            </button>
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedType === 'SYSTEM' }"
              @click="selectedType = 'SYSTEM'; handleTypeChange()"
            >
              🔔 系统
            </button>
          </div>
        </div>
        
        <div class="notification-center__filter-group">
          <label class="notification-center__filter-label">
            状态：
          </label>
          <div class="notification-center__filter-buttons">
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedReadStatus === 'ALL' }"
              @click="selectedReadStatus = 'ALL'; handleReadStatusChange()"
            >
              全部
            </button>
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedReadStatus === 'UNREAD' }"
              @click="selectedReadStatus = 'UNREAD'; handleReadStatusChange()"
            >
              未读
            </button>
            <button
              class="notification-center__filter-btn"
              :class="{ 'notification-center__filter-btn--active': selectedReadStatus === 'READ' }"
              @click="selectedReadStatus = 'READ'; handleReadStatusChange()"
            >
              已读
            </button>
          </div>
        </div>
        
        <div class="notification-center__actions">
          <button
            v-if="unreadCount > 0"
            class="notification-center__action-btn"
            @click="handleMarkAllAsRead"
          >
            全部已读
          </button>
          <button
            v-if="total > 0"
            class="notification-center__action-btn notification-center__action-btn--danger"
            @click="handleClearAll"
          >
            清空通知
          </button>
        </div>
      </div>
      
      <!-- 通知列表 -->
      <div class="notification-center__content">
        <!-- 加载状态 -->
        <div
          v-if="isInitialLoading"
          class="notification-center__loading"
        >
          <div class="notification-center__spinner" />
          <p>加载中...</p>
        </div>
        
        <!-- 通知列表 -->
        <div
          v-else-if="notifications.length > 0"
          class="notification-center__list"
        >
          <!-- 今天 -->
          <div
            v-if="groupedNotifications.today.length > 0"
            class="notification-group"
          >
            <h2 class="notification-group__title">
              今天
            </h2>
            <div
              v-for="notification in groupedNotifications.today"
              :key="notification.id"
              class="notification-card"
              :class="[
                getNotificationColor(notification.type),
                { 'notification-card--unread': !notification.isRead }
              ]"
            >
              <div
                class="notification-card__main"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-card__icon">
                  {{ getNotificationIcon(notification.type) }}
                </div>
                
                <div class="notification-card__content">
                  <div class="notification-card__title">
                    {{ notification.title }}
                  </div>
                  <div class="notification-card__text">
                    {{ notification.content }}
                  </div>
                  <div class="notification-card__time">
                    {{ formatTime(notification.createdAt) }}
                  </div>
                </div>
                
                <div
                  v-if="!notification.isRead"
                  class="notification-card__unread-dot"
                />
              </div>
              
              <div class="notification-card__actions">
                <button
                  v-if="!notification.isRead"
                  class="notification-card__action-btn"
                  @click="handleMarkAsRead(notification.id)"
                >
                  标记已读
                </button>
                <button
                  class="notification-card__action-btn notification-card__action-btn--danger"
                  @click="handleDeleteNotification(notification.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 昨天 -->
          <div
            v-if="groupedNotifications.yesterday.length > 0"
            class="notification-group"
          >
            <h2 class="notification-group__title">
              昨天
            </h2>
            <div
              v-for="notification in groupedNotifications.yesterday"
              :key="notification.id"
              class="notification-card"
              :class="[
                getNotificationColor(notification.type),
                { 'notification-card--unread': !notification.isRead }
              ]"
            >
              <div
                class="notification-card__main"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-card__icon">
                  {{ getNotificationIcon(notification.type) }}
                </div>
                
                <div class="notification-card__content">
                  <div class="notification-card__title">
                    {{ notification.title }}
                  </div>
                  <div class="notification-card__text">
                    {{ notification.content }}
                  </div>
                  <div class="notification-card__time">
                    {{ formatTime(notification.createdAt) }}
                  </div>
                </div>
                
                <div
                  v-if="!notification.isRead"
                  class="notification-card__unread-dot"
                />
              </div>
              
              <div class="notification-card__actions">
                <button
                  v-if="!notification.isRead"
                  class="notification-card__action-btn"
                  @click="handleMarkAsRead(notification.id)"
                >
                  标记已读
                </button>
                <button
                  class="notification-card__action-btn notification-card__action-btn--danger"
                  @click="handleDeleteNotification(notification.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 本周 -->
          <div
            v-if="groupedNotifications.thisWeek.length > 0"
            class="notification-group"
          >
            <h2 class="notification-group__title">
              本周
            </h2>
            <div
              v-for="notification in groupedNotifications.thisWeek"
              :key="notification.id"
              class="notification-card"
              :class="[
                getNotificationColor(notification.type),
                { 'notification-card--unread': !notification.isRead }
              ]"
            >
              <div
                class="notification-card__main"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-card__icon">
                  {{ getNotificationIcon(notification.type) }}
                </div>
                
                <div class="notification-card__content">
                  <div class="notification-card__title">
                    {{ notification.title }}
                  </div>
                  <div class="notification-card__text">
                    {{ notification.content }}
                  </div>
                  <div class="notification-card__time">
                    {{ formatTime(notification.createdAt) }}
                  </div>
                </div>
                
                <div
                  v-if="!notification.isRead"
                  class="notification-card__unread-dot"
                />
              </div>
              
              <div class="notification-card__actions">
                <button
                  v-if="!notification.isRead"
                  class="notification-card__action-btn"
                  @click="handleMarkAsRead(notification.id)"
                >
                  标记已读
                </button>
                <button
                  class="notification-card__action-btn notification-card__action-btn--danger"
                  @click="handleDeleteNotification(notification.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 更早 -->
          <div
            v-if="groupedNotifications.earlier.length > 0"
            class="notification-group"
          >
            <h2 class="notification-group__title">
              更早
            </h2>
            <div
              v-for="notification in groupedNotifications.earlier"
              :key="notification.id"
              class="notification-card"
              :class="[
                getNotificationColor(notification.type),
                { 'notification-card--unread': !notification.isRead }
              ]"
            >
              <div
                class="notification-card__main"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-card__icon">
                  {{ getNotificationIcon(notification.type) }}
                </div>
                
                <div class="notification-card__content">
                  <div class="notification-card__title">
                    {{ notification.title }}
                  </div>
                  <div class="notification-card__text">
                    {{ notification.content }}
                  </div>
                  <div class="notification-card__time">
                    {{ formatTime(notification.createdAt) }}
                  </div>
                </div>
                
                <div
                  v-if="!notification.isRead"
                  class="notification-card__unread-dot"
                />
              </div>
              
              <div class="notification-card__actions">
                <button
                  v-if="!notification.isRead"
                  class="notification-card__action-btn"
                  @click="handleMarkAsRead(notification.id)"
                >
                  标记已读
                </button>
                <button
                  class="notification-card__action-btn notification-card__action-btn--danger"
                  @click="handleDeleteNotification(notification.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div
            v-if="hasMore"
            class="notification-center__load-more"
          >
            <button
              class="notification-center__load-more-btn"
              :disabled="isLoadingMore"
              @click="loadMore"
            >
              <span v-if="isLoadingMore">加载中...</span>
              <span v-else>加载更多</span>
            </button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div
          v-else
          class="notification-center__empty"
        >
          <div class="notification-center__empty-icon">
            🔔
          </div>
          <p class="notification-center__empty-text">
            暂无通知
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-center {
  min-height: calc(100vh - 80px);
  background-color: var(--color-bg-secondary);
  padding: var(--space-xl) 0;
}

.notification-center__container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* ========== 头部 ========== */

.notification-center__header {
  margin-bottom: var(--space-xl);
}

.notification-center__title {
  font-family: var(--font-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-md) 0;
}

.notification-center__stats {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.notification-center__stat {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.notification-center__stat--unread {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

/* ========== 筛选栏 ========== */

.notification-center__filters {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-sm);
}

.notification-center__filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.notification-center__filter-group:last-of-type {
  margin-bottom: 0;
}

.notification-center__filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  white-space: nowrap;
}

.notification-center__filter-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.notification-center__filter-btn {
  padding: var(--space-xs) var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.notification-center__filter-btn:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
  color: var(--color-text);
}

.notification-center__filter-btn--active {
  background-color: var(--color-cta);
  border-color: var(--color-cta);
  color: var(--color-text-inverse);
}

.notification-center__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.notification-center__action-btn {
  padding: var(--space-sm) var(--space-lg);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-center__action-btn:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
}

.notification-center__action-btn--danger {
  color: var(--color-danger);
}

.notification-center__action-btn--danger:hover {
  background-color: var(--color-danger-light);
  border-color: var(--color-danger);
}

/* ========== 内容区域 ========== */

.notification-center__content {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.notification-center__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  color: var(--color-text-secondary);
}

.notification-center__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--space-lg);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notification-center__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  text-align: center;
}

.notification-center__empty-icon {
  font-size: 64px;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.notification-center__empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

/* ========== 通知分组 ========== */

.notification-group {
  padding: var(--space-lg) 0;
}

.notification-group:not(:last-child) {
  border-bottom: 1px solid var(--color-border-light);
}

.notification-group__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 var(--space-lg) var(--space-md) var(--space-lg);
}

/* ========== 通知卡片 ========== */

.notification-card {
  position: relative;
  border-left: 3px solid transparent;
  transition: background-color var(--transition-base);
}

.notification-card:not(:last-child) {
  border-bottom: 1px solid var(--color-border-light);
}

.notification-card:hover {
  background-color: var(--color-hover);
}

.notification-card--unread {
  background-color: var(--color-bg-secondary);
}

.notification-card--like {
  border-left-color: var(--color-danger);
}

.notification-card--comment {
  border-left-color: var(--color-cta);
}

.notification-card--follow {
  border-left-color: var(--color-success);
}

.notification-card--system {
  border-left-color: var(--color-warning);
}

.notification-card__main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-lg);
  cursor: pointer;
}

.notification-card__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xl);
}

.notification-card__content {
  flex: 1;
  min-width: 0;
}

.notification-card__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.notification-card__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
  line-height: 1.5;
}

.notification-card__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.notification-card__unread-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  background-color: var(--color-cta);
  border-radius: 50%;
  margin-top: var(--space-sm);
}

.notification-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-lg) var(--space-lg) calc(var(--space-lg) + 48px + var(--space-md));
}

.notification-card__action-btn {
  padding: var(--space-xs) var(--space-md);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-card__action-btn:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
  color: var(--color-text);
}

.notification-card__action-btn--danger {
  color: var(--color-danger);
}

.notification-card__action-btn--danger:hover {
  background-color: var(--color-danger-light);
  border-color: var(--color-danger);
}

/* ========== 加载更多 ========== */

.notification-center__load-more {
  padding: var(--space-lg);
  text-align: center;
  border-top: 1px solid var(--color-border-light);
}

.notification-center__load-more-btn {
  padding: var(--space-sm) var(--space-xl);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-center__load-more-btn:hover:not(:disabled) {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
}

.notification-center__load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== 响应式设计 ========== */

@media (max-width: 767px) {
  .notification-center {
    padding: var(--space-lg) 0;
  }
  
  .notification-center__container {
    padding: 0 var(--space-md);
  }
  
  .notification-center__title {
    font-size: var(--font-size-2xl);
  }
  
  .notification-center__filters {
    padding: var(--space-md);
  }
  
  .notification-center__filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .notification-center__filter-buttons {
    width: 100%;
  }
  
  .notification-center__filter-btn {
    flex: 1;
    min-width: 0;
  }
  
  .notification-center__actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .notification-center__action-btn {
    width: 100%;
  }
  
  .notification-card__main {
    padding: var(--space-md);
  }
  
  .notification-card__icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-lg);
  }
  
  .notification-card__actions {
    padding: 0 var(--space-md) var(--space-md) calc(var(--space-md) + 40px + var(--space-md));
  }
}
</style>
