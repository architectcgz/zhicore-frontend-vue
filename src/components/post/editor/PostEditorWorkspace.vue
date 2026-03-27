<script setup lang="ts">
import { computed } from 'vue';
import type { PostEditorWorkspaceProps } from '@/types/post/editor';
import PostEditor from '@/components/post/PostEditor.vue';
import PostEditorMetaPanel from '@/components/post/editor/PostEditorMetaPanel.vue';
import PostEditorPreviewPanel from '@/components/post/editor/PostEditorPreviewPanel.vue';

const props = defineProps<PostEditorWorkspaceProps>();

const emit = defineEmits<{
  'update:title': [value: string];
  'update:content': [value: string];
  'update:tags': [value: string[]];
  'update:category-id': [value: string | undefined];
  'tag-search': [query: string];
  'content-change': [];
  'cover-upload': [file: File];
  'cover-change': [];
  'cover-remove': [];
  'toggle-preview': [];
}>();

const titleModel = computed({
  get: () => props.editorState.title,
  set: (value: string) => emit('update:title', value),
});

const contentModel = computed({
  get: () => props.editorState.content,
  set: (value: string) => emit('update:content', value),
});
</script>

<template>
  <div class="editor-container">
    <div class="editor-panel">
      <div class="title-section">
        <el-input
          v-model="titleModel"
          placeholder="请输入文章标题..."
          size="large"
          class="title-input"
          maxlength="100"
          show-word-limit
          @input="emit('content-change')"
        />
      </div>

      <PostEditorMetaPanel
        :tags="props.editorState.tags"
        :category-id="props.editorState.categoryId"
        :cover-image="props.editorState.coverImage"
        :categories="props.categories"
        :tag-suggestions="props.tagSuggestions"
        :tag-search-loading="props.tagSearchLoading"
        :cover-uploading="props.coverUploading"
        :cover-upload-progress="props.coverUploadProgress"
        @update:tags="emit('update:tags', $event)"
        @update:category-id="emit('update:category-id', $event)"
        @tag-search="emit('tag-search', $event)"
        @change="emit('content-change')"
        @cover-upload="emit('cover-upload', $event)"
        @cover-change="emit('cover-change')"
        @cover-remove="emit('cover-remove')"
      />

      <div class="editor-section">
        <PostEditor
          v-model:content="contentModel"
          :upload-image="props.uploadImage"
          :image-uploading="props.editorImageUploading"
          :image-upload-progress="props.editorImageUploadProgress"
          @change="emit('content-change')"
        />
      </div>
    </div>

    <PostEditorPreviewPanel
      :show-preview="props.showPreview"
      :title="props.editorState.title"
      :tags="props.editorState.tags"
      :content="props.editorState.content"
      @toggle-preview="emit('toggle-preview')"
    />
  </div>
</template>

<style scoped>
.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  overflow-y: auto;
}

.title-section {
  margin-bottom: var(--space-lg);
}

.title-input {
  font-size: 1.25rem;
  font-weight: 600;
}

.title-input :deep(.el-input__inner) {
  padding: var(--space-md) 0;
  border: none;
  box-shadow: none;
  font-size: 1.25rem;
  font-weight: 600;
}

.title-input :deep(.el-input__inner):focus {
  border-bottom: 2px solid var(--color-primary);
}

.editor-section {
  flex: 1;
  min-height: 400px;
}

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }
}
</style>
