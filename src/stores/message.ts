/**
 * 消息 Store (已迁移到 TanStack Query)
 * 
 * 此 Store 已被重构，服务端数据管理已迁移到 TanStack Query。
 * 现在仅保留必要的客户端状态管理。
 * 
 * 服务端数据（会话列表、消息列表等）现在通过以下 Query Hooks 管理：
 * - useConversationsQuery: 获取会话列表
 * - useMessagesQuery: 获取消息列表
 * - useSendMessageMutation: 发送消息
 * - useMarkConversationAsReadMutation: 标记会话为已读
 * 
 * @deprecated 大部分功能已迁移到 TanStack Query，此 Store 仅保留客户端状态
 */

import { defineStore } from 'pinia';

/**
 * 消息客户端状态接口
 */
interface MessageClientState {
  // 当前选中的会话 ID（UI 状态）
  currentConversationId: string | null;
}

/**
 * 消息 Store
 * 
 * 职责：
 * - 管理当前选中的会话 ID（UI 状态）
 * 
 * 不再负责：
 * - ❌ 会话列表缓存（由 TanStack Query 管理）
 * - ❌ 消息列表缓存（由 TanStack Query 管理）
 * - ❌ 未读数量缓存（由 TanStack Query 管理）
 * - ❌ 消息去重逻辑（由 TanStack Query 管理）
 * - ❌ 序列号跟踪（由 TanStack Query 管理）
 */
export const useMessageStore = defineStore('message', {
  state: (): MessageClientState => ({
    currentConversationId: null,
  }),

  getters: {
    /**
     * 是否有选中的会话
     */
    hasCurrentConversation: (state): boolean => {
      return state.currentConversationId !== null;
    },
  },

  actions: {
    /**
     * 设置当前会话
     * @param conversationId 会话 ID
     */
    setCurrentConversation(conversationId: string | null): void {
      this.currentConversationId = conversationId;
    },

    /**
     * 清空当前会话
     */
    clearCurrentConversation(): void {
      this.currentConversationId = null;
    },

    /**
     * 重置状态
     */
    resetState(): void {
      this.currentConversationId = null;
    },
  },
});
