<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';

interface Props {
  loading: boolean;
  error: string;
  listLength: number;
  hasMore: boolean;
  loadingMore: boolean;
  loadingText: string;
  errorTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  retry: [];
  'load-more': [];
}>();
</script>

<template>
  <div class="tab-content">
    <div
      v-if="props.loading"
      class="loading-content"
    >
      <LoadingSpinner />
      <p>{{ props.loadingText }}</p>
    </div>

    <div
      v-else-if="props.error"
      class="error-content"
    >
      <SiteErrorState
        :title="props.errorTitle"
        :message="props.error"
        mode="section"
        retry-text="重试加载"
        @retry="emit('retry')"
      />
    </div>

    <div
      v-else-if="props.listLength === 0"
      class="empty-content"
    >
      <EmptyState
        :icon="props.emptyIcon"
        :title="props.emptyTitle"
        :description="props.emptyDescription"
      >
        <slot name="empty-actions" />
      </EmptyState>
    </div>

    <slot v-else />

    <div
      v-if="props.hasMore"
      class="load-more"
    >
      <button
        class="load-more__button"
        type="button"
        :disabled="props.loadingMore"
        @click="emit('load-more')"
      >
        {{ props.loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tab-content {
  padding: var(--space-sm) 0 0;
}

.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.loading-content p,
.error-content p {
  margin: var(--space-md) 0;
}

.empty-content {
  padding: var(--space-xl);
}

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--space-lg) 0 0;
}

.load-more__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 116px;
  padding: 11px 18px;
  border-radius: 12px;
  border: 1px solid rgba(15, 49, 80, 0.12);
  background: rgba(255, 255, 255, 0.94);
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
}

.load-more__button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}
</style>
