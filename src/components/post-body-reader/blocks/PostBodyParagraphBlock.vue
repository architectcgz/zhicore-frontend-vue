<template>
  <p class="reader-preview__text-block">
    <PostBodyInlineNodes :nodes="block.children" />
  </p>
</template>

<script setup lang="ts">
import type { ParagraphBlock } from "@/entities/post-body";

import PostBodyInlineNodes from "../PostBodyInlineNodes.vue";

defineProps<{
  block: ParagraphBlock;
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
