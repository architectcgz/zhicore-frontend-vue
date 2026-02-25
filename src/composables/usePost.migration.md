# usePost Composable Migration Guide

## Overview

The `usePost` composable has been refactored to use TanStack Query hooks instead of manual state management. This provides automatic caching, loading states, error handling, and cache invalidation.

## Migration Summary

### What Changed

1. **Removed Manual State Management**
   - ❌ Removed: `loading`, `error`, `saving` refs
   - ✅ Replaced with: TanStack Query's built-in state management

2. **Simplified API**
   - ❌ Removed: Manual `fetchPost()` method
   - ✅ Replaced with: Automatic query execution via `usePostQuery`

3. **Direct Mutation Exposure**
   - ❌ Removed: Wrapper functions that return `Promise<Post | null>`
   - ✅ Replaced with: Direct TanStack Query mutation objects

### Before (Old API)

```typescript
const {
  post,           // Ref<Post | null>
  loading,        // Ref<boolean>
  error,          // Ref<string | null>
  saving,         // Ref<boolean>
  fetchPost,      // (id?: string) => Promise<void>
  createPost,     // (data: PostCreateRequest) => Promise<Post | null>
  updatePost,     // (id: string, data: Partial<PostCreateRequest>) => Promise<Post | null>
  deletePost,     // (id?: string) => Promise<boolean>
  saveDraft,      // (data: PostCreateRequest) => Promise<Post | null>
  updateDraft,    // (id: string, data: Partial<PostCreateRequest>) => Promise<Post | null>
  publishDraft,   // (id: string) => Promise<Post | null>
  uploadImage,    // (file: File, onProgress?: (progress: number) => void) => Promise<UploadResponse | null>
} = usePost(postId);

// Usage
await fetchPost('post-123');
const newPost = await createPost({ title: '标题', content: '内容', ... });
```

### After (New API)

```typescript
const {
  // Query state
  post,           // Ref<Post | undefined>
  isLoading,      // Ref<boolean>
  isFetching,     // Ref<boolean>
  error,          // Ref<Error | null>
  refetch,        // () => Promise<QueryObserverResult>
  
  // Mutation objects
  createPost,     // UseMutationReturn
  updatePost,     // UseMutationReturn
  deletePost,     // UseMutationReturn
  saveDraft,      // UseMutationReturn
  updateDraft,    // UseMutationReturn
  publishDraft,   // UseMutationReturn
  
  // Computed state
  isSaving,       // ComputedRef<boolean>
  
  // Other methods
  uploadImage,    // (file: File, onProgress?: (progress: number) => void) => Promise<UploadResponse | null>
} = usePost(postId);

// Usage - Query is automatic
// No need to call fetchPost(), data loads automatically when postId is provided

// Mutations
createPost.mutate({ title: '标题', content: '内容', ... });
// or with async/await
const newPost = await createPost.mutateAsync({ title: '标题', content: '内容', ... });
```

## Migration Examples

### Example 1: Fetching a Post

**Before:**
```typescript
const { post, loading, error, fetchPost } = usePost();

onMounted(async () => {
  await fetchPost('post-123');
});
```

**After:**
```typescript
const postId = ref('post-123');
const { post, isLoading, error } = usePost(postId);

// Data loads automatically, no need to call fetchPost()
```

### Example 2: Creating a Post

**Before:**
```typescript
const { createPost, saving } = usePost();

const handleSubmit = async () => {
  const newPost = await createPost({
    title: form.title,
    content: form.content,
    tags: form.tags,
    status: 'PUBLISHED'
  });
  
  if (newPost) {
    router.push(`/posts/${newPost.id}`);
  }
};
```

**After:**
```typescript
const { createPost, isSaving } = usePost();

const handleSubmit = async () => {
  try {
    const newPost = await createPost.mutateAsync({
      title: form.title,
      content: form.content,
      tags: form.tags,
      status: 'PUBLISHED'
    });
    
    router.push(`/posts/${newPost.id}`);
  } catch (error) {
    // Error is automatically handled by TanStack Query error handler
    // But you can add custom error handling here if needed
  }
};
```

### Example 3: Updating a Post

**Before:**
```typescript
const { updatePost, saving } = usePost();

const handleUpdate = async () => {
  const updated = await updatePost('post-123', {
    title: form.title,
    content: form.content
  });
  
  if (updated) {
    ElMessage.success('更新成功');
  }
};
```

**After:**
```typescript
const { updatePost, isSaving } = usePost();

const handleUpdate = async () => {
  await updatePost.mutateAsync({
    postId: 'post-123',
    postData: {
      title: form.title,
      content: form.content
    }
  });
  
  // Success message is automatically shown by the mutation hook
};
```

### Example 4: Deleting a Post

**Before:**
```typescript
const { deletePost, saving } = usePost('post-123');

const handleDelete = async () => {
  const success = await deletePost();
  if (success) {
    router.push('/posts');
  }
};
```

**After:**
```typescript
const { deletePost, isSaving } = usePost('post-123');

const handleDelete = async () => {
  await deletePost.mutateAsync('post-123');
  router.push('/posts');
};
```

### Example 5: Working with Drafts

**Before:**
```typescript
const { saveDraft, updateDraft, publishDraft, saving } = usePost();

// Save new draft
const draft = await saveDraft({
  title: form.title,
  content: form.content,
  tags: form.tags,
  status: 'DRAFT'
});

// Update existing draft
const updated = await updateDraft('draft-123', {
  title: form.title
});

// Publish draft
const published = await publishDraft('draft-123');
```

**After:**
```typescript
const { saveDraft, updateDraft, publishDraft, isSaving } = usePost();

// Save new draft
await saveDraft.mutateAsync({
  title: form.title,
  content: form.content,
  tags: form.tags,
  status: 'DRAFT'
});

// Update existing draft
await updateDraft.mutateAsync({
  draftId: 'draft-123',
  postData: {
    title: form.title
  }
});

// Publish draft
await publishDraft.mutateAsync('draft-123');
```

### Example 6: Using Mutation Callbacks

**New Feature:**
```typescript
const { createPost } = usePost();

createPost.mutate(
  {
    title: form.title,
    content: form.content,
    tags: form.tags,
    status: 'PUBLISHED'
  },
  {
    onSuccess: (newPost) => {
      console.log('Post created:', newPost);
      router.push(`/posts/${newPost.id}`);
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    },
    onSettled: () => {
      console.log('Mutation completed');
    }
  }
);
```

## Benefits of the New API

1. **Automatic Caching**: Posts are automatically cached and reused across components
2. **Background Refetching**: Data is automatically refreshed in the background
3. **Optimistic Updates**: UI updates immediately, rolls back on error
4. **Loading States**: Built-in loading and fetching states
5. **Error Handling**: Centralized error handling with automatic retry
6. **Cache Invalidation**: Related queries are automatically invalidated after mutations
7. **DevTools**: Use TanStack Query DevTools to inspect cache and queries

## Breaking Changes

1. **Return Type Changes**:
   - `post` is now `Ref<Post | undefined>` instead of `Ref<Post | null>`
   - `error` is now `Ref<Error | null>` instead of `Ref<string | null>`
   - Mutation methods now return `UseMutationReturn` objects instead of `Promise<Post | null>`

2. **Method Signature Changes**:
   - `createPost`, `updatePost`, etc. are now mutation objects, not async functions
   - Use `.mutate()` or `.mutateAsync()` to trigger mutations
   - `fetchPost()` method removed - query executes automatically

3. **State Property Changes**:
   - `loading` renamed to `isLoading`
   - `saving` renamed to `isSaving` (computed from all mutations)
   - Added `isFetching` for background refetch state

## Compatibility Notes

- `uploadImage` remains unchanged (not using TanStack Query due to progress tracking)
- `useTagSearch` remains unchanged (tags not yet migrated to TanStack Query)
- `PostEditorState` interface remains unchanged

## Testing Considerations

When testing components that use the new `usePost`:

1. Mock TanStack Query hooks instead of the composable
2. Use `@tanstack/vue-query` test utilities
3. Test mutation callbacks and error states
4. Verify cache invalidation behavior

## Further Reading

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/vue/overview)
- [Migration Guide](../../.kiro/specs/tanstack-query-migration/design.md)
- [Query Keys Documentation](../queries/query-keys.ts)
