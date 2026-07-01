<template>
  <aside
    ref="readerPreviewRef"
    class="reader-preview"
    aria-label="读者预览"
    @scroll="emit('scroll')"
  >
    <div class="reader-preview__header">
      <span>读者视图</span>
      <strong>{{ wordCount }} 字</strong>
      <small>{{ blockCount }} blocks</small>
    </div>
    <h2>{{ previewTitle }}</h2>
    <div
      v-for="previewBlock in previewBlocks"
      :key="`${previewBlock.readerBlockIndex}-${previewBlock.block.type}`"
      class="reader-preview__block-anchor"
      :data-preview-reader-block-index="previewBlock.readerBlockIndex"
    >
      <PostBodyReaderBlock :block="previewBlock.block" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { EditorShowcaseReaderPreviewBlock } from "@/features/editor-showcase/model";

import { PostBodyReaderBlock } from "@/components/post-body-reader";

defineProps<{
  previewTitle: string;
  previewBlocks: EditorShowcaseReaderPreviewBlock[];
  wordCount: number;
  blockCount: number;
}>();

const emit = defineEmits<{
  scroll: [];
}>();

const readerPreviewRef = ref<HTMLElement | null>(null);

defineExpose({
  get readerPreviewElement() {
    return readerPreviewRef.value;
  },
});
</script>

<style scoped>
.reader-preview {
  --reader-text: var(--editor-reader-text, #485765);
  --reader-muted: var(--editor-reader-muted, #647280);
  --reader-heading: var(--editor-reader-heading, #17202a);
  --reader-strong: var(--editor-reader-strong, #17202a);
  --reader-emphasis: var(--editor-reader-emphasis, #2f4d58);
  --reader-strikethrough: var(--editor-reader-strikethrough, #6f7f8b);
  --reader-link: var(--editor-reader-link, #1f6f77);
  --reader-link-hover: var(--editor-reader-link-hover, #154f59);
  --reader-code-text: var(--editor-reader-code-text, #23424d);
  --reader-code-bg: var(--editor-reader-code-bg, rgba(23, 32, 42, 0.08));
  --reader-code-border: var(--editor-reader-code-border, rgba(23, 32, 42, 0.1));
  --reader-code-caption: var(--editor-reader-code-caption, #657785);
  --reader-code-caption-border: var(
    --editor-reader-code-caption-border,
    rgba(23, 32, 42, 0.08)
  );
  --reader-quote-border: var(
    --editor-reader-quote-border,
    rgba(31, 111, 119, 0.32)
  );
  --reader-block-bg: var(--editor-reader-block-bg, rgba(23, 32, 42, 0.07));
  --reader-image-border: var(--editor-reader-image-border, rgba(23, 32, 42, 0.1));
  --reader-task-accent: var(--editor-reader-task-accent, #1f6f77);

  min-width: 0;
  max-height: min(760px, calc(100vh - 170px));
  overflow: hidden;
  overflow-y: auto;
  padding: 18px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 8px;
  background: var(--editor-control-bg, rgba(255, 255, 255, 0.78));
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
  transition:
    opacity 0.26s ease,
    transform 0.26s ease;
}

.reader-preview__header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  color: var(--reader-muted);
  font-size: 13px;
}

.reader-preview__header small {
  color: var(--reader-muted);
  font-size: 12px;
}

.reader-preview h2 {
  margin: 0 0 10px;
  color: var(--reader-heading);
  font-size: 28px;
  line-height: 1.12;
}

@media (prefers-reduced-motion: reduce) {
  .reader-preview {
    transition: none;
  }
}
</style>
