<template>
  <figure class="reader-preview__code-block">
    <figcaption class="reader-preview__code-header">
      <span>{{ block.language ?? "code" }}</span>
      <button
        class="reader-preview__code-copy"
        type="button"
        aria-label="复制代码"
        :disabled="copyState === 'copying'"
        @click="copyCode"
      >
        {{ copyLabel }}
      </button>
    </figcaption>
    <pre><code>{{ block.content }}</code></pre>
  </figure>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model";

type CodeBlock = Extract<EditorShowcaseDraftBlock, { type: "code" }>;
type CopyState = "idle" | "copying" | "copied" | "failed";

const props = defineProps<{
  block: CodeBlock;
}>();

const copyState = ref<CopyState>("idle");
let copyFeedbackTimer: number | undefined;

const copyLabel = computed(() => {
  if (copyState.value === "copied") {
    return "已复制";
  }

  if (copyState.value === "failed") {
    return "复制失败";
  }

  if (copyState.value === "copying") {
    return "复制中";
  }

  return "复制";
});

function scheduleCopyStateReset(): void {
  window.clearTimeout(copyFeedbackTimer);
  copyFeedbackTimer = window.setTimeout(() => {
    copyState.value = "idle";
  }, 1600);
}

async function copyCode(): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    copyState.value = "failed";
    scheduleCopyStateReset();
    return;
  }

  copyState.value = "copying";

  try {
    await navigator.clipboard.writeText(props.block.content);
    copyState.value = "copied";
  } catch {
    copyState.value = "failed";
  } finally {
    // 复制反馈只描述刚才这次动作，短暂展示后回到可重复点击的默认状态。
    scheduleCopyStateReset();
  }
}

onBeforeUnmount(() => {
  window.clearTimeout(copyFeedbackTimer);
});
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

.reader-preview__code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 12px;
  border-bottom: 1px solid var(--reader-code-caption-border);
  color: var(--reader-code-caption);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 12px;
}

.reader-preview__code-copy {
  min-width: 54px;
  border: 1px solid var(--reader-code-caption-border);
  border-radius: 6px;
  padding: 4px 8px;
  background: var(--reader-code-bg);
  color: var(--reader-code-caption);
  cursor: pointer;
  font: inherit;
  line-height: 1.2;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background 0.18s ease;
}

.reader-preview__code-copy:hover:not(:disabled),
.reader-preview__code-copy:focus-visible {
  border-color: var(--reader-link);
  color: var(--reader-link);
}

.reader-preview__code-copy:disabled {
  cursor: wait;
  opacity: 0.72;
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
