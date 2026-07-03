<template>
  <blockquote class="reader-preview__quote">
    <PostBodyReaderBlock
      v-for="(childBlock, childIndex) in block.blocks"
      :key="`${childIndex}-${childBlock.type}`"
      :block="childBlock"
    />
  </blockquote>
</template>

<script setup lang="ts">
import type { QuoteBlock } from "@/entities/post-body";

import PostBodyReaderBlock from "../PostBodyReaderBlock.vue";

defineProps<{
  block: QuoteBlock;
}>();
</script>

<style scoped>
.reader-preview__quote {
  margin: 12px 0;
  padding: 2px 0 2px 14px;
  border-left: 3px solid var(--reader-quote-border);
  color: var(--reader-text);
  font-size: 15px;
  line-height: 1.62;
  white-space: pre-line;
}
</style>
