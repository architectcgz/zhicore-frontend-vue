<template>
  <figure class="reader-preview__image-block">
    <img v-if="safeUrl" :src="safeUrl" :alt="block.alt ?? ''" />
    <div v-else class="reader-preview__image-placeholder">
      {{ block.alt || block.fileId }}
    </div>
    <figcaption v-if="captionText">{{ captionText }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from "vue";

import {
  sanitizePostBodyExternalUrl,
  type ImageBlock,
} from "@/entities/post-body";

const props = defineProps<{
  block: ImageBlock;
}>();

const captionText = computed(() => {
  if (props.block.caption?.length) {
    return props.block.caption.map((node) => node.text).join("");
  }

  return props.block.alt;
});

const safeUrl = computed(() =>
  props.block.url ? sanitizePostBodyExternalUrl(props.block.url) : null,
);
</script>

<style scoped>
.reader-preview__image-block {
  margin: 16px 0;
}

.reader-preview__image-block img,
.reader-preview__image-placeholder {
  display: block;
  width: 100%;
  max-height: 260px;
  border: 1px solid var(--reader-image-border);
  border-radius: 8px;
  object-fit: cover;
}

.reader-preview__image-placeholder {
  display: grid;
  min-height: 160px;
  place-items: center;
  background: var(--reader-block-bg);
  color: var(--reader-muted);
  font-size: 13px;
}

.reader-preview__image-block figcaption {
  margin-top: 6px;
  color: var(--reader-muted);
  font-size: 13px;
  line-height: 1.68;
}
</style>
