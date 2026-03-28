<script setup lang="ts">
interface Props {
  isCurrentUser: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  isCreatingConversation: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'edit-profile': [];
  'follow-toggle': [];
  'send-message': [];
}>();
</script>

<template>
  <div class="action-section">
    <button
      v-if="props.isCurrentUser"
      class="action-button action-button--primary"
      type="button"
      @click="emit('edit-profile')"
    >
      编辑资料
    </button>
    <button
      v-else
      class="action-button"
      :class="props.isFollowing ? 'action-button--secondary' : 'action-button--primary'"
      type="button"
      :disabled="props.followLoading"
      @click="emit('follow-toggle')"
    >
      {{ props.followLoading ? '处理中...' : (props.isFollowing ? '取消关注' : '关注') }}
    </button>
    <button
      v-if="!props.isCurrentUser"
      class="action-button action-button--secondary"
      type="button"
      :disabled="props.isCreatingConversation"
      @click="emit('send-message')"
    >
      {{ props.isCreatingConversation ? '发送中...' : '发私信' }}
    </button>
  </div>
</template>

<style scoped>
.action-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  padding: 10px 17px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base),
    color var(--transition-base);
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.action-button--primary {
  background: var(--color-cta);
  color: var(--color-text-inverse);
  box-shadow: 0 10px 18px rgba(15, 118, 98, 0.14);
}

.action-button--secondary {
  border-color: rgba(15, 49, 80, 0.12);
  background: rgba(255, 255, 255, 0.96);
  color: var(--color-text);
}

@media (max-width: 768px) {
  .action-section {
    width: 100%;
    justify-content: flex-start;
  }

  .action-button {
    flex: 1 1 0;
  }
}

@media (max-width: 480px) {
  .action-section {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}
</style>
