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
  gap: 8px;
  min-height: 76px;
  padding: 12px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--color-text);
  transition:
    color var(--transition-base),
    opacity var(--transition-base);
}

.action-btn:hover:not(:disabled) {
  color: var(--color-cta);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn[aria-pressed='true'] {
  color: var(--color-cta);
}

.action-btn__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.35), transparent 65%),
    color-mix(in srgb, var(--color-bg-secondary) 90%, transparent);
  box-shadow:
    var(--shadow-inner),
    0 10px 22px rgba(15, 23, 42, 0.06);
}

.action-btn__icon {
  width: 16px;
  height: 16px;
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
  font-size: 0.76rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.25;
}

.action-btn__value {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 0.74rem;
}

.action-btn--compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 54px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
}

.action-btn__icon-wrap--compact {
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.action-btn__icon--compact {
  width: 15px;
  height: 15px;
}

.action-btn__copy--compact {
  gap: 1px;
}

.action-btn__copy--compact .action-btn__label {
  font-size: 0.8rem;
}

.action-btn__copy--compact .action-btn__value {
  margin-top: 0;
  font-size: 0.88rem;
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
    min-height: 64px;
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
</style>
