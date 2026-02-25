/**
 * 消息相关 Query 和 Mutation Hooks
 * 
 * 统一导出所有消息相关的 TanStack Query hooks
 */

// Query Hooks
export { useConversationsQuery } from './useConversationsQuery';
export { useMessagesQuery } from './useMessagesQuery';

// Mutation Hooks
export { useSendMessageMutation } from './useSendMessageMutation';
export { useMarkConversationAsReadMutation } from './useMarkConversationAsReadMutation';
export { useCreateConversationMutation } from './useCreateConversationMutation';
