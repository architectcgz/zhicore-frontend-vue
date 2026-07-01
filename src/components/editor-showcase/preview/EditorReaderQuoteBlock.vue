<template>
  <blockquote class="reader-preview__quote">
    <EditorInlineNodes :nodes="block.inlineNodes" />
  </blockquote>
</template>

<script setup lang="ts">
import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model/useEditorShowcaseDraft";

import EditorInlineNodes from "./EditorInlineNodes.vue";

type QuoteBlock = Extract<EditorShowcaseDraftBlock, { type: "quote" }>;

defineProps<{
  block: QuoteBlock;
}>();
</script>

<style scoped>
.reader-preview__quote {
  margin: 14px 0;
  padding: 2px 0 2px 14px;
  border-left: 3px solid var(--reader-quote-border);
  color: var(--reader-text);
  font-size: 15px;
  line-height: 1.68;
  white-space: pre-line;
}
</style>
