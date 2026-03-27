import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { PostCreateRequest } from '@/api/post';
import { useImageUpload } from '@/composables/useImageUpload';
import { useTagSearch, type PostEditorState } from '@/composables/usePost';
import type { Category } from '@/types';

interface UsePostEditorWorkspaceOptions {
  onContentChange?: () => void;
}

export const createPostEditorState = (): PostEditorState => ({
  title: '',
  content: '',
  excerpt: '',
  coverImage: undefined,
  coverImageId: undefined,
  tags: [],
  categoryId: undefined,
  status: 'DRAFT',
});

export const buildPostEditorExcerpt = (content: string): string => {
  const plainText = content
    .replace(/[#*`_~[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  return plainText.length > 200 ? `${plainText.substring(0, 200)}...` : plainText;
};

export const buildPostEditorPayload = (
  editorState: PostEditorState
): Omit<PostCreateRequest, 'status'> => ({
  title: editorState.title,
  content: editorState.content,
  excerpt: buildPostEditorExcerpt(editorState.content),
  coverImageId: editorState.coverImageId,
  tags: [...editorState.tags],
  categoryId: editorState.categoryId,
});

export const formatPostEditorSaveTime = (time: Date): string => {
  const now = new Date();
  const diff = now.getTime() - time.getTime();

  if (diff < 60000) {
    return '刚刚';
  }

  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }

  return time.toLocaleTimeString();
};

export function usePostEditorWorkspace(options: UsePostEditorWorkspaceOptions = {}) {
  const tagSearch = useTagSearch();
  const coverUploader = useImageUpload();
  const editorImageUploader = useImageUpload();

  const editorState = reactive<PostEditorState>(createPostEditorState());
  const showPreview = ref(true);
  const categories = ref<Category[]>([]);

  const notifyContentChange = () => {
    options.onContentChange?.();
  };

  const handleTitleUpdate = (value: string) => {
    editorState.title = value;
  };

  const handleContentUpdate = (value: string) => {
    editorState.content = value;
  };

  const handleTagsUpdate = (value: string[]) => {
    editorState.tags = value;
  };

  const handleCategoryUpdate = (value?: string) => {
    editorState.categoryId = value;
  };

  const handleContentChange = () => {
    notifyContentChange();
  };

  const handleTagSearch = (query: string) => {
    void tagSearch.searchTagSuggestions(query);
  };

  const handleCoverUpload = async (file: File): Promise<boolean> => {
    if (!file.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件');
      return false;
    }

    if (file.size / 1024 / 1024 >= 5) {
      ElMessage.error('图片大小不能超过 5MB');
      return false;
    }

    const result = await coverUploader.uploadImage(file);
    if (result) {
      editorState.coverImage = result.url;
      editorState.coverImageId = result.fileId;
      notifyContentChange();
    }

    return false;
  };

  const handleCoverChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        void handleCoverUpload(file);
      }
    };
    input.click();
  };

  const handleCoverRemove = () => {
    editorState.coverImage = undefined;
    editorState.coverImageId = undefined;
    notifyContentChange();
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const result = await editorImageUploader.uploadImage(file);
    return result?.url || null;
  };

  const togglePreview = () => {
    showPreview.value = !showPreview.value;
  };

  return {
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
  };
}
