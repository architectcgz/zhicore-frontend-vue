<template>
  <article class="post-body-reader" aria-label="文章正文">
    <PostBodyReaderBlock
      v-for="(block, blockIndex) in body.blocks"
      :key="`${blockIndex}-${block.type}`"
      :block="block"
    />
  </article>
</template>

<script setup lang="ts">
import type { PostBody } from "@/entities/post-body";

import PostBodyReaderBlock from "./PostBodyReaderBlock.vue";

defineProps<{
  body: PostBody;
}>();
</script>

<style scoped>
.post-body-reader {
  color: var(--reader-text);
}
</style>
