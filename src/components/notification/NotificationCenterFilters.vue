<script setup lang="ts">
interface Props {
  unreadCount: number;
  total: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'mark-all-read': [];
}>();
</script>

<template>
  <div class="notification-center__filters">
    <div class="notification-center__summary">
      <p class="notification-center__summary-title">
        当前展示为聚合通知
      </p>
      <p class="notification-center__summary-text">
        相同类型与同一目标的提醒会自动合并展示，通知中心与右上角实时未读数保持一致。
      </p>
    </div>

    <div class="notification-center__actions">
      <button
        v-if="props.unreadCount > 0"
        class="notification-center__action-btn"
        @click="emit('mark-all-read')"
      >
        全部已读
      </button>
      <span
        v-else-if="props.total > 0"
        class="notification-center__hint"
      >
        当前已全部读完
      </span>
    </div>
  </div>
</template>

<style scoped>
.notification-center__filters {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
}

.notification-center__summary {
  display: grid;
  gap: var(--space-xs);
}

.notification-center__summary-title {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.notification-center__summary-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.notification-center__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-sm);
}

.notification-center__action-btn {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-center__action-btn:hover {
  border-color: var(--color-cta);
  background-color: var(--color-hover);
}

.notification-center__hint {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (max-width: 767px) {
  .notification-center__filters {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-md);
  }

  .notification-center__actions {
    justify-content: flex-start;
  }

  .notification-center__action-btn {
    width: 100%;
  }
}
</style>
