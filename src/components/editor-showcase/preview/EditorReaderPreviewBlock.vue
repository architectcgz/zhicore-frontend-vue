<template>
  <component :is="previewComponentByType[block.type]" :block="block" />
</template>

<script setup lang="ts">
import type { Component } from "vue";

import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model/useEditorShowcaseDraft";

import EditorReaderCodeBlock from "./EditorReaderCodeBlock.vue";
import EditorReaderHeadingBlock from "./EditorReaderHeadingBlock.vue";
import EditorReaderImageBlock from "./EditorReaderImageBlock.vue";
import EditorReaderListBlock from "./EditorReaderListBlock.vue";
import EditorReaderQuoteBlock from "./EditorReaderQuoteBlock.vue";
import EditorReaderStructuredBlock from "./EditorReaderStructuredBlock.vue";
import EditorReaderTextBlock from "./EditorReaderTextBlock.vue";

defineProps<{
  block: EditorShowcaseDraftBlock;
}>();

const previewComponentByType: Record<
  EditorShowcaseDraftBlock["type"],
  Component
> = {
  text: EditorReaderTextBlock,
  heading: EditorReaderHeadingBlock,
  quote: EditorReaderQuoteBlock,
  code: EditorReaderCodeBlock,
  list: EditorReaderListBlock,
  media: EditorReaderImageBlock,
  math: EditorReaderStructuredBlock,
};
</script>
