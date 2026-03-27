<script setup lang="ts">
import { computed } from 'vue';
import type { PostEditorMetaPanelProps } from '@/types/post/editor';

const props = defineProps<PostEditorMetaPanelProps>();

const emit = defineEmits<{
  'update:tags': [value: string[]];
  'update:category-id': [value: string | undefined];
  'tag-search': [query: string];
  change: [];
  'cover-upload': [file: File];
  'cover-change': [];
  'cover-remove': [];
}>();

const tagsModel = computed({
  get: () => props.tags,
  set: (value: string[]) => emit('update:tags', value),
});

const categoryModel = computed({
  get: () => props.categoryId,
  set: (value: string | undefined) => emit('update:category-id', value),
});

const handleBeforeUpload = (file: File) => {
  emit('cover-upload', file);
  return false;
};

const handleFieldChange = () => {
  emit('change');
};

const handleRemoteSearch = (query: string) => {
  emit('tag-search', query);
};
</script>

<template>
  <div class="meta-section">
    <div class="meta-row">
      <div class="meta-item">
        <label class="meta-label">标签</label>
        <el-select
          v-model="tagsModel"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="搜索或选择标签"
          :remote-method="handleRemoteSearch"
          :loading="props.tagSearchLoading"
          class="tag-selector"
          @change="handleFieldChange"
        >
          <el-option
            v-for="tag in props.tagSuggestions"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </div>

      <div class="meta-item">
        <label class="meta-label">分类</label>
        <el-select
          v-model="categoryModel"
          placeholder="选择分类"
          clearable
          class="category-selector"
          @change="handleFieldChange"
        >
          <el-option
            v-for="category in props.categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </div>
    </div>

    <div class="meta-row">
      <div class="meta-item cover-upload">
        <label class="meta-label">封面图</label>
        <div class="cover-upload-area">
          <el-upload
            v-if="!props.coverImage"
            class="cover-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            accept="image/*"
          >
            <div class="upload-placeholder">
              <i class="el-icon-plus" />
              <div class="upload-text">
                上传封面图
              </div>
            </div>
          </el-upload>
          <div
            v-else
            class="cover-preview"
          >
            <img
              :src="props.coverImage"
              alt="封面图"
            >
            <div class="cover-actions">
              <el-button
                size="small"
                @click="emit('cover-change')"
              >
                更换
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="emit('cover-remove')"
              >
                删除
              </el-button>
            </div>
          </div>
          <div
            v-if="props.coverUploading"
            class="cover-upload-progress"
          >
            <div class="cover-upload-progress__label">
              正在上传封面图 {{ props.coverUploadProgress }}%
            </div>
            <el-progress
              :percentage="props.coverUploadProgress"
              :show-text="false"
              :stroke-width="6"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meta-section {
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
}

.meta-row {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-item {
  flex: 1;
}

.meta-label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.tag-selector,
.category-selector {
  width: 100%;
}

.cover-upload {
  width: 100%;
}

.cover-upload-area,
.cover-uploader {
  width: 100%;
}

.cover-upload-progress {
  margin-top: var(--space-sm);
}

.cover-upload-progress__label {
  margin-bottom: var(--space-xs);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: var(--color-primary);
}

.upload-placeholder i {
  margin-bottom: var(--space-xs);
  font-size: 2rem;
  color: var(--color-text-secondary);
}

.upload-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  display: flex;
  gap: var(--space-xs);
}

@media (max-width: 768px) {
  .meta-row {
    flex-direction: column;
    gap: var(--space-md);
  }
}
</style>
