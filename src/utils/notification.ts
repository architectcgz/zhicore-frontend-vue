import type { Notification } from '@/types';

export interface AggregatedNotificationRecord {
  type: Notification['type'];
  targetType?: string | null;
  targetId?: string | number | null;
  totalCount: number;
  unreadCount: number;
  latestTime: string;
  latestContent?: string | null;
  aggregatedContent?: string | null;
  recentActors?: Array<{
    id?: string | number | null;
  }>;
}

const notificationTitleMap: Record<Notification['type'], string> = {
  LIKE: '收到新的点赞',
  COMMENT: '收到新的评论',
  FOLLOW: '收到新的关注',
  SYSTEM: '系统通知',
};

function normalizeRelatedType(targetType?: string | null): Notification['relatedType'] {
  const normalizedTargetType = targetType?.toUpperCase();
  if (normalizedTargetType === 'POST' || normalizedTargetType === 'COMMENT' || normalizedTargetType === 'USER') {
    return normalizedTargetType;
  }
  return undefined;
}

export function mapAggregatedNotificationRecord(record: AggregatedNotificationRecord): Notification {
  const relatedId = record.targetId != null ? String(record.targetId) : undefined;
  const relatedType = normalizeRelatedType(record.targetType);
  const actorId = record.recentActors?.find(actor => actor.id != null)?.id;

  return {
    id: `${record.type}:${relatedType ?? 'UNKNOWN'}:${relatedId ?? 'NONE'}`,
    userId: actorId != null ? String(actorId) : '',
    type: record.type,
    title: notificationTitleMap[record.type] ?? '系统通知',
    content: record.aggregatedContent || record.latestContent || '',
    relatedId,
    relatedType,
    isRead: record.unreadCount === 0,
    totalCount: record.totalCount,
    unreadCount: record.unreadCount,
    createdAt: record.latestTime,
  };
}
