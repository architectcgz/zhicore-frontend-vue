<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  message: string;
  detail?: string;
  retryText?: string;
  mode?: 'page' | 'section';
  showRetry?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '暂时无法加载内容',
  detail: '',
  retryText: '重试',
  mode: 'section',
  showRetry: true,
});

const emit = defineEmits<{
  retry: [];
}>();

const rootClass = computed(() => ['site-error-state', `site-error-state--${props.mode}`]);

const handleRetry = () => {
  emit('retry');
};
</script>

<template>
  <section
    :class="rootClass"
    role="status"
    aria-live="polite"
  >
    <div class="site-error-state__head">
      <svg
        class="site-error-state__icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="site-error-state__copy">
        <h2 class="site-error-state__title">
          {{ title }}
        </h2>
        <p class="site-error-state__message">
          {{ message }}
        </p>
      </div>
    </div>

    <p
      v-if="detail"
      class="site-error-state__detail"
    >
      {{ detail }}
    </p>

    <div
      v-if="showRetry || $slots.actions"
      class="site-error-state__actions"
    >
      <button
        v-if="showRetry"
        class="site-error-state__button"
        type="button"
        @click="handleRetry"
      >
        {{ retryText }}
      </button>

      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.site-error-state {
  width: min(760px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: var(--color-text);
}

.site-error-state--page {
  min-height: 320px;
  justify-content: center;
  padding: clamp(20px, 3vw, 30px) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border-light);
}

.site-error-state--section {
  min-height: 240px;
  justify-content: center;
  padding: clamp(18px, 2.6vw, 24px) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border-light);
}

.site-error-state__head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.site-error-state__icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin-top: 2px;
  color: var(--color-danger);
}

.site-error-state__copy {
  min-width: 0;
}

.site-error-state__title {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.45rem, 2.2vw, 1.68rem);
  line-height: 1.24;
}

.site-error-state__message {
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 1.02rem;
  line-height: 1.65;
}

.site-error-state__detail {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.site-error-state__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.site-error-state__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-cta);
  color: var(--color-text-inverse);
  font-size: 0.98rem;
  font-weight: var(--font-weight-semibold);
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base);
}

.site-error-state__button:hover {
  background: var(--color-cta-hover);
}

.site-error-state__button:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

@media (max-width: 900px) {
  .site-error-state__actions {
    width: 100%;
  }

  .site-error-state__button {
    flex: 1 1 100%;
  }
}
</style>
