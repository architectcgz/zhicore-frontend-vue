<template>
  <div class="editor-action-bar">
    <div class="mode-switch" aria-label="编辑器视图">
      <button
        type="button"
        :aria-pressed="activeMode === 'focus'"
        @click="emit('selectMode', 'focus')"
      >
        专注写作
      </button>
      <button
        type="button"
        :aria-pressed="activeMode === 'preview'"
        @click="emit('selectMode', 'preview')"
      >
        写作 + 预览
      </button>
    </div>

    <div class="background-picker" aria-label="背景候选">
      <button
        v-for="background in backgroundCandidates"
        :key="background.id"
        class="background-swatch"
        type="button"
        :aria-label="`切换到${background.name}背景`"
        :aria-pressed="activeBackgroundId === background.id"
        @click="emit('selectBackground', background.id)"
      >
        <span :style="{ background: background.swatch }"></span>
        {{ background.name }}
      </button>
    </div>

    <RouterLink class="document-link" to="/editor-document-showcase">
      工程文档展示
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

import type {
  EditorShowcaseBackground,
  EditorShowcaseBackgroundId,
  EditorShowcaseMode,
} from "@/features/editor-showcase/model";

defineProps<{
  activeMode: EditorShowcaseMode;
  activeBackgroundId: EditorShowcaseBackgroundId;
  backgroundCandidates: EditorShowcaseBackground[];
}>();

const emit = defineEmits<{
  selectMode: [mode: EditorShowcaseMode];
  selectBackground: [backgroundId: EditorShowcaseBackgroundId];
}>();
</script>

<style scoped>
.editor-action-bar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 8px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.64);
  backdrop-filter: blur(18px);
}

:global(.editor-showcase--ink) .editor-action-bar {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(19, 27, 38, 0.72);
}

.mode-switch,
.background-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mode-switch button,
.background-swatch,
.document-link {
  min-height: 36px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
  color: #405466;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.mode-switch button,
.document-link {
  padding: 7px 13px;
}

.mode-switch button[aria-pressed="true"],
.background-swatch[aria-pressed="true"] {
  border-color: rgba(31, 127, 116, 0.56);
  background: #ffffff;
  color: #17202a;
}

.mode-switch button:hover,
.background-swatch:hover,
.document-link:hover {
  transform: translateY(-1px);
}

.background-swatch {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 5px 10px 5px 6px;
}

.background-swatch span {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(49, 74, 91, 0.16);
  border-radius: 50%;
}

:global(.editor-showcase--ink) .mode-switch button,
:global(.editor-showcase--ink) .background-swatch,
:global(.editor-showcase--ink) .document-link {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #d7e4ee;
}

:global(.editor-showcase--ink) .mode-switch button[aria-pressed="true"],
:global(.editor-showcase--ink) .background-swatch[aria-pressed="true"] {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

@media (max-width: 980px) {
  .editor-action-bar {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mode-switch button,
  .background-swatch,
  .document-link {
    transition: none;
  }
}
</style>
