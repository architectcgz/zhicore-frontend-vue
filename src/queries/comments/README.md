# Comment Query Hooks

评论相关的 TanStack Query hooks，用于管理评论数据的获取和缓存。

## 功能特性

- ✅ 自动缓存管理
- ✅ 后台数据同步
- ✅ 加载状态管理
- ✅ 错误处理
- ✅ 支持分页和无限滚动
- ✅ 类型安全

## Hooks 列表

### useCommentsQuery

获取评论列表（分页）。

**特性**:
- 支持按文章 ID 查询评论
- 支持分页和排序
- staleTime: 1 分钟

**使用示例**:

```typescript
import { useCommentsQuery } from '@/queries/comments';

// 基础用法
const { data, isLoading, error } = useCommentsQuery('post-123');

// 带参数
const { data } = useCommentsQuery('post-123', ref({
  page: 1,
  size: 20,
  sort: 'latest'
}));

// 响应式 postId
const postId = ref('post-123');
const { data } = useCommentsQuery(postId);
```

### useInfiniteCommentsQuery

获取评论列表（无限滚动）。

**特性**:
- 支持无限滚动加载更多评论
- 自动管理分页状态
- staleTime: 1 分钟

**使用示例**:

```typescript
import { useInfiniteCommentsQuery } from '@/queries/comments';

const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage,
  isLoading 
} = useInfiniteCommentsQuery('post-123', ref({
  size: 20,
  sort: 'latest'
}));

// 加载更多
const loadMore = () => {
  if (hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
};

// 访问所有页面的数据
const allComments = computed(() => 
  data.value?.pages.flatMap(page => page.items) ?? []
);
```

### useCommentRepliesQuery

获取评论的回复列表。

**特性**:
- 支持获取指定评论的回复
- 支持分页和排序
- staleTime: 1 分钟

**使用示例**:

```typescript
import { useCommentRepliesQuery } from '@/queries/comments';

const { data, isLoading } = useCommentRepliesQuery('comment-123', ref({
  page: 1,
  size: 10,
  sort: 'latest'
}));
```

### useHotCommentsQuery

获取热门评论列表。

**特性**:
- 支持获取指定文章的热门评论
- 支持分页
- staleTime: 2 分钟（热门评论更新较慢）

**使用示例**:

```typescript
import { useHotCommentsQuery } from '@/queries/comments';

const { data, isLoading } = useHotCommentsQuery('post-123', ref({
  page: 1,
  size: 10
}));
```

## 缓存策略

| Hook | Stale Time | 说明 |
|------|-----------|------|
| useCommentsQuery | 1 分钟 | 评论更新较频繁 |
| useInfiniteCommentsQuery | 1 分钟 | 评论更新较频繁 |
| useCommentRepliesQuery | 1 分钟 | 回复更新较频繁 |
| useHotCommentsQuery | 2 分钟 | 热门评论更新较慢 |

## Query Keys

所有评论查询使用统一的 query key 结构：

```typescript
// 评论列表
queryKeys.comments.list(postId, params)
// 例如: ['comments', 'list', 'post-123', { page: 1, size: 20 }]

// 评论回复
queryKeys.comments.replies(commentId)
// 例如: ['comments', 'replies', 'comment-123']

// 热门评论
queryKeys.comments.hot(postId)
// 例如: ['comments', 'hot', 'post-123']
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
const postId = ref('post-123');
const params = ref({ page: 1, size: 20 });
const { data } = useCommentsQuery(postId, params);

// ❌ 不推荐：使用普通值（无法响应变化）
const { data } = useCommentsQuery('post-123', { page: 1, size: 20 });
```

### 2. 条件查询

```typescript
// 只有当 postId 存在时才查询
const postId = ref<string | null>(null);
const { data } = useCommentsQuery(postId); // enabled 会自动处理

// 手动控制 enabled
const shouldFetch = ref(false);
const { data } = useCommentsQuery('post-123', undefined, {
  enabled: shouldFetch
});
```

### 3. 无限滚动实现

```typescript
<template>
  <div>
    <CommentItem 
      v-for="comment in allComments" 
      :key="comment.id" 
      :comment="comment" 
    />
    
    <button 
      v-if="hasNextPage" 
      @click="loadMore"
      :disabled="isFetchingNextPage"
    >
      {{ isFetchingNextPage ? '加载中...' : '加载更多' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useInfiniteCommentsQuery } from '@/queries/comments';

const props = defineProps<{ postId: string }>();

const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage 
} = useInfiniteCommentsQuery(props.postId);

const allComments = computed(() => 
  data.value?.pages.flatMap(page => page.items) ?? []
);

const loadMore = () => {
  if (hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
};
</script>
```

### 4. 手动刷新

```typescript
const { data, refetch } = useCommentsQuery('post-123');

// 手动刷新
const refresh = async () => {
  await refetch();
};
```

## 相关文档

- [TanStack Query 文档](https://tanstack.com/query/latest/docs/vue/overview)
- [Query Keys 规范](../query-keys.ts)
- [Comment API](../../api/comment.ts)
- [迁移指南](../../../TANSTACK_QUERY_MIGRATION.md)

## 注意事项

1. **Stale Time**: 评论数据的 stale time 设置为 1-2 分钟，适合大多数场景。如需实时性更高，可以使用 `refetchInterval`。

2. **Enabled 条件**: 所有 hooks 都会检查必需参数（如 postId）是否存在，只有存在时才会执行查询。

3. **类型安全**: 所有 hooks 都提供完整的 TypeScript 类型支持，确保类型安全。

4. **缓存共享**: 相同的 query key 会共享缓存，避免重复请求。

5. **后台更新**: 当窗口重新获得焦点或网络重连时，过期的查询会自动刷新。


---

## Mutation Hooks

### useCreateCommentMutation

创建评论，支持乐观更新。

**特性**:
- ✅ 乐观更新：立即添加临时评论到列表
- ✅ 自动回滚：失败时恢复之前的状态
- ✅ 缓存失效：成功后自动刷新评论列表
- ✅ 支持回复评论

**使用示例**:

```typescript
import { useCreateCommentMutation } from '@/queries/comments';

const createComment = useCreateCommentMutation();

// 创建评论
const handleSubmit = async () => {
  await createComment.mutateAsync({
    postId: 'post-123',
    content: '这是一条评论'
  });
};

// 回复评论
const handleReply = async () => {
  await createComment.mutateAsync({
    postId: 'post-123',
    content: '这是一条回复',
    parentId: 'comment-456' // 父评论 ID
  });
};

// 检查加载状态
const isSubmitting = createComment.isLoading;
```

### useUpdateCommentMutation

更新评论，支持乐观更新。

**特性**:
- ✅ 乐观更新：立即更新评论内容
- ✅ 自动回滚：失败时恢复之前的状态
- ✅ 缓存失效：成功后自动刷新评论列表

**使用示例**:

```typescript
import { useUpdateCommentMutation } from '@/queries/comments';

const updateComment = useUpdateCommentMutation();

const handleUpdate = async () => {
  await updateComment.mutateAsync({
    commentId: 'comment-123',
    commentData: { content: '更新后的内容' },
    postId: 'post-456'
  });
};
```

### useDeleteCommentMutation

删除评论，支持乐观更新。

**特性**:
- ✅ 乐观更新：立即从列表中移除评论
- ✅ 自动回滚：失败时恢复之前的状态
- ✅ 缓存失效：成功后自动刷新所有评论查询

**使用示例**:

```typescript
import { useDeleteCommentMutation } from '@/queries/comments';

const deleteComment = useDeleteCommentMutation();

const handleDelete = async () => {
  if (!confirm('确定要删除这条评论吗？')) return;
  
  await deleteComment.mutateAsync({
    commentId: 'comment-123',
    postId: 'post-456'
  });
};
```

### useLikeCommentMutation

点赞/取消点赞评论，支持乐观更新。

**特性**:
- ✅ 乐观更新：立即更新点赞状态和计数
- ✅ 自动回滚：失败时恢复之前的状态
- ✅ 缓存失效：完成后自动刷新所有评论查询

**使用示例**:

```typescript
import { useLikeCommentMutation } from '@/queries/comments';

const likeComment = useLikeCommentMutation();

const handleLike = (commentId: string, isLiked: boolean) => {
  likeComment.mutate({
    commentId,
    isLiked,
    postId: 'post-456'
  });
};
```

## 完整示例：评论组件

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { 
  useInfiniteCommentsQuery,
  useCreateCommentMutation,
  useLikeCommentMutation,
  useDeleteCommentMutation
} from '@/queries/comments';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  postId: string;
}>();

const authStore = useAuthStore();

// 查询评论列表
const {
  data: commentsData,
  isLoading,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteCommentsQuery(props.postId);

// 创建评论
const createComment = useCreateCommentMutation();
const newCommentContent = ref('');

const handleSubmit = async () => {
  if (!newCommentContent.value.trim()) return;
  
  await createComment.mutateAsync({
    postId: props.postId,
    content: newCommentContent.value
  });
  
  newCommentContent.value = '';
};

// 点赞评论
const likeComment = useLikeCommentMutation();

const handleLike = (commentId: string, isLiked: boolean) => {
  likeComment.mutate({
    commentId,
    isLiked,
    postId: props.postId
  });
};

// 删除评论
const deleteComment = useDeleteCommentMutation();

const handleDelete = async (commentId: string) => {
  if (!confirm('确定要删除这条评论吗？')) return;
  
  await deleteComment.mutateAsync({
    commentId,
    postId: props.postId
  });
};

// 检查是否为评论作者
const isCommentAuthor = (comment: Comment) => {
  return authStore.userId === comment.userId;
};
</script>

<template>
  <div class="comments">
    <!-- 评论表单 -->
    <form v-if="authStore.isAuthenticated" @submit.prevent="handleSubmit">
      <textarea 
        v-model="newCommentContent"
        placeholder="写下你的评论..."
        :disabled="createComment.isLoading.value"
        rows="3"
      />
      <button 
        type="submit"
        :disabled="createComment.isLoading.value || !newCommentContent.trim()"
      >
        {{ createComment.isLoading.value ? '发送中...' : '发送' }}
      </button>
    </form>
    <div v-else class="login-prompt">
      请<router-link to="/auth/login">登录</router-link>后发表评论
    </div>

    <!-- 评论列表 -->
    <div v-if="isLoading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败</div>
    <div v-else class="comment-list">
      <div 
        v-for="page in commentsData?.pages" 
        :key="page.page"
      >
        <div 
          v-for="comment in page.items" 
          :key="comment.id"
          class="comment"
        >
          <div class="comment-header">
            <img :src="comment.user.avatar" :alt="comment.user.nickname" />
            <span class="username">{{ comment.user.nickname }}</span>
            <span class="time">{{ comment.createdAt }}</span>
          </div>
          
          <div class="comment-content">{{ comment.content }}</div>
          
          <div class="comment-actions">
            <button 
              @click="handleLike(comment.id, comment.isLiked)"
              :disabled="likeComment.isLoading.value"
              :class="{ liked: comment.isLiked }"
            >
              {{ comment.isLiked ? '已点赞' : '点赞' }} ({{ comment.likeCount }})
            </button>
            
            <button 
              v-if="isCommentAuthor(comment)"
              @click="handleDelete(comment.id)"
              :disabled="deleteComment.isLoading.value"
              class="delete-btn"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <button
        v-if="hasNextPage"
        @click="fetchNextPage"
        :disabled="isFetchingNextPage"
        class="load-more"
      >
        {{ isFetchingNextPage ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.comments {
  max-width: 800px;
  margin: 0 auto;
}

form {
  margin-bottom: 2rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

button[type="submit"] {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.comment-header img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.comment-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.comment-actions button {
  padding: 0.25rem 0.5rem;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.comment-actions button.liked {
  color: #409eff;
  border-color: #409eff;
}

.load-more {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## Mutation 最佳实践

### 1. 乐观更新

所有 mutation hooks 都实现了乐观更新，提供即时的用户反馈：

```typescript
// ✅ 推荐：使用乐观更新
const likeComment = useLikeCommentMutation();
likeComment.mutate({ commentId, isLiked, postId }); // 立即更新 UI

// ❌ 不推荐：等待服务器响应
const likeComment = useLikeCommentMutation();
await likeComment.mutateAsync({ commentId, isLiked, postId }); // UI 延迟更新
```

### 2. 错误处理

错误会自动回滚乐观更新，并显示用户友好的错误消息：

```typescript
const createComment = useCreateCommentMutation();

// 不需要手动处理错误，全局错误处理器会自动处理
createComment.mutate({
  postId: 'post-123',
  content: '评论内容'
});

// 如果需要自定义错误处理
createComment.mutate(
  { postId: 'post-123', content: '评论内容' },
  {
    onError: (error) => {
      console.log('自定义错误处理', error);
    }
  }
);
```

### 3. 加载状态

使用 `isLoading` 状态禁用按钮或显示加载指示器：

```typescript
const createComment = useCreateCommentMutation();

<button 
  :disabled="createComment.isLoading.value"
  @click="handleSubmit"
>
  {{ createComment.isLoading.value ? '提交中...' : '提交' }}
</button>
```

### 4. 成功回调

在 mutation 成功后执行额外操作：

```typescript
const createComment = useCreateCommentMutation();

createComment.mutate(
  { postId: 'post-123', content: '评论内容' },
  {
    onSuccess: (newComment) => {
      console.log('评论创建成功', newComment);
      // 执行额外操作，如清空表单、关闭对话框等
    }
  }
);
```

## Mutation 注意事项

1. **乐观更新**：所有 mutation hooks 都实现了乐观更新，提供即时的用户反馈
2. **自动回滚**：如果请求失败，会自动恢复到之前的状态
3. **缓存管理**：成功后会自动失效相关查询，确保数据同步
4. **错误处理**：错误由全局错误处理器统一处理，会显示用户友好的错误消息
5. **加载状态**：每个 mutation 都提供 `isLoading` 状态，可用于禁用按钮或显示加载指示器
6. **认证检查**：创建、更新、删除操作需要用户登录，请在 UI 层面进行检查

