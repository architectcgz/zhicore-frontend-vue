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

    <p
      :class="[
        'editor-action-bar__status',
        `editor-action-bar__status--${saveStatus}`,
      ]"
      aria-live="polite"
    >
      <span>{{ saveStatusLabel }}</span>
      <small>{{ wordCount }} 字</small>
      <small>上次保存 {{ lastSavedLabel }}</small>
    </p>

    <div class="editor-action-bar__actions">
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

      <button
        class="editor-action-bar__history"
        type="button"
        aria-label="撤销上一步编辑"
        :disabled="!canUndo"
        @click="emit('undo')"
      >
        撤销
      </button>

      <button
        class="editor-action-bar__history"
        type="button"
        aria-label="重做上一步编辑"
        :disabled="!canRedo"
        @click="emit('redo')"
      >
        重做
      </button>

      <button
        class="editor-action-bar__save"
        type="button"
        :disabled="!canSaveDraft"
        @click="emit('saveDraft')"
      >
        {{ saveButtonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  EditorDraftSaveStatus,
  EditorShowcaseBackground,
  EditorShowcaseBackgroundId,
  EditorShowcaseMode,
} from "@/features/editor-showcase/model";

defineProps<{
  activeMode: EditorShowcaseMode;
  activeBackgroundId: EditorShowcaseBackgroundId;
  backgroundCandidates: EditorShowcaseBackground[];
  saveStatus: EditorDraftSaveStatus;
  saveStatusLabel: string;
  saveButtonLabel: string;
  canSaveDraft: boolean;
  canUndo: boolean;
  canRedo: boolean;
  lastSavedLabel: string;
  wordCount: number;
}>();

const emit = defineEmits<{
  selectMode: [mode: EditorShowcaseMode];
  selectBackground: [backgroundId: EditorShowcaseBackgroundId];
  undo: [];
  redo: [];
  saveDraft: [];
}>();
</script>

<style scoped>
.editor-action-bar {
  display: grid;
  grid-template-columns: auto minmax(220px, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 8px;
  background: var(--editor-control-bg, rgba(255, 255, 255, 0.78));
}

.mode-switch,
.background-picker,
.editor-action-bar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mode-switch button,
.background-swatch {
  min-height: 36px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 999px;
  background: var(--editor-control-bg-muted, rgba(255, 255, 255, 0.56));
  color: var(--editor-page-muted, #405466);
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.mode-switch button {
  padding: 7px 13px;
}

.mode-switch button[aria-pressed="true"],
.background-swatch[aria-pressed="true"] {
  border-color: var(--editor-page-accent, #1f7f74);
  background: var(--editor-control-bg-active, #ffffff);
  color: var(--editor-page-text, #17202a);
}

.mode-switch button:hover,
.background-swatch:hover {
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
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.16));
  border-radius: 50%;
}

.editor-action-bar__status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: var(--editor-page-muted, #405466);
  font-size: 13px;
}

.editor-action-bar__status span {
  position: relative;
  padding-left: 14px;
  font-weight: 700;
}

.editor-action-bar__status span::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--editor-page-accent, #1f7f74);
  content: "";
  transform: translateY(-50%);
}

.editor-action-bar__status--dirty span::before {
  background: var(--editor-page-warning, #b7791f);
}

.editor-action-bar__status--saving span::before {
  background: var(--editor-page-saving, #2563eb);
}

.editor-action-bar__status small {
  color: var(--editor-page-muted, #637381);
  font-size: 12px;
}

.editor-action-bar__actions {
  justify-content: flex-end;
}

.editor-action-bar__history,
.editor-action-bar__save {
  min-width: 96px;
  min-height: 36px;
  border: 1px solid var(--editor-control-primary, #1f7f74);
  border-radius: 999px;
  font-weight: 760;
  cursor: pointer;
  transition:
    background 0.18s ease,
    opacity 0.18s ease,
    transform 0.18s ease;
}

.editor-action-bar__history {
  background: var(--editor-control-bg-active, #ffffff);
  color: var(--editor-page-text, #17202a);
}

.editor-action-bar__save {
  background: var(--editor-control-primary, #1f7f74);
  color: #ffffff;
}

.editor-action-bar__history:hover:not(:disabled),
.editor-action-bar__history:focus-visible:not(:disabled),
.editor-action-bar__save:hover:not(:disabled),
.editor-action-bar__save:focus-visible:not(:disabled) {
  transform: translateY(-1px);
}

.editor-action-bar__save:hover:not(:disabled),
.editor-action-bar__save:focus-visible:not(:disabled) {
  background: var(--editor-control-primary-hover, #176b62);
}

.editor-action-bar__history:disabled,
.editor-action-bar__save:disabled {
  border-color: var(--editor-page-border, rgba(49, 74, 91, 0.12));
  background: var(--editor-control-disabled-bg, rgba(49, 74, 91, 0.12));
  color: var(--editor-control-disabled-text, #6b7b88);
  cursor: not-allowed;
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
  .editor-action-bar__history,
  .editor-action-bar__save {
    transition: none;
  }
}
</style>
