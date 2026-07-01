<template>
  <component :is="headingTag" class="reader-preview__heading">
    <EditorInlineNodes :nodes="block.inlineNodes" />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model/useEditorShowcaseDraft";

import EditorInlineNodes from "./EditorInlineNodes.vue";

type HeadingBlock = Extract<EditorShowcaseDraftBlock, { type: "heading" }>;
type ReaderHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const props = defineProps<{
  block: HeadingBlock;
}>();

const headingTag = computed(() => `h${props.block.level}` as ReaderHeadingTag);
</script>

<style scoped>
.reader-preview__heading {
  margin: 18px 0 8px;
  color: var(--reader-heading);
  font-size: 20px;
  line-height: 1.32;
}
</style>
