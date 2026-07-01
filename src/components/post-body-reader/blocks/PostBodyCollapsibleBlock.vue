<template>
  <details class="reader-preview__collapsible" :open="block.defaultOpen">
    <summary>
      <PostBodyInlineNodes :nodes="block.title" />
    </summary>
    <PostBodyReaderBlock
      v-for="(childBlock, childIndex) in block.blocks"
      :key="`${childIndex}-${childBlock.type}`"
      :block="childBlock"
    />
  </details>
</template>

<script setup lang="ts">
import type { CollapsibleBlock } from "@/entities/post-body";

import PostBodyInlineNodes from "../PostBodyInlineNodes.vue";
import PostBodyReaderBlock from "../PostBodyReaderBlock.vue";

defineProps<{
  block: CollapsibleBlock;
}>();
</script>

<style scoped>
.reader-preview__collapsible {
  margin: 14px 0;
  padding: 10px 12px;
  border: 1px solid var(--reader-code-border);
  border-radius: 8px;
  background: var(--reader-block-bg);
  color: var(--reader-text);
}

.reader-preview__collapsible summary {
  cursor: pointer;
  color: var(--reader-strong);
  font-weight: 760;
}
</style>
