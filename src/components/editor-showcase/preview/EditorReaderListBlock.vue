<template>
  <component
    :is="listTag"
    class="reader-preview__list"
    :class="{ 'reader-preview__task-list': block.task }"
  >
    <li
      v-for="(item, itemIndex) in block.items"
      :key="`${itemIndex}-${item.content}`"
    >
      <input
        v-if="item.checked !== undefined"
        type="checkbox"
        :checked="item.checked"
        disabled
      />
      <EditorInlineNodes :nodes="item.inlineNodes" />
    </li>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model";

import EditorInlineNodes from "./EditorInlineNodes.vue";

type ListBlock = Extract<EditorShowcaseDraftBlock, { type: "list" }>;
type ListTag = "ol" | "ul";

const props = defineProps<{
  block: ListBlock;
}>();

const listTag = computed<ListTag>(() => (props.block.ordered ? "ol" : "ul"));
</script>

<style scoped>
.reader-preview__list {
  margin: 12px 0;
  padding-left: 22px;
  color: var(--reader-text);
  font-size: 15px;
  line-height: 1.68;
}

.reader-preview__list li + li {
  margin-top: 5px;
}

.reader-preview__task-list {
  padding-left: 0;
  list-style: none;
}

.reader-preview__task-list li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.reader-preview__task-list input {
  width: 14px;
  height: 14px;
  margin-top: 6px;
  accent-color: var(--reader-task-accent);
}
</style>
