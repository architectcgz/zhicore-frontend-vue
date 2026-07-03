<template>
  <p
    class="reader-preview__text-block"
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
  margin: 8px 0;
  color: var(--reader-text);
  font-size: 15px;
  line-height: 1.62;
  white-space: pre-line;
}

.reader-preview__text-block--empty {
  min-height: 1.62em;
}
</style>
