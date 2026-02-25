# 文章相关 Query 和 Mutation Hooks

本目录包含所有文章相关的 TanStack Query hooks，用于管理文章数据的获取、创建、更新和删除。

## Query Hooks（查询）

### usePostQuery
获取单个文章详情。

```typescript
const { data: post, isLoading } = usePostQuery(postId);
```

### usePostsQuery
获取文章列表（分页）。

```typescript
const { data: posts, isLoading } = usePostsQuery({ page: 1, size: 10 });
```

### useInfinitePostsQuery
获取文章列表（无限滚动）。

```typescript
const { data, fetchNextPage, hasNextPage } = useInfinitePostsQuery({ size: 10 });
```

### useHotPostsQuery
获取热门文章列表。

```typescript
const { data: hotPosts } = useHotPostsQuery({ size: 10 });
```

### useRecommendedPostsQuery
获取推荐文章列表。

```typescript
const { data: recommendedPosts } = useRecommendedPostsQuery({ size: 10 });
```

### useRelatedPostsQuery
获取相关文章列表。

```typescript
const { data: relatedPosts } = useRelatedPostsQuery(postId, { size: 5 });
```

## Mutation Hooks（变更）

### useCreatePostMutation
创建新文章。

```typescript
const createPost = useCreatePostMutation();

const handleCreate = async () => {
  await createPost.mutateAsync({
    title: '文章标题',
    content: '文章内容',
    tags: ['tag1', 'tag2'],
    status: 'PUBLISHED'
  });
};
```

**特性**:
- 成功后自动失效文章列表查询
- 将新文章添加到缓存中

### useUpdatePostMutation
更新现有文章。

```typescript
const updatePost = useUpdatePostMutation();

const handleUpdate = async () => {
  await updatePost.mutateAsync({
    postId: '123',
    postData: {
      title: '更新后的标题',
      content: '更新后的内容'
    }
  });
};
```

**特性**:
- 成功后自动更新缓存中的文章数据
- 失效文章列表查询

### useDeletePostMutation
删除文章。

```typescript
const deletePost = useDeletePostMutation();

const handleDelete = async (postId: string) => {
  await deletePost.mutateAsync(postId);
};
```

**特性**:
- 成功后从缓存中移除文章
- 失效所有相关查询（列表、热门、推荐等）

### useLikePostMutation
点赞/取消点赞文章（带乐观更新）。

```typescript
const likePost = useLikePostMutation();

const handleLike = (postId: string, isLiked: boolean) => {
  likePost.mutate({ postId, isLiked });
};
```

**特性**:
- **乐观更新**：立即更新 UI，无需等待服务器响应
- 失败时自动回滚到之前的状态
- 请求完成后失效查询以确保数据同步

### useFavoritePostMutation
收藏/取消收藏文章（带乐观更新）。

```typescript
const favoritePost = useFavoritePostMutation();

const handleFavorite = (postId: string, isFavorited: boolean) => {
  favoritePost.mutate({ postId, isFavorited });
};
```

**特性**:
- **乐观更新**：立即更新 UI，无需等待服务器响应
- 失败时自动回滚到之前的状态
- 请求完成后失效查询以确保数据同步

## 缓存策略

| Hook | Stale Time | 说明 |
|------|-----------|------|
| usePostQuery | 5 分钟 | 文章内容变化较少 |
| usePostsQuery | 2 分钟 | 列表更新频率适中 |
| useInfinitePostsQuery | 2 分钟 | 与列表查询一致 |
| useHotPostsQuery | 5 分钟 | 热门文章更新频率较低 |
| useRecommendedPostsQuery | 10 分钟 | 推荐算法更新频率最低 |
| useRelatedPostsQuery | 10 分钟 | 相关文章较为稳定 |

## 乐观更新

点赞和收藏操作使用乐观更新技术，提供即时的用户反馈：

1. **立即更新 UI**：在发送请求前就更新界面
2. **自动回滚**：如果请求失败，自动恢复到之前的状态
3. **数据同步**：请求完成后重新获取数据，确保与服务器一致

## 错误处理

所有 hooks 都集成了全局错误处理系统：
- 使用 `NetworkErrorClassifier` 分类错误
- 使用 `ErrorMessageGenerator` 生成用户友好的错误消息
- 自动显示错误提示（通过 ElMessage）
- 开发环境下记录详细的错误日志

## 使用示例

### 完整的文章详情页面

```typescript
import { usePostQuery, useLikePostMutation, useFavoritePostMutation } from '@/queries/posts';

export default defineComponent({
  setup() {
    const route = useRoute();
    const postId = computed(() => route.params.id as string);
    
    // 获取文章数据
    const { data: post, isLoading } = usePostQuery(postId);
    
    // 点赞功能
    const likePost = useLikePostMutation();
    const handleLike = () => {
      if (post.value) {
        likePost.mutate({
          postId: post.value.id,
          isLiked: post.value.isLiked
        });
      }
    };
    
    // 收藏功能
    const favoritePost = useFavoritePostMutation();
    const handleFavorite = () => {
      if (post.value) {
        favoritePost.mutate({
          postId: post.value.id,
          isFavorited: post.value.isFavorited
        });
      }
    };
    
    return {
      post,
      isLoading,
      handleLike,
      handleFavorite,
      isLiking: likePost.isLoading,
      isFavoriting: favoritePost.isLoading,
    };
  }
});
```

### 文章列表页面（无限滚动）

```typescript
import { useInfinitePostsQuery } from '@/queries/posts';

export default defineComponent({
  setup() {
    const { 
      data, 
      fetchNextPage, 
      hasNextPage, 
      isFetchingNextPage 
    } = useInfinitePostsQuery({ size: 20 });
    
    // 所有文章（扁平化）
    const posts = computed(() => 
      data.value?.pages.flatMap(page => page.items) ?? []
    );
    
    return {
      posts,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    };
  }
});
```

## 相关文档

- [TanStack Query 迁移设计文档](../../../.kiro/specs/tanstack-query-migration/design.md)
- [Query Keys 定义](../query-keys.ts)
- [文章 API](../../api/post.ts)
