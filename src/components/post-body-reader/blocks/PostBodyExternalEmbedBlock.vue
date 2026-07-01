<template>
  <section class="reader-preview__external-embed">
    <span>{{ block.provider }}</span>
    <a v-if="safeUrl" :href="safeUrl" target="_blank" rel="noopener noreferrer">
      {{ block.title || block.url }}
    </a>
    <p v-else>{{ block.title || block.url }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

import {
  sanitizePostBodyExternalUrl,
  type ExternalEmbedBlock,
} from "@/entities/post-body";

const props = defineProps<{
  block: ExternalEmbedBlock;
}>();

const safeUrl = computed(() => sanitizePostBodyExternalUrl(props.block.url));
</script>

<style scoped>
.reader-preview__external-embed {
  display: grid;
  gap: 5px;
  margin: 14px 0;
  padding: 10px 12px;
  border: 1px solid var(--reader-code-border);
  border-radius: 8px;
  background: var(--reader-block-bg);
  color: var(--reader-text);
  font-size: 14px;
  line-height: 1.5;
}

.reader-preview__external-embed span {
  color: var(--reader-muted);
  font-size: 12px;
  text-transform: uppercase;
}

.reader-preview__external-embed a {
  color: var(--reader-link);
  font-weight: 720;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.reader-preview__external-embed p {
  margin: 0;
}
</style>
