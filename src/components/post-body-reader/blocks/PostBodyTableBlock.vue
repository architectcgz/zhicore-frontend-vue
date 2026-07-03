<template>
  <div class="reader-preview__table-wrap">
    <table class="reader-preview__table">
      <thead>
        <tr>
          <th
            v-for="(header, headerIndex) in block.headers"
            :key="`${headerIndex}-${header.children.map((node) => node.text).join('')}`"
          >
            <PostBodyInlineNodes :nodes="header.children" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
          <td
            v-for="(cell, cellIndex) in row"
            :key="`${rowIndex}-${cellIndex}-${cell.children.map((node) => node.text).join('')}`"
          >
            <PostBodyInlineNodes :nodes="cell.children" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { TableBlock } from "@/entities/post-body";

import PostBodyInlineNodes from "../PostBodyInlineNodes.vue";

defineProps<{
  block: TableBlock;
}>();
</script>

<style scoped>
.reader-preview__table-wrap {
  overflow-x: auto;
  margin: 12px 0;
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
  padding: 8px 10px;
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
