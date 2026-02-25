# useComment Composable Migration Guide

## Overview

The `useComment` composable has been refactored to use TanStack Query hooks, eliminating manual state management and leveraging automatic caching, optimistic updates, and error handling.

## Key Changes

### 1. Data Management

**Before:**
```typescript
const comments = ref<Comment[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const totalComments = ref(0);
const hasMore = ref(false);
```

**After:**
```typescript
// TanStack Query manages all data state
const commentsQuery = useInfiniteCommentsQuery(postId, queryParams);

// Derived computed properties
const comments = computed(() => {
  if (!commentsQuery.data.value) return [];
  return commentsQuery.data.value.pages.flatMap(page => page.items);
});
```

### 2. Loading Comments

**Before:**
```typescript
const loadComments = async (reset = false): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;
    // Manual API call and state management
    const response = await commentApi.getCommentsByPostId(postId, {...});
    comments.value = reset ? response.items : [...comments.value, ...response.items];
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};
```

**After:**
```typescript
// TanStack Query handles everything automatically
// No manual loadComments needed - data loads automatically
// Use refresh() to manually refetch
const refresh = async (): Promise<void> => {
  await commentsQuery.refetch();
};
```

### 3. Pagination

**Before:**
```typescript
const loadMore = async (): Promise<void> => {
  if (loading.value || !hasMore.value) return;
  currentPage.value++;
  await loadComments(false);
};
```

**After:**
```typescript
const loadMore = async (): Promise<void> => {
  if (commentsQuery.hasNextPage.value && !commentsQuery.isFetchingNextPage.value) {
    await commentsQuery.fetchNextPage();
  }
};
```

### 4. Creating Comments

**Before:**
```typescript
const createComment = async (content: string, parentId?: string): Promise<Comment> => {
  try {
    const commentData = { postId, content: content.trim(), parentId };
    const newComment = await commentApi.createComment(commentData);
    addComment(newComment); // Manual state update
    return newComment;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};
```

**After:**
```typescript
const createComment = async (content: string, parentId?: string): Promise<Comment> => {
  const commentData = { postId, content: content.trim(), parentId };
  // Mutation handles optimistic updates and cache invalidation automatically
  return await createCommentMutation.mutateAsync(commentData);
};
```

### 5. Optimistic Updates

**Before:**
```typescript
const toggleLike = async (commentId: string): Promise<void> => {
  const comment = findCommentById(commentId);
  if (!comment) return;

  // Manual optimistic update
  const wasLiked = comment.isLiked;
  comment.isLiked = !wasLiked;
  comment.likeCount += wasLiked ? -1 : 1;

  try {
    if (wasLiked) {
      await commentApi.unlikeComment(commentId);
    } else {
      await commentApi.likeComment(commentId);
    }
  } catch (err) {
    // Manual rollback
    comment.isLiked = wasLiked;
    comment.likeCount += wasLiked ? 1 : -1;
    throw new Error(getErrorMessage(err));
  }
};
```

**After:**
```typescript
const toggleLike = async (commentId: string): Promise<void> => {
  const comment = findCommentById(commentId);
  if (!comment) return;

  // Mutation handles optimistic updates and rollback automatically
  await likeCommentMutation.mutateAsync({
    commentId,
    isLiked: comment.isLiked,
    postId,
  });
};
```

### 6. Deleting Comments

**Before:**
```typescript
const removeComment = async (commentId: string): Promise<void> => {
  try {
    await commentApi.deleteComment(commentId);
    removeCommentById(commentId); // Manual state update
    totalComments.value--;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};
```

**After:**
```typescript
const removeComment = async (commentId: string): Promise<void> => {
  // Mutation handles optimistic removal and cache invalidation automatically
  await deleteCommentMutation.mutateAsync({
    commentId,
    postId,
  });
};
```

## API Changes

### Removed Properties/Methods

- `loading` - Use `isLoading` instead
- `error` - Use `error` (same name, but from TanStack Query)
- `hasMore` - Use `hasNextPage` instead
- `loadComments()` - Data loads automatically, use `refresh()` to manually refetch
- `addComment()` - No longer needed, mutations handle cache updates
- `removeCommentById()` - Internal helper, no longer needed
- `removeCommentFromReplies()` - Internal helper, no longer needed

### New Properties

- `isLoading` - Loading state from TanStack Query
- `isError` - Error state from TanStack Query
- `isFetchingNextPage` - Loading state for pagination
- `hasNextPage` - Whether more pages are available
- `isCreating` - Creating comment mutation state
- `isDeleting` - Deleting comment mutation state
- `isLiking` - Liking comment mutation state
- `commentsQuery` - Raw TanStack Query object for advanced use cases

### Changed Methods

- `loadReplies(commentId)` - Now returns a query object instead of modifying comment directly

## Migration Steps for Components

### Step 1: Update State References

```typescript
// Before
const { comments, loading, error, hasMore } = useComment({ postId });

// After
const { comments, isLoading, isError, error, hasNextPage } = useComment({ postId });
```

### Step 2: Update Loading Checks

```typescript
// Before
if (loading.value) { /* ... */ }

// After
if (isLoading.value) { /* ... */ }
```

### Step 3: Update Pagination

```typescript
// Before
<button @click="loadMore" :disabled="!hasMore || loading">

// After
<button @click="loadMore" :disabled="!hasNextPage || isFetchingNextPage">
```

### Step 4: Remove Manual Load Calls

```typescript
// Before
onMounted(async () => {
  await loadComments(true);
});

// After
// No need - TanStack Query loads data automatically
onMounted(() => {
  // Component ready
});
```

### Step 5: Update Error Handling

```typescript
// Before
if (error.value) {
  ElMessage.error(error.value);
}

// After
if (isError.value && error.value) {
  // Error messages are handled by TanStack Query global error handler
  // But you can still show custom messages if needed
  ElMessage.error(error.value.message);
}
```

## Benefits

1. **Automatic Caching**: Comments are cached and reused across components
2. **Optimistic Updates**: UI updates immediately, rolls back on error
3. **Background Refetching**: Data stays fresh automatically
4. **Less Boilerplate**: No manual loading/error state management
5. **Better Performance**: Structural sharing and smart re-renders
6. **Consistent Error Handling**: Global error handler for all queries/mutations

## Breaking Changes

### 1. `loadReplies` Return Value

**Before:**
```typescript
await loadReplies(commentId); // Modifies comment.replies directly
```

**After:**
```typescript
const repliesQuery = loadReplies(commentId); // Returns query object
// Access replies via repliesQuery.data.value
```

### 2. Initial Load

**Before:**
```typescript
// Must call loadComments() manually
onMounted(() => {
  loadComments(true);
});
```

**After:**
```typescript
// Data loads automatically when component mounts
// No manual call needed
```

### 3. Error Type

**Before:**
```typescript
error.value // string | null
```

**After:**
```typescript
error.value // Error | null
error.value?.message // string
```

## Example: Complete Component Migration

### Before

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useComment } from '@/composables/useComment';

const postId = '123';
const {
  comments,
  loading,
  error,
  hasMore,
  loadComments,
  loadMore,
  createComment,
  toggleLike,
} = useComment({ postId });

onMounted(() => {
  loadComments(true);
});

const handleSubmit = async (content: string) => {
  try {
    await createComment(content);
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <CommentList :comments="comments" @like="toggleLike" />
    <button @click="loadMore" :disabled="!hasMore || loading">
      Load More
    </button>
  </div>
</template>
```

### After

```vue
<script setup lang="ts">
import { useComment } from '@/composables/useComment';

const postId = '123';
const {
  comments,
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  loadMore,
  createComment,
  toggleLike,
} = useComment({ postId });

// No need for onMounted - data loads automatically

const handleSubmit = async (content: string) => {
  try {
    await createComment(content);
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">{{ error?.message }}</div>
  <div v-else>
    <CommentList :comments="comments" @like="toggleLike" />
    <button 
      @click="loadMore" 
      :disabled="!hasNextPage || isFetchingNextPage"
      :loading="isFetchingNextPage"
    >
      Load More
    </button>
  </div>
</template>
```

## Testing Changes

### Before

```typescript
// Mock API calls
vi.mock('@/api/comment', () => ({
  commentApi: {
    getCommentsByPostId: vi.fn(),
    createComment: vi.fn(),
  },
}));
```

### After

```typescript
// Mock TanStack Query
import { QueryClient } from '@tanstack/vue-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Provide query client in tests
```

## Troubleshooting

### Issue: Comments not loading

**Solution**: Ensure `postId` is provided and not empty. TanStack Query won't execute queries with empty/falsy keys.

### Issue: Optimistic updates not working

**Solution**: Check that mutations are using the correct `postId` for cache invalidation.

### Issue: Stale data showing

**Solution**: Adjust `staleTime` in query configuration or manually call `refresh()`.

## Related Documentation

- [TanStack Query Migration Guide](../../../.kiro/specs/tanstack-query-migration/design.md)
- [usePost Migration Guide](./usePost.migration.md)
- [Query Keys Documentation](../queries/query-keys.ts)
