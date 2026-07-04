<template>
  <figure class="reader-preview__math-block" aria-label="数学公式">
    <div
      v-if="renderedMathHtml"
      class="reader-preview__math-output"
      v-html="renderedMathHtml"
    />
    <pre v-else class="reader-preview__math-source">{{ block.latex }}</pre>
  </figure>
</template>

<script setup lang="ts">
import "katex/dist/katex.min.css";

import katex from "katex";
import { computed } from "vue";

import type { MathBlock } from "@/entities/post-body";

const props = defineProps<{
  block: MathBlock;
}>();

const renderedMathHtml = computed(() => {
  try {
    // KaTeX 只消费后端结构化 math.latex 字段；这里渲染的是库生成的 HTML，不接受用户原始 HTML。
    return katex.renderToString(props.block.latex, {
      displayMode: true,
      throwOnError: false,
      strict: "ignore",
      trust: false,
    });
  } catch {
    return "";
  }
});
</script>

<style scoped>
.reader-preview__math-block {
  overflow-x: auto;
  margin: 12px 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--reader-block-bg);
  color: var(--reader-text);
}

.reader-preview__math-output {
  min-width: max-content;
}

.reader-preview__math-source {
  overflow-x: auto;
  margin: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  color: var(--reader-text);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: var(--font-size-reading-code);
  line-height: var(--line-height-reading-code);
  white-space: pre-wrap;
}
</style>
