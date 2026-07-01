<template>
  <div class="reader-preview__table-wrap">
    <table class="reader-preview__table">
      <thead>
        <tr>
          <th
            v-for="(header, headerIndex) in block.headers"
            :key="`${headerIndex}-${header.content}`"
          >
            <EditorInlineNodes :nodes="header.inlineNodes" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
          <td
            v-for="(cell, cellIndex) in row"
            :key="`${rowIndex}-${cellIndex}-${cell.content}`"
          >
            <EditorInlineNodes :nodes="cell.inlineNodes" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { EditorShowcaseDraftBlock } from "@/features/editor-showcase/model";

import EditorInlineNodes from "./EditorInlineNodes.vue";

type TableBlock = Extract<EditorShowcaseDraftBlock, { type: "table" }>;

defineProps<{
  block: TableBlock;
}>();
</script>

<style scoped>
.reader-preview__table-wrap {
  overflow-x: auto;
  margin: 14px 0;
  border: 1px solid var(--reader-code-border);
  border-radius: 8px;
  background: var(--reader-block-bg);
}

.reader-preview__table {
  width: 100%;
  min-width: 420px;
  border-collapse: collapse;
  color: var(--reader-text);
  font-size: 14px;
  line-height: 1.56;
}

.reader-preview__table th,
.reader-preview__table td {
  border-bottom: 1px solid var(--reader-code-caption-border);
  padding: 9px 11px;
  text-align: left;
  vertical-align: top;
}

.reader-preview__table th {
  color: var(--reader-strong);
  font-weight: 760;
}

.reader-preview__table tbody tr:last-child td {
  border-bottom: 0;
}
</style>
