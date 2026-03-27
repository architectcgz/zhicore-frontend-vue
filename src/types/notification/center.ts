import type { Notification, NotificationType } from '@/types';

export type NotificationFilterType = 'ALL' | NotificationType;
export type NotificationReadStatus = 'ALL' | 'UNREAD' | 'READ';
export type NotificationGroupKey = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

export interface NotificationGroupSection {
  key: NotificationGroupKey;
  title: string;
  items: Notification[];
}
