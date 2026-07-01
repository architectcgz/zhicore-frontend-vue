<template>
  <ul class="reader-preview__attachment-gallery">
    <li
      v-for="(item, itemIndex) in block.items"
      :key="`${itemIndex}-${item.fileId}`"
    >
      <span>{{ item.fileId }}</span>
      <small v-if="item.caption?.length">
        {{ item.caption.map((node) => node.text).join("") }}
      </small>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { AttachmentGalleryBlock } from "@/entities/post-body";

defineProps<{
  block: AttachmentGalleryBlock;
}>();
</script>

<style scoped>
.reader-preview__attachment-gallery {
  display: grid;
  gap: 8px;
  margin: 14px 0;
  padding: 0;
  list-style: none;
}

.reader-preview__attachment-gallery li {
  display: grid;
  gap: 3px;
  padding: 9px 11px;
  border: 1px solid var(--reader-code-border);
  border-radius: 8px;
  background: var(--reader-block-bg);
  color: var(--reader-text);
}

.reader-preview__attachment-gallery small {
  color: var(--reader-muted);
}
</style>
