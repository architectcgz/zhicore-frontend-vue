<template>
  <blockquote class="reader-preview__quote reading-typography__quote">
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
  border-color: var(--reader-quote-border);
}
</style>
