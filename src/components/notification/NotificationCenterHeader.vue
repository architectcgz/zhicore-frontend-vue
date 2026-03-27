<script setup lang="ts">
interface Props {
  total: number;
  unreadCount: number;
}

defineProps<Props>();
</script>

<template>
  <div class="notification-center__header">
    <h1 class="notification-center__title">
      通知中心
    </h1>

    <div class="notification-center__stats">
      <span class="notification-center__stat">
        共 {{ total }} 条通知
      </span>
      <span
        v-if="unreadCount > 0"
        class="notification-center__stat notification-center__stat--unread"
      >
        {{ unreadCount }} 条未读
      </span>
    </div>
  </div>
</template>

<style scoped>
.notification-center__header {
  margin-bottom: var(--space-xl);
}

.notification-center__title {
  margin: 0 0 var(--space-md);
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.notification-center__stats {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.notification-center__stat {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.notification-center__stat--unread {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 767px) {
  .notification-center__title {
    font-size: var(--font-size-2xl);
  }
}
</style>
