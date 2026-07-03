<template>
  <component
    :is="listTag"
    class="reader-preview__list"
    :class="{ 'reader-preview__task-list': block.task }"
  >
    <li
      v-for="(item, itemIndex) in block.items"
      :key="`${itemIndex}-${item.blocks.length}`"
    >
      <input
        v-if="block.task && item.checked !== undefined"
        type="checkbox"
        :checked="item.checked"
        disabled
      />
      <div class="reader-preview__list-item-blocks">
        <PostBodyReaderBlock
          v-for="(childBlock, childIndex) in item.blocks"
          :key="`${childIndex}-${childBlock.type}`"
          :block="childBlock"
        />
      </div>
    </li>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { ListBlock } from "@/entities/post-body";

import PostBodyReaderBlock from "../PostBodyReaderBlock.vue";

type ListTag = "ol" | "ul";

const props = defineProps<{
  block: ListBlock;
}>();

const listTag = computed<ListTag>(() => (props.block.ordered ? "ol" : "ul"));
</script>

<style scoped>
.reader-preview__list {
  margin: 10px 0;
  padding-left: 22px;
  color: var(--reader-text);
  font-size: 15px;
  line-height: 1.62;
}

.reader-preview__list li + li {
  margin-top: 4px;
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
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  margin-top: 6px;
  accent-color: var(--reader-task-accent);
}

.reader-preview__list-item-blocks {
  min-width: 0;
}

.reader-preview__list-item-blocks > :first-child {
  margin-top: 0;
}

.reader-preview__list-item-blocks > :last-child {
  margin-bottom: 0;
}
</style>
