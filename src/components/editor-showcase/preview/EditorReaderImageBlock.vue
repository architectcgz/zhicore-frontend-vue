<template>
  <figure class="reader-preview__image-block">
    <img :src="block.src" :alt="block.alt" />
    <figcaption v-if="block.alt">{{ block.alt }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model/useEditorShowcaseDraft";

type ImageBlock = Extract<EditorShowcaseDraftBlock, { type: "media" }>;

defineProps<{
  block: ImageBlock;
}>();
</script>

<style scoped>
.reader-preview__image-block {
  margin: 16px 0;
}

.reader-preview__image-block img {
  display: block;
  width: 100%;
  max-height: 260px;
  border: 1px solid var(--reader-image-border);
  border-radius: 8px;
  object-fit: cover;
}

.reader-preview__image-block figcaption {
  margin-top: 6px;
  color: var(--reader-muted);
  font-size: 13px;
  line-height: 1.68;
}
</style>
