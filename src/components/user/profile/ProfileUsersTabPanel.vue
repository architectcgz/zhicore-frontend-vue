<script setup lang="ts">
import UserCard from '@/components/user/UserCard.vue';
import ProfileCollectionPanelShell from '@/components/user/profile/ProfileCollectionPanelShell.vue';
import type { User } from '@/types';
import type { ProfileCollectionState } from '@/types/user/profile';

interface Props {
  state: ProfileCollectionState<User>;
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
  'user-click': [userId: string];
}>();
</script>

<template>
  <ProfileCollectionPanelShell
    :loading="props.state.loading"
    :error="props.state.error"
    :list-length="props.state.list.length"
    :has-more="props.state.hasMore"
    :loading-more="props.state.loadingMore"
    :loading-text="props.loadingText"
    :error-title="props.errorTitle"
    :empty-title="props.emptyTitle"
    :empty-description="props.emptyDescription"
    :empty-icon="props.emptyIcon"
    @retry="emit('retry')"
    @load-more="emit('load-more')"
  >
    <div class="users-list">
      <UserCard
        v-for="user in props.state.list"
        :key="user.id"
        :user="user"
        variant="plain"
        @click="emit('user-click', $event)"
      />
    </div>
  </ProfileCollectionPanelShell>
</template>

<style scoped>
.users-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: var(--space-lg);
}

@media (max-width: 768px) {
  .users-list {
    margin-bottom: var(--space-md);
  }
}
</style>
