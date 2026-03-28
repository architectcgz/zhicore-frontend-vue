<script setup lang="ts">
import type { PostReadingPresence } from '@/types';

interface Props {
  presence: PostReadingPresence;
  defaultAvatar: string;
}

const props = defineProps<Props>();

const handleAvatarError = (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) {
    return;
  }

  if (target.dataset.fallbackApplied === 'true') {
    return;
  }

  target.dataset.fallbackApplied = 'true';
  target.src = props.defaultAvatar;
};
</script>

<template>
  <div
    class="reading-presence"
    aria-live="polite"
  >
    <span class="reading-presence__count">{{ presence.readingCount }} 人在读</span>

    <div
      v-if="presence.avatars.length"
      class="reading-presence__avatars"
    >
      <span
        v-for="reader in presence.avatars"
        :key="`${reader.userId}-${reader.avatarUrl}`"
        class="reading-presence__avatar-shell"
        :title="reader.nickname"
      >
        <img
          :src="reader.avatarUrl || defaultAvatar"
          :alt="`${reader.nickname}头像`"
          class="reading-presence__avatar"
          @error="handleAvatarError"
        >
      </span>
    </div>
  </div>
</template>

<style scoped>
.reading-presence {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(233, 146, 68, 0.14), rgba(247, 239, 228, 0.82)),
    var(--color-surface-overlay);
  color: var(--color-text);
}

.reading-presence__count {
  font-size: 0.92rem;
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.reading-presence__avatars {
  display: inline-flex;
  align-items: center;
  padding-left: 2px;
}

.reading-presence__avatar-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: -8px;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-surface);
}

.reading-presence__avatar-shell:first-child {
  margin-left: 0;
}

.reading-presence__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 480px) {
  .reading-presence {
    min-height: 36px;
    padding: 0 12px;
  }

  .reading-presence__count {
    font-size: 0.84rem;
  }

  .reading-presence__avatar-shell {
    width: 24px;
    height: 24px;
  }
}
</style>
