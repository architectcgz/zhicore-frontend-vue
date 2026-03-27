import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAutoSave } from '@/composables/useAutoSave';
import { usePost } from '@/composables/usePost';
import { getErrorMessage } from '@/types/errors';
import type { PostEditorMenuCommand } from '@/types/post/editor';
import {
  buildPostEditorPayload,
  formatPostEditorSaveTime,
  usePostEditorWorkspace,
} from '@/composables/usePostEditorWorkspace';

export function usePostEditContent() {
  const router = useRouter();
  const route = useRoute();
  const postId = computed(() => String(route.params.id ?? '').trim());

  const {
    post,
    isLoading: loading,
    error,
    isSaving: saving,
    updatePost,
    deletePost,
    updateDraft,
    publishDraft,
    refetch,
  } = usePost(postId);
  const hasUnsavedChanges = ref(false);
  const errorMessage = computed(() => (error.value ? getErrorMessage(error.value) : ''));

  const {
    tagSearch,
    coverUploader,
    editorImageUploader,
    editorState,
    showPreview,
    categories,
    handleTitleUpdate,
    handleContentUpdate,
    handleTagsUpdate,
    handleCategoryUpdate,
    handleContentChange,
    handleTagSearch,
    handleCoverUpload,
    handleCoverChange,
    handleCoverRemove,
    handleImageUpload,
    togglePreview,
  } = usePostEditorWorkspace({
    onContentChange: () => {
      hasUnsavedChanges.value = true;
      autoSave.triggerDebouncedSave();
    },
  });

  const persistDraft = async () => {
    if (!post.value) {
      return null;
    }

    return updateDraft.mutateAsync({
      draftId: post.value.id,
      postData: buildPostEditorPayload(editorState),
    });
  };

  const autoSave = useAutoSave(
    async () => {
      if (!hasUnsavedChanges.value || !post.value) {
        return;
      }

      await persistDraft();
      hasUnsavedChanges.value = false;
    },
    {
      interval: 30000,
      debounceDelay: 2000,
      showSuccessMessage: false,
      showErrorMessage: true,
    }
  );

  watch(
    post,
    (currentPost) => {
      if (!currentPost) {
        return;
      }

      Object.assign(editorState, {
        title: currentPost.title,
        content: currentPost.content,
        excerpt: currentPost.excerpt || '',
        coverImage: currentPost.coverImage,
        coverImageId: undefined,
        tags: currentPost.tags.map((tag) => tag.name),
        categoryId: currentPost.categoryId,
        status: currentPost.status,
      });
      hasUnsavedChanges.value = false;
    },
    { immediate: true }
  );

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
      return;
    }

    event.preventDefault();
    event.returnValue = '您有未保存的内容，确定要离开吗？';
  };

  onMounted(() => {
    void tagSearch.fetchHotTags();
    autoSave.startAutoSave();
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onUnmounted(() => {
    autoSave.stopAutoSave();
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  const handleRetry = () => {
    void refetch();
  };

  const handleSaveDraft = async () => {
    if (!editorState.title.trim()) {
      ElMessage.warning('请输入文章标题');
      return;
    }

    const result = await persistDraft();
    if (result) {
      hasUnsavedChanges.value = false;
    }
  };

  const handlePublish = async () => {
    if (!editorState.title.trim()) {
      ElMessage.warning('请输入文章标题');
      return;
    }

    if (!editorState.content.trim()) {
      ElMessage.warning('请输入文章内容');
      return;
    }

    if (!post.value || post.value.status !== 'DRAFT') {
      return;
    }

    const updateResult = await persistDraft();
    if (!updateResult) {
      return;
    }

    const publishResult = await publishDraft.mutateAsync(post.value.id);
    if (publishResult) {
      hasUnsavedChanges.value = false;
      await router.push(`/posts/${publishResult.id}`);
    }
  };

  const handleUpdate = async () => {
    if (!editorState.title.trim()) {
      ElMessage.warning('请输入文章标题');
      return;
    }

    if (!editorState.content.trim()) {
      ElMessage.warning('请输入文章内容');
      return;
    }

    if (!post.value) {
      return;
    }

    const result = await updatePost.mutateAsync({
      postId: post.value.id,
      postData: {
        ...buildPostEditorPayload(editorState),
        status: 'PUBLISHED',
      },
    });

    if (result) {
      hasUnsavedChanges.value = false;
    }
  };

  const handleDelete = async () => {
    if (!post.value) {
      return;
    }

    try {
      await ElMessageBox.confirm('确定要删除这篇文章吗？删除后无法恢复。', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      await deletePost.mutateAsync(post.value.id);
      await router.push('/');
    } catch {
      // ignore cancel
    }
  };

  const handleMenuCommand = async (command: PostEditorMenuCommand) => {
    if (command === 'preview') {
      if (post.value) {
        window.open(`/posts/${post.value.id}`, '_blank');
      }
      return;
    }

    if (command === 'delete') {
      await handleDelete();
    }
  };

  return {
    post,
    loading,
    saving,
    errorMessage,
    autoSave,
    formatSaveTime: formatPostEditorSaveTime,
    editorState,
    showPreview,
    categories,
    tagSearch,
    coverUploader,
    editorImageUploader,
    handleRetry,
    handleTitleUpdate,
    handleContentUpdate,
    handleTagsUpdate,
    handleCategoryUpdate,
    handleContentChange,
    handleTagSearch,
    handleCoverUpload,
    handleCoverChange,
    handleCoverRemove,
    handleImageUpload,
    handleSaveDraft,
    handlePublish,
    handleUpdate,
    handleMenuCommand,
    togglePreview,
  };
}
