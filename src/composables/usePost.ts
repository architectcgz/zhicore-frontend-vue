/**
 * 文章相关的组合式函数
 * 提供文章的 CRUD 操作、状态管理等功能
 * 
 * 重构说明：
 * - 使用 TanStack Query hooks 替代手动状态管理
 * - 移除 loading, error, saving 等手动状态
 * - 直接暴露 TanStack Query 的返回值
 * - 简化 API，减少样板代码
 */

import { ref, computed, type Ref } from 'vue';
import { postApi } from '@/api/post';
import { tagApi } from '@/api/tag';
import { userApi } from '@/api/user';
import { useAuthStore } from '@/stores/auth';
import type { UploadResponse, Tag, Post, PaginatedResponse, PostStatus } from '@/types';
import { ElMessage } from 'element-plus';
import { getErrorMessage } from '@/types/errors';
import {
  usePostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useSaveDraftMutation,
  useUpdateDraftMutation,
  usePublishDraftMutation,
} from '@/queries/posts';

// 导出 useAutoSave 以便其他模块使用
export { useAutoSave } from './useAutoSave';

/**
 * 文章编辑器状态接口
 */
export interface PostEditorState {
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string | null; // 封面图 URL（用于前端显示）
  coverImageId?: string; // 封面图 fileId（用于提交给后端）
  tags: string[];
  categoryId?: string;
  status: PostStatus;
}

/**
 * 使用文章功能的组合式函数
 * 
 * 使用 TanStack Query 管理文章数据和操作
 * 
 * @param postId - 文章 ID（可选，用于获取单个文章）
 * @returns TanStack Query hooks 的返回值
 * 
 * @example
 * ```ts
 * // 获取单个文章
 * const { post, isLoading, error } = usePost('post-123');
 * 
 * // 创建文章
 * const { createPost } = usePost();
 * await createPost.mutateAsync({ title: '标题', content: '内容', ... });
 * 
 * // 更新文章
 * const { updatePost } = usePost();
 * await updatePost.mutateAsync({ postId: 'post-123', postData: { title: '新标题' } });
 * ```
 */
export function usePost(postId?: Ref<string | undefined> | string | undefined) {
  const authStore = useAuthStore();
  // 使用 TanStack Query hooks
  const postQuery = postId !== undefined
    ? usePostQuery(postId)
    : { data: ref(undefined), isLoading: ref(false), isFetching: ref(false), error: ref(null), refetch: () => Promise.resolve({} as any) };
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();
  const saveDraftMutation = useSaveDraftMutation();
  const updateDraftMutation = useUpdateDraftMutation();
  const publishDraftMutation = usePublishDraftMutation();

  /**
   * 上传图片
   * 注意：图片上传不使用 TanStack Query，因为需要跟踪上传进度
   */
  const uploadImage = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse | null> => {
    try {
      const result = await postApi.uploadImage(file, onProgress);
      ElMessage.success('图片上传成功');
      return result;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || '图片上传失败';
      ElMessage.error(errorMsg);
      return null;
    }
  };

  const getUserDrafts = async (page: number = 1, size: number = 20): Promise<PaginatedResponse<Post>> => {
    const userId = authStore.user?.id;
    if (!userId) {
      throw new Error('用户未登录，无法获取草稿列表');
    }
    return userApi.getUserDrafts(userId, { page, size });
  };

  const deleteDraft = async (draftId: string): Promise<boolean> => {
    await postApi.deleteDraft(draftId);
    return true;
  };

  const duplicateDraft = async (draftId: string): Promise<Post | null> => {
    const draft = await postApi.getPostById(draftId);
    return postApi.saveDraft({
      title: `${draft.title}（副本）`,
      content: draft.content,
      excerpt: draft.excerpt,
      coverImageId: undefined,
      tags: draft.tags.map((tag) => tag.name),
      categoryId: draft.categoryId,
      status: 'DRAFT',
    });
  };

  const publishDraftById = async (draftId: string): Promise<Post> => {
    return publishDraftMutation.mutateAsync(draftId);
  };

  return {
    // Query 状态（单个文章）
    post: postQuery.data,
    isLoading: postQuery.isLoading,
    isFetching: postQuery.isFetching,
    error: postQuery.error,
    refetch: postQuery.refetch,

    // Mutation 对象（直接暴露 TanStack Query 的返回值）
    createPost: createPostMutation,
    updatePost: updatePostMutation,
    deletePost: deletePostMutation,
    saveDraft: saveDraftMutation,
    updateDraft: updateDraftMutation,
    publishDraft: publishDraftMutation,

    // 计算属性：统一的 saving 状态
    isSaving: computed(() => 
      createPostMutation.isPending.value ||
      updatePostMutation.isPending.value ||
      deletePostMutation.isPending.value ||
      saveDraftMutation.isPending.value ||
      updateDraftMutation.isPending.value ||
      publishDraftMutation.isPending.value
    ),

    // 其他方法
    uploadImage,
    getUserDrafts,
    deleteDraft,
    duplicateDraft,
    publishDraftById,
  };
}

/**
 * 标签搜索功能的组合式函数
 * 
 * 注意：标签相关功能暂未迁移到 TanStack Query
 * 保持原有实现，待后续迁移
 */
export function useTagSearch() {
  const tags = ref<Tag[]>([]);
  const suggestions = ref<string[]>([]);
  const loading = ref(false);

  /**
   * 搜索标签建议
   */
  const searchTagSuggestions = async (query: string) => {
    if (!query.trim()) {
      suggestions.value = [];
      return;
    }

    loading.value = true;
    try {
      suggestions.value = await tagApi.getTagSuggestions(query, 10);
    } catch (err: unknown) {
      console.error('搜索标签建议失败:', err);
      suggestions.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取热门标签
   */
  const fetchHotTags = async () => {
    loading.value = true;
    try {
      const hotTags = await tagApi.getHotTags({ limit: 20 });
      tags.value = hotTags;
    } catch (err: unknown) {
      console.error('获取热门标签失败:', err);
      tags.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    tags,
    suggestions,
    loading,
    searchTagSuggestions,
    fetchHotTags,
  };
}
