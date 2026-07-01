<template>
  <figure class="reader-preview__code-block">
    <figcaption v-if="block.language">
      {{ block.language }}
    </figcaption>
    <pre><code>{{ block.content }}</code></pre>
  </figure>
</template>

<script setup lang="ts">
import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model/useEditorShowcaseDraft";

type CodeBlock = Extract<EditorShowcaseDraftBlock, { type: "code" }>;

defineProps<{
  block: CodeBlock;
}>();
</script>

<style scoped>
.reader-preview__code-block {
  overflow: hidden;
  margin: 16px 0;
  border: 1px solid var(--reader-code-border);
  border-radius: 8px;
  background: var(--reader-block-bg);
  color: var(--reader-text);
  font-size: 15px;
  line-height: 1.68;
}

.reader-preview__code-block figcaption {
  padding: 7px 12px;
  border-bottom: 1px solid var(--reader-code-caption-border);
  color: var(--reader-code-caption);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 12px;
}

.reader-preview__code-block pre {
  overflow-x: auto;
  margin: 0;
  padding: 12px;
}

.reader-preview__code-block code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  white-space: pre;
}
</style>
