import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useNotificationStore } from '@/stores/notification';
import type { Notification, NotificationType } from '@/types';
import type { NotificationGroupSection } from '@/types/notification/center';

const GROUP_TITLES: Record<NotificationGroupSection['key'], string> = {
  today: '今天',
  yesterday: '昨天',
  thisWeek: '本周',
  earlier: '更早',
};

const TYPE_ICONS: Record<NotificationType, string> = {
  LIKE: '❤️',
  COMMENT: '💬',
  FOLLOW: '👤',
  SYSTEM: '🔔',
};

const TYPE_COLORS: Record<NotificationType, string> = {
  LIKE: 'notification-card--like',
  COMMENT: 'notification-card--comment',
  FOLLOW: 'notification-card--follow',
  SYSTEM: 'notification-card--system',
};

export function useNotificationCenterContent() {
  const router = useRouter();
  const notificationStore = useNotificationStore();

  const isInitialLoading = ref(true);

  const notifications = computed<Notification[]>(() => notificationStore.notifications);
  const isLoadingMore = computed(() => notificationStore.isLoadingMore);
  const hasMore = computed(() => notificationStore.hasMore);
  const total = computed(() => notificationStore.total);
  const unreadCount = computed(() => notificationStore.unreadCount);

  const groupedSections = computed<NotificationGroupSection[]>(() => {
    const groups: Record<NotificationGroupSection['key'], Notification[]> = {
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

    notifications.value.forEach((notification) => {
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

    return (Object.keys(groups) as NotificationGroupSection['key'][])
      .map((key) => ({
        key,
        title: GROUP_TITLES[key],
        items: groups[key],
      }))
      .filter((section) => section.items.length > 0);
  });

  const getNotificationIcon = (type: NotificationType): string => TYPE_ICONS[type] ?? '📢';
  const getNotificationColor = (type: NotificationType): string => TYPE_COLORS[type] ?? '';

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

  const loadNotifications = async (append = false) => {
    try {
      if (append) {
        await notificationStore.loadMoreNotifications();
      } else {
        await notificationStore.fetchNotifications();
      }
    } catch (requestError) {
      console.error('Failed to load notifications:', requestError);
      ElMessage.error('加载通知失败');
    } finally {
      isInitialLoading.value = false;
    }
  };

  const loadMore = () => {
    if (!hasMore.value || isLoadingMore.value) {
      return;
    }

    void loadNotifications(true);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.relatedType === 'POST' && notification.relatedId) {
      void router.push(`/posts/${notification.relatedId}`);
    } else if (notification.relatedType === 'USER' && notification.relatedId) {
      void router.push(`/users/${notification.relatedId}`);
    } else if (notification.relatedType === 'COMMENT' && notification.relatedId) {
      void router.push(`/posts/${notification.relatedId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await ElMessageBox.confirm('确定要标记所有通知为已读吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      });

      await notificationStore.markAllAsRead();
      ElMessage.success('已标记所有通知为已读');
    } catch (requestError) {
      if (requestError !== 'cancel') {
        console.error('Failed to mark all as read:', requestError);
        ElMessage.error('操作失败');
      }
    }
  };

  onMounted(() => {
    void loadNotifications();
  });

  return {
    notifications,
    groupedSections,
    total,
    unreadCount,
    hasMore,
    isLoadingMore,
    isInitialLoading,
    formatTime,
    getNotificationIcon,
    getNotificationColor,
    handleNotificationClick,
    handleMarkAllAsRead,
    loadMore,
  };
}
