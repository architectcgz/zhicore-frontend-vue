<!--
  文章创建页面
  提供文章编辑器界面，支持 Markdown 编辑、标签选择、分类选择等功能
-->
<script setup lang="ts">
import PostEditorHeader from '@/components/post/editor/PostEditorHeader.vue';
import PostEditorWorkspace from '@/components/post/editor/PostEditorWorkspace.vue';
import { usePostCreateContent } from '@/composables/usePostCreateContent';

const {
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
  formatSaveTime,
} = usePostCreateContent();
</script>

<template>
  <div class="post-create-page">
    <PostEditorHeader
      title="创建文章"
      :saving="saving"
      :last-save-time-text="autoSave.lastSaveTime.value ? formatSaveTime(autoSave.lastSaveTime.value) : ''"
      primary-action-text="发布文章"
      @save-draft="handleSaveDraft"
      @primary-action="handlePublish"
    />

    <PostEditorWorkspace
      :editor-state="editorState"
      :show-preview="showPreview"
      :categories="categories"
      :tag-suggestions="tagSearch.suggestions.value"
      :tag-search-loading="tagSearch.loading.value"
      :cover-uploading="coverUploader.uploading.value"
      :cover-upload-progress="coverUploader.progress.value"
      :editor-image-uploading="editorImageUploader.uploading.value"
      :editor-image-upload-progress="editorImageUploader.progress.value"
      :upload-image="handleImageUpload"
      @update:title="handleTitleUpdate"
      @update:content="handleContentUpdate"
      @update:tags="handleTagsUpdate"
      @update:category-id="handleCategoryUpdate"
      @tag-search="handleTagSearch"
      @content-change="handleContentChange"
      @cover-upload="handleCoverUpload"
      @cover-change="handleCoverChange"
      @cover-remove="handleCoverRemove"
      @toggle-preview="togglePreview"
    />
  </div>
</template>

<style scoped>
.post-create-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}
</style>
