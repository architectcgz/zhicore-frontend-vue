<script setup lang="ts">
import MarkdownPreview from '@/components/post/MarkdownPreview.vue';
import type { PostEditorPreviewPanelProps } from '@/types/post/editor';

const props = defineProps<PostEditorPreviewPanelProps>();

const emit = defineEmits<{
  'toggle-preview': [];
}>();
</script>

<template>
  <div class="preview-panel">
    <div class="preview-header">
      <h3>预览</h3>
      <el-button
        size="small"
        @click="emit('toggle-preview')"
      >
        {{ props.showPreview ? '隐藏预览' : '显示预览' }}
      </el-button>
    </div>
    <div
      v-if="props.showPreview"
      class="preview-content"
    >
      <div class="preview-title">
        {{ props.title || '无标题' }}
      </div>
      <div class="preview-meta">
        <div
          v-if="props.tags.length"
          class="preview-tags"
        >
          <el-tag
            v-for="tag in props.tags"
            :key="tag"
            size="small"
            class="preview-tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <div class="preview-body">
        <MarkdownPreview :content="props.content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  width: 50%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.preview-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-content {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

.preview-title {
  margin-bottom: var(--space-md);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-meta {
  margin-bottom: var(--space-lg);
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.preview-tag {
  margin: 0;
}

.preview-body {
  color: var(--color-text-primary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .preview-panel {
    width: 100%;
    height: 50%;
    border-top: 1px solid var(--color-border);
    border-left: none;
  }
}
</style>
