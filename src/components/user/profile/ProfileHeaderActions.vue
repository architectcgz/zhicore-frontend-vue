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
    <el-button
      v-if="props.isCurrentUser"
      type="primary"
      @click="emit('edit-profile')"
    >
      编辑资料
    </el-button>
    <el-button
      v-else
      :type="props.isFollowing ? 'default' : 'primary'"
      :loading="props.followLoading"
      @click="emit('follow-toggle')"
    >
      {{ props.isFollowing ? '取消关注' : '关注' }}
    </el-button>
    <el-button
      v-if="!props.isCurrentUser"
      :loading="props.isCreatingConversation"
      @click="emit('send-message')"
    >
      发私信
    </el-button>
  </div>
</template>

<style scoped>
.action-section {
  display: flex;
  gap: var(--space-sm);
  padding-top: var(--space-md);
}

@media (max-width: 768px) {
  .action-section {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .action-section {
    flex-direction: column;
  }
}
</style>
