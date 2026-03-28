<script setup lang="ts">
import CheckInWidget from '@/components/user/CheckInWidget.vue';
import ProfileHeaderActions from '@/components/user/profile/ProfileHeaderActions.vue';
import ProfileUserIdentity from '@/components/user/profile/ProfileUserIdentity.vue';
import type { User } from '@/types';

interface Props {
  user: User;
  userId: string;
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
  /** 转发 ProfileUserIdentity 的头像上传事件，由 Profile 页面处理实际上传 */
  'upload-avatar': [];
}>();
</script>

<template>
  <div class="profile-header-section">
    <div class="profile-header">
      <div class="header-background" />
      <div class="header-content">
        <ProfileUserIdentity
          :user="props.user"
          :is-current-user="props.isCurrentUser"
          @upload-avatar="emit('upload-avatar')"
        />

        <ProfileHeaderActions
          :is-current-user="props.isCurrentUser"
          :is-following="props.isFollowing"
          :follow-loading="props.followLoading"
          :is-creating-conversation="props.isCreatingConversation"
          @edit-profile="emit('edit-profile')"
          @follow-toggle="emit('follow-toggle')"
          @send-message="emit('send-message')"
        />
      </div>
    </div>

    <div
      v-if="props.isCurrentUser"
      class="check-in-section"
    >
      <CheckInWidget :user-id="props.userId" />
    </div>
  </div>
</template>

<style scoped>
.profile-header-section {
  margin-bottom: var(--space-lg);
}

.profile-header {
  position: relative;
  margin-bottom: var(--space-xl);
}

.header-background {
  height: 200px;
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}

.header-content {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-top: -100px;
  padding: 0 var(--space-lg);
}

.check-in-section {
  padding: 0 var(--space-lg);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    margin-top: -60px;
    padding: 0 var(--space-md);
    text-align: center;
  }

  .check-in-section {
    padding: 0 var(--space-md);
  }
}

@media (max-width: 480px) {
  .header-background {
    height: 150px;
  }
}
</style>
