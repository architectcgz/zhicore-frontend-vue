<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/types';

interface Props {
  user: User;
}

const props = defineProps<Props>();

const statItems = computed(() => [
  { label: '文章', value: props.user.postsCount },
  { label: '粉丝', value: props.user.followersCount },
  { label: '关注', value: props.user.followingCount },
]);
</script>

<template>
  <div class="user-info">
    <div class="avatar-section">
      <img
        :src="props.user.avatar || '/images/default-avatar.svg'"
        :alt="props.user.nickname"
        class="user-avatar"
      >
    </div>

    <div class="info-section">
      <h1 class="user-name">
        {{ props.user.nickname }}
      </h1>
      <p class="user-username">
        @{{ props.user.username }}
      </p>
      <p
        v-if="props.user.bio"
        class="user-bio"
      >
        {{ props.user.bio }}
      </p>

      <div class="user-stats">
        <div
          v-for="item in statItems"
          :key="item.label"
          class="stat-item"
        >
          <span class="stat-number">{{ item.value }}</span>
          <span class="stat-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-info {
  display: flex;
  flex: 1;
  gap: var(--space-lg);
}

.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border: 4px solid var(--color-bg-primary);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-lg);
}

.info-section {
  flex: 1;
  padding-top: var(--space-md);
}

.user-name {
  margin: 0 0 var(--space-xs);
  color: var(--color-text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.user-username {
  margin: 0 0 var(--space-sm);
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.user-bio {
  margin: 0 0 var(--space-md);
  color: var(--color-text-primary);
  font-size: 1rem;
  line-height: 1.5;
}

.user-stats {
  display: flex;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.stat-label {
  margin-top: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .user-stats {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .user-stats {
    gap: var(--space-md);
  }

  .stat-number {
    font-size: 1.25rem;
  }
}
</style>
