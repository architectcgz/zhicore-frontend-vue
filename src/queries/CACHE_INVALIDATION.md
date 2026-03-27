# TanStack Query 缓存失效策略

本文档描述了应用中所有 mutation 操作后的缓存失效规则，确保数据一致性。

## 缓存失效原则

1. **精确失效**: 优先使失效特定的查询，而不是整个查询族
2. **相关失效**: 失效所有受影响的相关查询
3. **乐观更新**: 对于用户交互频繁的操作，使用乐观更新而不是失效
4. **避免过度失效**: 不要失效不相关的查询，以保持性能

## 文章相关缓存失效规则

### 创建文章 (useCreatePostMutation)

**失效查询**:
- `queryKeys.posts.lists()` - 所有文章列表查询

**原因**: 新文章应该出现在列表中

**实现**:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
}
```

### 更新文章 (useUpdatePostMutation)

**更新缓存**:
- `queryKeys.posts.detail(postId)` - 直接更新文章详情缓存

**失效查询**:
- `queryKeys.posts.lists()` - 文章列表（标题、摘要可能变化）

**原因**: 文章内容变化，需要更新详情和列表

**实现**:
```typescript
onSuccess: (updatedPost) => {
  queryClient.setQueryData(queryKeys.posts.detail(updatedPost.id), updatedPost);
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
}
```

### 删除文章 (useDeletePostMutation)

**移除缓存**:
- `queryKeys.posts.detail(postId)` - 移除文章详情缓存

**失效查询**:
- `queryKeys.posts.lists()` - 所有文章列表
- `queryKeys.comments.lists()` - 该文章的所有评论（如果有）

**原因**: 文章已删除，需要从所有地方移除

**实现**:
```typescript
onSuccess: (_, postId) => {
  queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
}
```

### 点赞/取消点赞文章 (useLikePostMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.posts.detail(postId)` - 在 onSettled 中失效以确保同步

**原因**: 点赞是高频操作，使用乐观更新提升用户体验

**实现**:
```typescript
onMutate: async ({ postId, isLiked }) => {
  await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });
  const previousPost = queryClient.getQueryData(queryKeys.posts.detail(postId));
  queryClient.setQueryData(queryKeys.posts.detail(postId), (old) => ({
    ...old,
    isLiked: !isLiked,
    likeCount: isLiked ? old.likeCount - 1 : old.likeCount + 1,
  }));
  return { previousPost };
},
onError: (err, { postId }, context) => {
  queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
},
onSettled: (_, __, { postId }) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
}
```

### 收藏/取消收藏文章 (useFavoritePostMutation)

**策略**: 使用乐观更新（同点赞）

**失效查询**:
- `queryKeys.posts.detail(postId)` - 在 onSettled 中失效

**原因**: 收藏是高频操作，使用乐观更新提升用户体验

## 评论相关缓存失效规则

### 创建评论 (useCreateCommentMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.comments.list(postId)` - 在 onSuccess 中失效以获取真实数据
- `queryKeys.posts.detail(postId)` - 更新文章的评论计数

**原因**: 评论创建是高频操作，乐观更新提升体验

**实现**:
```typescript
onMutate: async (commentData) => {
  const queryKey = queryKeys.comments.list(commentData.postId);
  await queryClient.cancelQueries({ queryKey });
  const previousComments = queryClient.getQueryData(queryKey);
  // 添加临时评论到列表
  queryClient.setQueryData(queryKey, (old) => ({
    ...old,
    items: [tempComment, ...old.items],
    total: old.total + 1,
  }));
  return { previousComments };
},
onError: (err, commentData, context) => {
  queryClient.setQueryData(
    queryKeys.comments.list(commentData.postId),
    context.previousComments
  );
},
onSuccess: (newComment, commentData) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(commentData.postId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(commentData.postId) });
}
```

### 更新评论 (useUpdateCommentMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.comments.all` - 在 onSettled 中失效所有评论查询

**原因**: 评论可能出现在多个列表中（文章评论、用户评论等）

### 删除评论 (useDeleteCommentMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.comments.all` - 在 onSuccess 中失效所有评论查询
- `queryKeys.posts.detail(postId)` - 更新文章的评论计数

**原因**: 评论删除后需要从所有列表中移除

### 点赞/取消点赞评论 (useLikeCommentMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.comments.all` - 在 onSettled 中失效以确保同步

**原因**: 点赞是高频操作，使用乐观更新提升用户体验

## 通知相关缓存失效规则

### 标记所有通知为已读 (useMarkAllAsReadMutation)

**失效查询**:
- `queryKeys.notifications.all` - 所有通知查询

**原因**: 批量操作，失效所有通知查询最简单

## 消息相关缓存失效规则

### 发送消息 (useSendMessageMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.messages.messagesList(conversationId)` - 在 onSuccess 中失效
- `queryKeys.messages.conversations()` - 更新会话列表（最后消息时间）

**原因**: 消息发送是高频操作，乐观更新提升体验

### 标记会话为已读 (useMarkConversationAsReadMutation)

**失效查询**:
- `queryKeys.messages.conversation(conversationId)` - 会话详情
- `queryKeys.messages.unreadCount()` - 未读消息计数

**原因**: 标记已读后需要更新会话状态和未读计数

## 用户相关缓存失效规则

### 关注/取消关注用户 (useFollowUserMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.users.detail(userId)` - 用户详情（关注者数量）
- `queryKeys.users.current()` - 当前用户（关注数量）

**原因**: 关注操作影响双方的统计数据

### 更新用户资料 (useUpdateUserMutation)

**更新缓存**:
- `queryKeys.users.current()` - 直接更新当前用户缓存

**失效查询**:
- `queryKeys.posts.lists()` - 文章列表（作者信息可能变化）
- `queryKeys.comments.all` - 评论列表（评论者信息可能变化）

**原因**: 用户信息变化可能影响多处显示

## 标签相关缓存失效规则

### 关注/取消关注标签 (useFollowTagMutation)

**策略**: 使用乐观更新

**失效查询**:
- `queryKeys.tags.detail(tagId)` - 标签详情（关注者数量）

**原因**: 关注操作影响标签的统计数据

## 管理员操作缓存失效规则

### 禁用用户 (useDisableUserMutation)

**失效查询**:
- `queryKeys.admin.users.list()` - 管理员用户列表
- `queryKeys.users.detail(userId)` - 用户详情

**原因**: 用户状态变化需要更新管理列表和详情

### 删除文章（管理员）(useAdminDeletePostMutation)

**失效查询**:
- `queryKeys.admin.posts.list()` - 管理员文章列表
- `queryKeys.posts.lists()` - 所有文章列表
- `queryKeys.posts.detail(postId)` - 文章详情

**原因**: 管理员删除影响多个列表

### 删除评论（管理员）(useAdminDeleteCommentMutation)

**失效查询**:
- `queryKeys.admin.comments.list()` - 管理员评论列表
- `queryKeys.comments.all` - 所有评论查询

**原因**: 管理员删除影响多个列表

### 处理举报 (useHandleReportMutation)

**失效查询**:
- `queryKeys.admin.reports.list()` - 举报列表
- 根据举报类型失效相关查询（文章、评论、用户）

**原因**: 处理举报可能影响被举报的内容

## 缓存失效最佳实践

### 1. 使用 invalidateQueries 的选项

```typescript
// 精确匹配
queryClient.invalidateQueries({ 
  queryKey: queryKeys.posts.detail('123'),
  exact: true 
});

// 前缀匹配（失效所有文章列表）
queryClient.invalidateQueries({ 
  queryKey: queryKeys.posts.lists() 
});

// 失效并重新获取
queryClient.invalidateQueries({ 
  queryKey: queryKeys.posts.lists(),
  refetchType: 'active' // 只重新获取活跃的查询
});
```

### 2. 乐观更新 vs 失效

**使用乐观更新的场景**:
- 高频用户交互（点赞、收藏）
- 操作成功率高
- 需要即时反馈

**使用失效的场景**:
- 低频操作（创建、删除）
- 操作可能失败
- 数据复杂，难以预测结果

### 3. 避免过度失效

```typescript
// ❌ 不好：失效所有查询
queryClient.invalidateQueries();

// ❌ 不好：失效不相关的查询
queryClient.invalidateQueries({ queryKey: ['posts'] });
queryClient.invalidateQueries({ queryKey: ['comments'] });
queryClient.invalidateQueries({ queryKey: ['users'] });

// ✅ 好：只失效相关查询
queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
```

### 4. 组合使用 setQueryData 和 invalidateQueries

```typescript
// 先更新缓存（即时反馈）
queryClient.setQueryData(queryKeys.posts.detail(postId), updatedPost);

// 再失效相关查询（确保一致性）
queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
```

### 5. 使用 onSettled 确保同步

```typescript
useMutation({
  mutationFn: likePost,
  onMutate: async () => {
    // 乐观更新
  },
  onError: () => {
    // 回滚
  },
  onSettled: () => {
    // 无论成功还是失败，都失效查询以确保同步
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
  }
});
```

## 缓存失效检查清单

在实现新的 mutation 时，检查以下问题：

- [ ] 是否需要失效相关的列表查询？
- [ ] 是否需要更新或移除详情查询？
- [ ] 是否影响其他实体的数据（如评论影响文章的评论计数）？
- [ ] 是否应该使用乐观更新而不是失效？
- [ ] 是否失效了不必要的查询？
- [ ] 是否在 onSettled 中失效以确保同步？

## 相关文档

- [缓存配置](./query-config.ts) - 缓存时间配置
- [Query Keys](./query-keys.ts) - 查询键定义
- [TanStack Query 文档](https://tanstack.com/query/latest/docs/vue/guides/invalidations-from-mutations)
