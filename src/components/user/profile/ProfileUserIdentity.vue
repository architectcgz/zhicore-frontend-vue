<script setup lang="ts">
import type { User } from '@/types';

/**
 * ProfileUserIdentity
 * 仅负责展示用户头像、昵称、用户名与简介。
 * 统计与操作按钮由外层 HeaderSection 负责编排。
 */

interface Props {
  user: User;
  isCurrentUser: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'upload-avatar': [];
}>();

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    emit('upload-avatar');
    input.value = '';
  }
}
</script>

<template>
  <div class="user-identity">
    <div class="avatar-wrapper">
      <img
        :src="props.user.avatar || '/images/default-avatar.svg'"
        :alt="props.user.nickname"
        class="user-avatar"
        loading="lazy"
      >

      <template v-if="props.isCurrentUser">
        <input
          id="avatar-upload-input"
          type="file"
          accept="image/*"
          class="avatar-file-input"
          aria-label="更换头像"
          @change="handleFileChange"
        >
        <label
          for="avatar-upload-input"
          class="avatar-edit-btn"
          title="更换头像"
          role="button"
          tabindex="0"
          @keydown.enter.prevent="($el as HTMLElement).click()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle
              cx="12"
              cy="13"
              r="4"
            />
          </svg>
        </label>
      </template>
    </div>

    <div class="info-section">
      <h1 class="user-name">
        {{ props.user.nickname }}
      </h1>
      <p class="user-username">
        @{{ props.user.username }}
      </p>
      <p class="user-bio">
        {{ props.user.bio || '这个人还没有留下简介。' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.user-identity {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: 20px;
  align-items: flex-end;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  z-index: 2;
  margin-top: -46px;
}

.user-avatar {
  display: block;
  width: 102px;
  height: 102px;
  border: 4px solid rgba(255, 255, 255, 0.96);
  border-radius: 50%;
  object-fit: cover;
  background: #d7e0ea;
  box-shadow: 0 14px 28px rgba(15, 49, 80, 0.14);
}

.avatar-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.avatar-edit-btn {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: white;
  background-color: var(--color-cta);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
}

.avatar-edit-btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.info-section {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
  padding-top: 14px;
  padding-bottom: 4px;
}

.user-name {
  margin: 0 0 4px;
  color: var(--color-text);
  font-size: clamp(1.7rem, 2.2vw, 2.35rem);
  font-weight: 800;
  line-height: 1.12;
}

.user-username {
  margin: 0 0 14px;
  color: var(--color-text-secondary);
  font-size: 0.98rem;
  font-weight: 600;
}

.user-bio {
  margin: 0;
  color: var(--color-text);
  font-size: 0.96rem;
  line-height: 1.75;
  max-width: 48rem;
}

@media (max-width: 768px) {
  .user-identity {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .avatar-wrapper {
    margin-top: -42px;
  }

  .user-avatar {
    width: 92px;
    height: 92px;
  }

  .info-section {
    width: 100%;
    padding-top: 0;
  }

  .user-name {
    font-size: 1.6rem;
  }

  .user-bio {
    max-width: none;
  }
}
</style>
