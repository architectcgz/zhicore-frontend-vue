import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePost, useAutoSave } from '@/composables/usePost';
import {
  buildPostEditorPayload,
  formatPostEditorSaveTime,
  usePostEditorWorkspace,
} from '@/composables/usePostEditorWorkspace';

export function usePostCreateContent() {
  const router = useRouter();
  const { createPost, saveDraft, isSaving: saving } = usePost();

  const autoSave = useAutoSave(
    async () => {
      if (!editorState.title.trim() && !editorState.content.trim()) {
        return;
      }

      await saveDraft.mutateAsync({
        ...buildPostEditorPayload(editorState),
        status: 'DRAFT',
      });
    },
    {
      interval: 30000,
      debounceDelay: 2000,
      showSuccessMessage: false,
      showErrorMessage: true,
    }
  );

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
      autoSave.triggerDebouncedSave();
    },
  });

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!editorState.title.trim() && !editorState.content.trim()) {
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

  const handleSaveDraft = async () => {
    if (!editorState.title.trim()) {
      ElMessage.warning('请输入文章标题');
      return;
    }

    const result = await saveDraft.mutateAsync({
      ...buildPostEditorPayload(editorState),
      status: 'DRAFT',
    });

    if (result) {
      await router.push(`/posts/${result.id}/edit`);
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

    const result = await createPost.mutateAsync({
      ...buildPostEditorPayload(editorState),
      status: 'PUBLISHED',
    });

    if (result) {
      await router.push(`/posts/${result.id}`);
    }
  };

  return {
    autoSave,
    saving,
    editorState,
    showPreview,
    categories,
    tagSearch,
    coverUploader,
    editorImageUploader,
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
    togglePreview,
    formatSaveTime: formatPostEditorSaveTime,
  };
}
