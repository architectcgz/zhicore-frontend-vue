# Message Query Hooks

消息相关的 TanStack Query hooks，用于管理私信和会话数据的获取和缓存。

## 功能特性

- ✅ 自动缓存管理
- ✅ 实时轮询更新
- ✅ 加载状态管理
- ✅ 错误处理
- ✅ 乐观更新
- ✅ 类型安全

## Query Hooks

### useConversationsQuery

获取会话列表，支持实时轮询。

**特性**:
- 支持分页和排序
- 自动轮询（10秒间隔）
- staleTime: 30 秒

**使用示例**:

```typescript
import { useConversationsQuery } from '@/queries/messages';

// 基础用法
const { data, isLoading, error } = useConversationsQuery();

// 带参数
const { data } = useConversationsQuery(ref({
  page: 1,
  size: 20,
  sort: 'latest'
}));
```

### useMessagesQuery

获取指定会话的消息列表，支持实时轮询。

**特性**:
- 支持按会话 ID 查询消息
- 自动轮询（5秒间隔）
- staleTime: 10 秒
- 仅在 conversationId 存在时启用

**使用示例**:

```typescript
import { useMessagesQuery } from '@/queries/messages';

// 基础用法
const conversationId = ref('conversation-123');
const { data, isLoading } = useMessagesQuery(conversationId);

// 带参数
const { data } = useMessagesQuery(conversationId, ref({
  page: 1,
  size: 50,
  sort: 'latest'
}));
```

## Mutation Hooks

### useSendMessageMutation

发送消息，支持乐观更新。

**特性**:
- ✅ 乐观更新：立即添加临时消息到列表
- ✅ 自动回滚：失败时恢复之前的状态
- ✅ 缓存失效：成功后自动刷新消息列表和会话列表

**使用示例**:

```typescript
import { useSendMessageMutation } from '@/queries/messages';

const { mutate: sendMessage, isPending } = useSendMessageMutation();

const handleSend = () => {
  sendMessage({
    receiverId: 'user-123',
    content: 'Hello!',
    conversationId: 'conversation-456',
    messageType: 'TEXT'
  });
};
```

### useMarkConversationAsReadMutation

标记会话为已读。

**特性**:
- ✅ 自动失效会话列表缓存
- ✅ 更新未读数量

**使用示例**:

```typescript
import { useMarkConversationAsReadMutation } from '@/queries/messages';

const { mutate: markAsRead } = useMarkConversationAsReadMutation();

const handleMarkAsRead = (conversationId: string) => {
  markAsRead(conversationId);
};
```

### useCreateConversationMutation

创建或获取与指定用户的会话。

**特性**:
- ✅ 自动失效会话列表缓存
- ✅ 将新会话添加到缓存
- ✅ 成功提示

**使用示例**:

```typescript
import { useCreateConversationMutation } from '@/queries/messages';
import { useRouter } from 'vue-router';

const router = useRouter();
const { mutate: createConversation, isPending } = useCreateConversationMutation();

const handleStartChat = (userId: string) => {
  createConversation(userId, {
    onSuccess: (conversation) => {
      router.push(`/messages?conversation=${conversation.id}`);
    }
  });
};
```

## 缓存策略

| Hook | Stale Time | Refetch Interval | 说明 |
|------|-----------|------------------|------|
| useConversationsQuery | 30 秒 | 10 秒 | 会话列表需要实时更新 |
| useMessagesQuery | 10 秒 | 5 秒 | 消息需要更频繁的更新 |

## Query Keys

所有消息查询使用统一的 query key 结构：

```typescript
// 会话列表
queryKeys.messages.conversationsList(params)
// 例如: ['messages', 'conversations', { page: 1, size: 20 }]

// 特定会话
queryKeys.messages.conversation(conversationId)
// 例如: ['messages', 'conversations', 'conversation-123']

// 消息列表
queryKeys.messages.messagesList(conversationId, params)
// 例如: ['messages', 'list', 'conversation-123', { page: 1, size: 50 }]

// 未读数量
queryKeys.messages.unreadCount()
// 例如: ['messages', 'unreadCount']
```

## 错误处理

所有 hooks 都集成了全局错误处理：

- 自动使用 `NetworkErrorClassifier` 分类错误
- 自动使用 `ErrorMessageGenerator` 生成用户友好的错误消息
- 自动显示错误提示（通过 ElMessage）
- 开发环境下记录详细错误日志

## 最佳实践

### 1. 使用响应式参数

```typescript
// ✅ 推荐：使用 ref
const conversationId = ref('conversation-123');
const { data } = useMessagesQuery(conversationId);

// ❌ 不推荐：使用普通值（无法响应变化）
const { data } = useMessagesQuery('conversation-123');
```

### 2. 条件查询

```typescript
// 只有当 conversationId 存在时才查询
const conversationId = ref<string | null>(null);
const { data } = useMessagesQuery(conversationId); // 自动处理 enabled
```

### 3. 乐观更新

```typescript
// 发送消息时使用乐观更新
const { mutate: sendMessage } = useSendMessageMutation();

// 不需要 await，立即更新 UI
sendMessage({
  receiverId: 'user-123',
  content: 'Hello!',
  conversationId: 'conversation-456'
});
```

### 4. 手动刷新

```typescript
const { data, refetch } = useConversationsQuery();

// 手动刷新会话列表
const refresh = async () => {
  await refetch();
};
```

## 完整示例：消息中心组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  useConversationsQuery,
  useMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation
} from '@/queries/messages';

// 查询会话列表
const { data: conversationsData, isLoading: isLoadingConversations } = useConversationsQuery();
const conversations = computed(() => conversationsData.value?.items || []);

// 当前选中的会话
const currentConversationId = ref<string | null>(null);

// 查询消息列表
const { data: messagesData, isLoading: isLoadingMessages } = useMessagesQuery(currentConversationId);
const messages = computed(() => messagesData.value?.items || []);

// 发送消息
const { mutate: sendMessage, isPending: isSending } = useSendMessageMutation();
const messageContent = ref('');

const handleSend = () => {
  if (!messageContent.value.trim() || !currentConversationId.value) return;
  
  const conversation = conversations.value.find(c => c.id === currentConversationId.value);
  if (!conversation) return;
  
  const otherUser = conversation.participants.find(p => p.id !== 'current-user-id');
  if (!otherUser) return;
  
  sendMessage({
    receiverId: otherUser.id,
    content: messageContent.value.trim(),
    conversationId: currentConversationId.value
  });
  
  messageContent.value = '';
};

// 标记已读
const { mutate: markAsRead } = useMarkConversationAsReadMutation();

const selectConversation = (conversationId: string) => {
  currentConversationId.value = conversationId;
  markAsRead(conversationId);
};
</script>

<template>
  <div class="message-center">
    <!-- 会话列表 -->
    <div class="conversations">
      <div v-if="isLoadingConversations">加载中...</div>
      <div 
        v-for="conversation in conversations" 
        :key="conversation.id"
        @click="selectConversation(conversation.id)"
        :class="{ active: currentConversationId === conversation.id }"
        class="conversation-item"
      >
        <div class="conversation-info">
          <span class="name">{{ conversation.participants[0].nickname }}</span>
          <span class="last-message">{{ conversation.lastMessage?.content }}</span>
        </div>
        <span v-if="conversation.unreadCount > 0" class="unread-badge">
          {{ conversation.unreadCount }}
        </span>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages">
      <div v-if="!currentConversationId" class="empty">
        请选择一个会话
      </div>
      <div v-else>
        <div v-if="isLoadingMessages">加载中...</div>
        <div v-else class="message-list">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="{ 
              'message-item': true,
              'sent': message.senderId === 'current-user-id',
              'received': message.senderId !== 'current-user-id'
            }"
          >
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ message.createdAt }}</div>
          </div>
        </div>

        <!-- 发送消息 -->
        <div class="message-input">
          <textarea 
            v-model="messageContent"
            placeholder="输入消息..."
            @keydown.enter.prevent="handleSend"
            :disabled="isSending"
          />
          <button 
            @click="handleSend"
            :disabled="isSending || !messageContent.trim()"
          >
            {{ isSending ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-center {
  display: flex;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.conversations {
  width: 300px;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.conversation-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-item:hover {
  background: #f5f5f5;
}

.conversation-item.active {
  background: #e6f7ff;
}

.unread-badge {
  background: #f56c6c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 12px;
}

.messages {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-list {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.message-item {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.message-item.sent {
  align-items: flex-end;
}

.message-item.received {
  align-items: flex-start;
}

.message-content {
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 70%;
}

.message-item.sent .message-content {
  background: #409eff;
  color: white;
}

.message-item.received .message-content {
  background: #f5f5f5;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 0.5rem;
}

.message-input textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
}

.message-input button {
  padding: 0.5rem 1rem;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

## WebSocket 集成

消息功能通常需要与 WebSocket 集成以实现实时更新。在 `useMessageWebSocket.ts` 中：

```typescript
import { useQueryClient } from '@tanstack/vue-query';
import { queryKeys } from '@/queries/query-keys';

const queryClient = useQueryClient();

// 接收新消息时更新缓存
wsManager.on('message', (message: Message) => {
  // 添加消息到缓存
  const messagesQueryKey = queryKeys.messages.messagesList(message.conversationId);
  queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
    if (!old) return old;
    return {
      ...old,
      items: [...old.items, message],
    };
  });
  
  // 失效会话列表（更新最后消息和未读数）
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
});

// 消息已读时更新缓存
wsManager.on('message:read', (data: { conversationId: string; messageIds: string[] }) => {
  // 更新消息缓存
  const messagesQueryKey = queryKeys.messages.messagesList(data.conversationId);
  queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
    if (!old) return old;
    return {
      ...old,
      items: old.items.map(msg => 
        data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
      ),
    };
  });
  
  // 失效会话列表
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
});
```

## 相关文档

- [TanStack Query 文档](https://tanstack.com/query/latest/docs/vue/overview)
- [Query Keys 规范](../query-keys.ts)
- [Message API](../../api/message.ts)
- [迁移指南](.kiro/specs/message-center-tanstack-migration/design.md)

## 注意事项

1. **实时轮询**: 会话列表和消息列表都配置了自动轮询，确保数据实时性
2. **条件查询**: `useMessagesQuery` 只在 conversationId 存在时才会执行查询
3. **乐观更新**: 发送消息使用乐观更新，提供即时的用户反馈
4. **缓存共享**: 相同的 query key 会共享缓存，避免重复请求
5. **WebSocket 集成**: 建议与 WebSocket 集成以实现真正的实时更新
