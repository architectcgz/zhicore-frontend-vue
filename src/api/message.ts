/**
 * 私信相关 API 接口
 * 包含会话管理、消息发送接收等功能
 */

import { httpClient } from '@/utils/request';
import type { 
  User,
  Message, 
  Conversation, 
  PaginatedResponse 
} from '@/types';

/**
 * 消息发送请求接口
 */
export interface MessageSendRequest {
  receiverId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  conversationId?: string;
}

/**
 * 会话查询参数接口
 */
export interface ConversationQueryParams {
  page?: number;
  size?: number;
  sort?: 'latest' | 'oldest';
  hasUnread?: boolean;
}

/**
 * 消息查询参数接口
 */
export interface MessageQueryParams {
  conversationId: string;
  page?: number;
  size?: number;
  sort?: 'latest' | 'oldest';
  beforeSequence?: number; // 用于分页加载历史消息
}

/**
 * 消息统计信息接口
 */
export interface MessageStats {
  totalConversations: number;
  unreadConversations: number;
  totalMessages: number;
  unreadMessages: number;
}

export interface BackendConversationDTO {
  id: string | number;
  otherUserId: string | number;
  otherUserNickName?: string | null;
  otherUserAvatarUrl?: string | null;
  lastMessageContent?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  createdAt?: string | null;
}

export interface BackendMessageDTO {
  id: string | number;
  conversationId: string | number;
  senderId: string | number;
  senderNickName?: string | null;
  senderAvatarUrl?: string | null;
  receiverId: string | number;
  type?: NonNullable<MessageSendRequest['messageType']>;
  content?: string | null;
  mediaUrl?: string | null;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string | null;
}

export interface BackendSendMessagePayload {
  receiverId: string;
  type: NonNullable<MessageSendRequest['messageType']>;
  content?: string;
  mediaUrl?: string;
}

function toId(value: string | number | null | undefined): string {
  return value == null ? '' : String(value);
}

function buildUser(id: string, nickname?: string | null, avatar?: string | null): User {
  return {
    id,
    username: nickname || `user-${id}`,
    email: '',
    nickname: nickname || `用户${id}`,
    avatar: avatar ?? null,
    bio: null,
    role: 'USER',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
    updatedAt: '',
  };
}

export function mapConversationDto(dto: BackendConversationDTO): Conversation {
  const otherUserId = toId(dto.otherUserId);
  const updatedAt = dto.lastMessageAt || dto.createdAt || '';

  return {
    id: toId(dto.id),
    participantIds: otherUserId ? [otherUserId] : [],
    participants: otherUserId
      ? [buildUser(otherUserId, dto.otherUserNickName, dto.otherUserAvatarUrl)]
      : [],
    lastMessage: dto.lastMessageContent || dto.lastMessageAt
      ? {
          id: `conversation-preview-${toId(dto.id)}`,
          conversationId: toId(dto.id),
          senderId: otherUserId,
          receiverId: '',
          content: dto.lastMessageContent || '',
          messageType: 'TEXT',
          isRead: true,
          sequence: 0,
          createdAt: updatedAt,
        }
      : undefined,
    unreadCount: dto.unreadCount ?? 0,
    updatedAt,
  };
}

export function buildConversationPage(
  conversations: BackendConversationDTO[],
): PaginatedResponse<Conversation> {
  return {
    items: conversations.map(mapConversationDto),
    total: conversations.length,
    page: 1,
    size: conversations.length,
    hasMore: false,
  };
}

export function mapMessageDto(dto: BackendMessageDTO, index: number = 0): Message {
  return {
    id: toId(dto.id),
    conversationId: toId(dto.conversationId),
    senderId: toId(dto.senderId),
    receiverId: toId(dto.receiverId),
    content: dto.content || '',
    messageType: dto.type || 'TEXT',
    isRead: dto.isRead ?? dto.read ?? false,
    sequence: index + 1,
    createdAt: dto.createdAt || '',
  };
}

export function buildMessagePage(messages: BackendMessageDTO[]): PaginatedResponse<Message> {
  return {
    items: messages.map((message, index) => mapMessageDto(message, index)),
    total: messages.length,
    page: 1,
    size: messages.length,
    hasMore: false,
  };
}

export function toSendMessagePayload(messageData: MessageSendRequest): BackendSendMessagePayload {
  const messageType = messageData.messageType || 'TEXT';

  return {
    receiverId: messageData.receiverId,
    type: messageType,
    content: messageData.content,
  };
}

function buildConversationQueryParams(params?: ConversationQueryParams): Record<string, unknown> | undefined {
  if (!params?.size) {
    return undefined;
  }

  return {
    limit: params.size,
  };
}

function buildMessageQueryParams(
  params?: Omit<MessageQueryParams, 'conversationId'>
): Record<string, unknown> | undefined {
  if (!params?.size) {
    return undefined;
  }

  return {
    limit: params.size,
  };
}

/**
 * 私信 API 服务类
 */
export class MessageApi {
  /**
   * 获取会话列表
   * @param params 查询参数
   * @returns 分页会话列表
   */
  async getConversations(params?: ConversationQueryParams): Promise<PaginatedResponse<Conversation>> {
    const response = await httpClient.get<BackendConversationDTO[]>(
      '/messages/conversations',
      buildConversationQueryParams(params)
    );
    return buildConversationPage(response);
  }

  /**
   * 根据 ID 获取会话详情
   * @param conversationId 会话 ID
   * @returns 会话详情
   */
  async getConversationById(conversationId: string): Promise<Conversation> {
    const response = await httpClient.get<BackendConversationDTO>(`/messages/conversations/${conversationId}`);
    return mapConversationDto(response);
  }

  /**
   * 创建或获取与指定用户的会话
   * @param userId 用户 ID
   * @returns 会话信息
   */
  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const response = await httpClient.get<BackendConversationDTO | null>(`/messages/conversations/user/${userId}`);
    if (!response) {
      throw new Error('会话不存在，当前后端尚未提供空会话预创建接口');
    }
    return mapConversationDto(response);
  }

  /**
   * 获取消息历史
   * @param params 查询参数
   * @returns 分页消息列表
   */
  async getMessages(params: MessageQueryParams): Promise<PaginatedResponse<Message>> {
    return this.getMessagesByConversationId(params.conversationId, params);
  }

  /**
   * 根据会话 ID 获取消息列表
   * @param conversationId 会话 ID
   * @param params 查询参数
   * @returns 分页消息列表
   */
  async getMessagesByConversationId(
    conversationId: string,
    params?: Omit<MessageQueryParams, 'conversationId'>
  ): Promise<PaginatedResponse<Message>> {
    const response = await httpClient.get<BackendMessageDTO[]>(
      `/messages/conversations/${conversationId}/messages`,
      buildMessageQueryParams(params)
    );
    return buildMessagePage(response);
  }

  /**
   * 发送消息
   * @param messageData 消息数据
   * @returns 发送的消息
   */
  async sendMessage(messageData: MessageSendRequest): Promise<Message> {
    const response = await httpClient.post<BackendMessageDTO>(
      '/messages/send',
      toSendMessagePayload(messageData)
    );
    return mapMessageDto(response);
  }

  /**
   * 标记消息为已读
   * @param messageId 消息 ID
   * @returns 更新后的消息
   */
  async markMessageAsRead(messageId: string): Promise<Message> {
    return httpClient.post<Message>(`/messages/${messageId}/read`);
  }

  /**
   * 标记会话中的所有消息为已读
   * @param conversationId 会话 ID
   * @returns 操作结果
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    return httpClient.post<void>(`/messages/conversations/${conversationId}/read`);
  }

  /**
   * 批量标记消息为已读
   * @param messageIds 消息 ID 列表
   * @returns 操作结果
   */
  async batchMarkAsRead(messageIds: string[]): Promise<{ count: number }> {
    return httpClient.post<{ count: number }>('/messages/batch-read', { messageIds });
  }

  /**
   * 删除消息
   * @param messageId 消息 ID
   */
  async deleteMessage(messageId: string): Promise<void> {
    return httpClient.delete<void>(`/messages/${messageId}`);
  }

  /**
   * 删除会话
   * @param conversationId 会话 ID
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return httpClient.delete<void>(`/messages/conversations/${conversationId}`);
  }

  /**
   * 获取未读消息数量
   * @returns 未读消息数量
   */
  async getUnreadCount(): Promise<number> {
    return httpClient.get<number>('/messages/unread/count');
  }

  /**
   * 获取消息统计信息
   * @returns 消息统计信息
   */
  async getMessageStats(): Promise<MessageStats> {
    return httpClient.get<MessageStats>('/messages/stats');
  }

  /**
   * 搜索消息
   * @param query 搜索关键词
   * @param params 查询参数
   * @returns 搜索结果
   */
  async searchMessages(
    query: string,
    params?: { 
      conversationId?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PaginatedResponse<Message>> {
    return httpClient.get<PaginatedResponse<Message>>('/messages/search', { 
      query, 
      ...params 
    });
  }

  /**
   * 获取最近联系人
   * @param limit 数量限制
   * @returns 最近联系人列表
   */
  async getRecentContacts(limit: number = 10): Promise<Conversation[]> {
    return httpClient.get<Conversation[]>('/messages/recent-contacts', { limit });
  }

  /**
   * 屏蔽用户
   * @param userId 用户 ID
   */
  async blockUser(userId: string): Promise<void> {
    return httpClient.post<void>(`/messages/block/${userId}`);
  }

  /**
   * 取消屏蔽用户
   * @param userId 用户 ID
   */
  async unblockUser(userId: string): Promise<void> {
    return httpClient.delete<void>(`/messages/block/${userId}`);
  }

  /**
   * 获取屏蔽用户列表
   * @param params 查询参数
   * @returns 屏蔽用户列表
   */
  async getBlockedUsers(params?: { page?: number; size?: number }): Promise<PaginatedResponse<any>> {
    return httpClient.get<PaginatedResponse<any>>('/messages/blocked-users', params);
  }

  /**
   * 举报消息
   * @param messageId 消息 ID
   * @param reason 举报原因
   */
  async reportMessage(messageId: string, reason: string): Promise<void> {
    return httpClient.post<void>(`/messages/${messageId}/report`, { reason });
  }

  /**
   * 撤回消息
   * @param messageId 消息 ID
   */
  async recallMessage(messageId: string): Promise<void> {
    return httpClient.post<void>(`/messages/${messageId}/recall`);
  }

  /**
   * 获取消息回执状态
   * @param messageId 消息 ID
   * @returns 回执状态
   */
  async getMessageReceipt(messageId: string): Promise<{
    sent: boolean;
    delivered: boolean;
    read: boolean;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
  }> {
    return httpClient.get(`/messages/${messageId}/receipt`);
  }
}

// 创建 API 实例
export const messageApi = new MessageApi();
