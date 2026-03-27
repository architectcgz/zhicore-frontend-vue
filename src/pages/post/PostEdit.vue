<!--
  文章编辑页面
  提供文章编辑器界面，支持 Markdown 编辑、标签选择、分类选择等功能
-->
<script setup lang="ts">
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';
import PostEditorHeader from '@/components/post/editor/PostEditorHeader.vue';
import PostEditorWorkspace from '@/components/post/editor/PostEditorWorkspace.vue';
import { usePostEditContent } from '@/composables/usePostEditContent';

const {
  post,
  loading,
  saving,
  errorMessage,
  autoSave,
  formatSaveTime,
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
} = usePostEditContent();
</script>

<template>
  <div class="post-edit-page">
    <div
      v-if="loading"
      class="loading-container"
    >
      <LoadingSpinner size="large" />
      <p>正在加载文章...</p>
    </div>

    <div
      v-else-if="errorMessage"
      class="error-container"
    >
      <SiteErrorState
        title="加载文章失败"
        :message="errorMessage"
        mode="page"
        retry-text="重试加载"
        @retry="handleRetry"
      />
    </div>

    <div
      v-else-if="post"
      class="editor-interface"
    >
      <PostEditorHeader
        title="编辑文章"
        :saving="saving"
        :last-save-time-text="autoSave.lastSaveTime.value ? formatSaveTime(autoSave.lastSaveTime.value) : ''"
        :primary-action-text="post.status === 'DRAFT' ? '发布文章' : '更新文章'"
        :status="post.status"
        show-menu
        @save-draft="handleSaveDraft"
        @primary-action="post.status === 'DRAFT' ? handlePublish() : handleUpdate()"
        @menu-command="handleMenuCommand"
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
  </div>
</template>

<style scoped>
.post-edit-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--color-text-secondary);
}

.loading-container p,
.error-container p {
  margin: var(--space-md) 0;
  font-size: 1rem;
}

.editor-interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
