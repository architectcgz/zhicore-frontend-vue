<template>
  <pre class="reader-preview__structured-block">{{ block.content }}</pre>
</template>

<script setup lang="ts">
import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model";

type StructuredBlock = Extract<EditorShowcaseDraftBlock, { type: "math" }>;

defineProps<{
  block: StructuredBlock;
}>();
</script>

<style scoped>
.reader-preview__structured-block {
  overflow-x: auto;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--reader-block-bg);
  color: var(--reader-text);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 15px;
  line-height: 1.68;
  white-space: pre-wrap;
}
</style>
