<template>
  <p class="reader-preview__text-block">
    <EditorInlineNodes :nodes="block.inlineNodes" />
  </p>
</template>

<script setup lang="ts">
import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model";

import EditorInlineNodes from "./EditorInlineNodes.vue";

type TextBlock = Extract<EditorShowcaseDraftBlock, { type: "text" }>;

defineProps<{
  block: TextBlock;
}>();
</script>

<style scoped>
.reader-preview__text-block {
  color: var(--reader-text);
  font-size: 15px;
  line-height: 1.68;
  white-space: pre-line;
}
</style>
