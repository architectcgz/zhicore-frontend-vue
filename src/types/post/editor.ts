import type { Category, PostStatus } from '@/types';
import type { PostEditorState } from '@/composables/usePost';

export type PostEditorMenuCommand = 'preview' | 'delete';

export interface PostEditorHeaderProps {
  title: string;
  saving: boolean;
  lastSaveTimeText: string;
  primaryActionText: string;
  saveDraftText?: string;
  status?: PostStatus;
  showMenu?: boolean;
}

export interface PostEditorMetaPanelProps {
  tags: string[];
  categoryId?: string;
  coverImage?: string | null;
  categories: Category[];
  tagSuggestions: string[];
  tagSearchLoading: boolean;
  coverUploading: boolean;
  coverUploadProgress: number;
}

export interface PostEditorPreviewPanelProps {
  showPreview: boolean;
  title: string;
  tags: string[];
  content: string;
}

export interface PostEditorWorkspaceProps {
  editorState: PostEditorState;
  showPreview: boolean;
  categories: Category[];
  tagSuggestions: string[];
  tagSearchLoading: boolean;
  coverUploading: boolean;
  coverUploadProgress: number;
  editorImageUploading: boolean;
  editorImageUploadProgress: number;
  uploadImage: (file: File) => Promise<string | null>;
}
