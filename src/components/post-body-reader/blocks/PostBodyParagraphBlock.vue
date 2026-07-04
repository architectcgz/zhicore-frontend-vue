<template>
  <p
    class="reader-preview__text-block reading-typography__paragraph"
    :class="{
      'reader-preview__text-block--empty': isEmptyParagraph,
    }"
    :aria-hidden="isEmptyParagraph ? 'true' : undefined"
  >
    <PostBodyInlineNodes v-if="!isEmptyParagraph" :nodes="block.children" />
  </p>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { ParagraphBlock } from "@/entities/post-body";

import PostBodyInlineNodes from "../PostBodyInlineNodes.vue";

const props = defineProps<{
  block: ParagraphBlock;
}>();

const isEmptyParagraph = computed(() => props.block.children.length === 0);
</script>

<style scoped>
.reader-preview__text-block {
  margin: var(--space-2) 0;
}

.reader-preview__text-block--empty {
  min-height: 1lh;
}
</style>
