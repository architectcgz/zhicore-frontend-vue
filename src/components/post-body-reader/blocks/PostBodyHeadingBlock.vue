<template>
  <component
    :is="headingTag"
    class="reader-preview__heading reading-typography__heading"
  >
    <PostBodyInlineNodes :nodes="block.children" />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { HeadingBlock } from "@/entities/post-body";

import PostBodyInlineNodes from "../PostBodyInlineNodes.vue";

type ReaderHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const props = defineProps<{
  block: HeadingBlock;
}>();

const headingTag = computed(() => `h${props.block.level}` as ReaderHeadingTag);
</script>

<style scoped>
.reader-preview__heading {
  margin: var(--space-8) 0 var(--space-3);
}
</style>
