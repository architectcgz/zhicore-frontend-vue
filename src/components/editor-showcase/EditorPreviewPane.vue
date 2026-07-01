<template>
  <aside ref="readerPreviewRef" class="reader-preview" aria-label="读者预览">
    <div class="reader-preview__header">
      <span>读者视图</span>
      <strong>{{ wordCount }} 字</strong>
    </div>
    <h2>{{ previewTitle }}</h2>
    <div
      v-for="(block, blockIndex) in previewBlocks"
      :key="`${blockIndex}-${block.type}-${block.content}`"
      class="reader-preview__block-anchor"
      :data-preview-block-index="blockIndex"
    >
      <EditorReaderPreviewBlock :block="block" />
    </div>
    <dl class="reader-preview__facts">
      <div>
        <dt>正文</dt>
        <dd>blocks</dd>
      </div>
      <div>
        <dt>媒体</dt>
        <dd>fileId</dd>
      </div>
    </dl>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model";

import EditorReaderPreviewBlock from "./preview/EditorReaderPreviewBlock.vue";

defineProps<{
  previewTitle: string;
  previewBlocks: EditorShowcaseDraftBlock[];
  wordCount: number;
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
  --reader-text: #485765;
  --reader-muted: #647280;
  --reader-heading: #17202a;
  --reader-strong: #17202a;
  --reader-emphasis: #2f4d58;
  --reader-strikethrough: #6f7f8b;
  --reader-link: #1f6f77;
  --reader-link-hover: #154f59;
  --reader-code-text: #23424d;
  --reader-code-bg: rgba(23, 32, 42, 0.08);
  --reader-code-border: rgba(23, 32, 42, 0.1);
  --reader-code-caption: #657785;
  --reader-code-caption-border: rgba(23, 32, 42, 0.08);
  --reader-quote-border: rgba(31, 111, 119, 0.32);
  --reader-block-bg: rgba(23, 32, 42, 0.07);
  --reader-image-border: rgba(23, 32, 42, 0.1);
  --reader-task-accent: #1f6f77;

  min-width: 0;
  max-height: min(760px, calc(100vh - 170px));
  overflow: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 18px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(18px);
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
  transition:
    opacity 0.26s ease,
    transform 0.26s ease;
}

:global(.editor-showcase--ink) .reader-preview {
  --reader-text: #c1ccd6;
  --reader-muted: #c1ccd6;
  --reader-heading: #c1ccd6;
  --reader-strong: #c1ccd6;
  --reader-emphasis: #c1ccd6;
  --reader-strikethrough: #c1ccd6;
  --reader-link: #d7e5ea;
  --reader-link-hover: #ffffff;
  --reader-code-text: #d7e5ea;
  --reader-code-bg: rgba(255, 255, 255, 0.09);
  --reader-code-border: rgba(255, 255, 255, 0.1);
  --reader-code-caption: #9db8ca;
  --reader-code-caption-border: rgba(255, 255, 255, 0.09);
  --reader-quote-border: rgba(115, 184, 191, 0.38);
  --reader-block-bg: rgba(255, 255, 255, 0.08);
  --reader-image-border: rgba(255, 255, 255, 0.1);
  --reader-task-accent: #7dd3fc;

  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(19, 27, 38, 0.72);
}

.reader-preview__header {
  display: flex;
  justify-content: space-between;
  color: var(--reader-muted);
  font-size: 13px;
}

.reader-preview h2 {
  margin: 0 0 10px;
  color: var(--reader-heading);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.12;
}

.reader-preview__facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 22px 0 0;
}

.reader-preview__facts div {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.reader-preview__facts dt {
  color: var(--reader-muted);
  font-size: 12px;
}

.reader-preview__facts dd {
  margin: 4px 0 0;
  font-weight: 760;
}

:global(.editor-showcase--ink) .reader-preview__facts div {
  background: rgba(255, 255, 255, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .reader-preview {
    transition: none;
  }
}
</style>
