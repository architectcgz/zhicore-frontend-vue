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
      <el-button
        :loading="props.loadingMore"
        @click="emit('load-more')"
      >
        加载更多
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.tab-content {
  padding: var(--space-lg) 0;
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
  padding: var(--space-lg);
}
</style>
