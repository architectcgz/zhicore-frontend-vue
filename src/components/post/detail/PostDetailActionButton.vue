<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Props {
  icon: IconDefinition;
  label: string;
  value: string;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  compact: false,
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    :class="props.compact ? 'action-btn action-btn--compact' : 'action-btn'"
    type="button"
    :disabled="props.disabled"
    :aria-pressed="props.active"
    @click="emit('click')"
  >
    <span
      :class="
        props.compact
          ? 'action-btn__icon-wrap action-btn__icon-wrap--compact'
          : 'action-btn__icon-wrap'
      "
    >
      <FontAwesomeIcon
        :icon="props.icon"
        :class="props.compact ? 'action-btn__icon action-btn__icon--compact' : 'action-btn__icon'"
      />
    </span>
    <span
      :class="props.compact ? 'action-btn__copy action-btn__copy--compact' : 'action-btn__copy'"
    >
      <span class="action-btn__label">{{ props.label }}</span>
      <span class="action-btn__value">{{ props.value }}</span>
    </span>
  </button>
</template>

<style scoped>
.action-btn {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  gap: 6px;
  min-height: 72px;
  width: 100%;
  padding: 12px 6px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;
}

.action-btn:hover:not(:disabled) {
  color: var(--color-cta);
  background: color-mix(in srgb, var(--color-accent, #34d399) 8%, transparent);
  transform: translateY(-1px);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn[aria-pressed='true'] {
  color: var(--color-cta);
}

.action-btn[aria-pressed='true'] .action-btn__icon-wrap {
  background: color-mix(in srgb, var(--color-accent, #34d399) 16%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-accent, #34d399) 30%, transparent),
    var(--shadow-inner);
}

.action-btn__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-bg-secondary) 80%, transparent);
  box-shadow: var(--shadow-inner);
  transition:
    background-color 150ms ease,
    box-shadow 150ms ease;
}

.action-btn__icon {
  width: 15px;
  height: 15px;
}

.action-btn__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  text-align: center;
}

.action-btn__label {
  color: currentColor;
  font-size: 0.7rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 72px;
}

.action-btn__value {
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

/* ── 紧凑模式（移动端底栏）── */
.action-btn--compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 52px;
  border-radius: var(--radius-md);
  padding: 8px 4px;
}

.action-btn__icon-wrap--compact {
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.action-btn__icon--compact {
  width: 16px;
  height: 16px;
}

.action-btn__copy--compact {
  gap: 0;
}

.action-btn__copy--compact .action-btn__label {
  font-size: 0.72rem;
  max-width: none;
}

.action-btn__copy--compact .action-btn__value {
  font-size: 0.82rem;
  font-weight: var(--font-weight-semibold);
  color: currentColor;
}

.action-btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@media (max-width: 900px) {
  .action-btn:not(.action-btn--compact) {
    grid-template-columns: 44px minmax(0, 1fr);
    justify-items: stretch;
    align-items: center;
    gap: 12px;
    min-height: 60px;
    padding: 10px 0;
  }

  .action-btn:not(.action-btn--compact) .action-btn__copy {
    align-items: flex-start;
    text-align: left;
  }

  .action-btn:not(.action-btn--compact) .action-btn__label,
  .action-btn:not(.action-btn--compact) .action-btn__value {
    font-size: inherit;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-btn {
    transition: color 150ms ease;
  }
}
</style>
