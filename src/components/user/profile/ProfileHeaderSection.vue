<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import CheckInWidget from '@/components/user/CheckInWidget.vue';
import ProfileHeaderActions from '@/components/user/profile/ProfileHeaderActions.vue';
import ProfileUserIdentity from '@/components/user/profile/ProfileUserIdentity.vue';
import { uploadApi } from '@/api/upload';
import { userApi } from '@/api/user';
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
  'upload-avatar': [];
  'cover-updated': [url: string];
}>();

const localCoverUrl = ref<string | null>(null);
const coverUploading = ref(false);
const coverInputRef = ref<HTMLInputElement | null>(null);

const effectiveCoverUrl = computed(
  () => localCoverUrl.value ?? props.user.coverImage ?? null
);

const statItems = computed(() => [
  { label: '文章', value: props.user.postsCount || 0 },
  { label: '粉丝', value: props.user.followersCount || 0 },
  { label: '关注', value: props.user.followingCount || 0 },
]);

async function handleCoverChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件');
    return;
  }

  coverUploading.value = true;
  const previousCover = localCoverUrl.value;

  try {
    const result = await uploadApi.uploadImage(file);
    localCoverUrl.value = result.url;
    await userApi.updateUser(props.userId, { coverImageId: result.fileId });
    emit('cover-updated', result.url);
  } catch {
    localCoverUrl.value = previousCover;
    ElMessage.error('封面上传失败，请重试');
  } finally {
    coverUploading.value = false;
    if (coverInputRef.value) {
      coverInputRef.value.value = '';
    }
  }
}
</script>

<template>
  <div class="profile-header-section">
    <div class="profile-header">
      <div
        class="header-background"
        :class="{ 'header-background--gradient': !effectiveCoverUrl }"
        :style="
          effectiveCoverUrl
            ? {
              backgroundImage: 'url(' + effectiveCoverUrl + ')',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
            : undefined
        "
      >
        <template v-if="props.isCurrentUser">
          <input
            ref="coverInputRef"
            type="file"
            accept="image/*"
            class="cover-input-hidden"
            @change="handleCoverChange"
          >
          <button
            class="cover-upload-btn"
            type="button"
            :disabled="coverUploading"
            @click="coverInputRef?.click()"
          >
            {{ coverUploading ? '上传中...' : '更换封面' }}
          </button>
        </template>
      </div>

      <div class="header-surface">
        <div class="header-main">
          <ProfileUserIdentity
            :user="props.user"
            :is-current-user="props.isCurrentUser"
            @upload-avatar="emit('upload-avatar')"
          />

          <div class="header-aside">
            <ProfileHeaderActions
              :is-current-user="props.isCurrentUser"
              :is-following="props.isFollowing"
              :follow-loading="props.followLoading"
              :is-creating-conversation="props.isCreatingConversation"
              @edit-profile="emit('edit-profile')"
              @follow-toggle="emit('follow-toggle')"
              @send-message="emit('send-message')"
            />

            <div class="header-stats">
              <div
                v-for="item in statItems"
                :key="item.label"
                class="header-stat"
              >
                <span class="header-stat__value">{{ item.value }}</span>
                <span class="header-stat__label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
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
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(15, 49, 80, 0.08);
  background: rgba(255, 252, 247, 0.98);
  box-shadow: 0 18px 42px rgba(16, 39, 56, 0.08);
}

.header-background {
  position: relative;
  height: 168px;
}

.header-background::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 54px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(8, 19, 31, 0.14));
}

.header-background--gradient {
  background: linear-gradient(
    135deg,
    rgba(18, 49, 76, 0.98) 0%,
    rgba(15, 118, 98, 0.92) 56%,
    rgba(176, 129, 34, 0.92) 100%
  );
}

.cover-input-hidden {
  display: none;
}

.cover-upload-btn {
  position: absolute;
  right: 18px;
  bottom: 16px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(8, 19, 31, 0.36);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.cover-upload-btn:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.header-surface {
  position: relative;
  z-index: 1;
  padding: 0 clamp(20px, 4vw, 32px) 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 245, 239, 0.94));
}

.header-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 28px;
  margin-top: -34px;
}

.header-aside {
  display: flex;
  min-width: 290px;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  padding-top: 46px;
}

.header-stats {
  display: flex;
  gap: 24px;
  padding-top: 14px;
  border-top: 1px solid rgba(15, 49, 80, 0.08);
}

.header-stat {
  display: flex;
  min-width: 64px;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.header-stat__value {
  color: var(--color-text);
  font-size: clamp(1.5rem, 2vw, 1.95rem);
  font-weight: 800;
  line-height: 1.05;
}

.header-stat__label {
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.check-in-section {
  margin-top: var(--space-lg);
}

@media (max-width: 1080px) {
  .header-main {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .header-aside {
    width: 100%;
    min-width: auto;
    align-items: flex-start;
    gap: 14px;
    padding-top: 0;
  }

  .header-stats {
    justify-content: flex-start;
    padding-top: 0;
    border-top: none;
  }
}

@media (max-width: 768px) {
  .header-background {
    height: 154px;
  }

  .header-surface {
    padding: 0 var(--space-lg) var(--space-lg);
  }

  .header-main {
    margin-top: -26px;
  }
}

@media (max-width: 560px) {
  .profile-header {
    border-radius: 18px;
  }

  .header-background {
    height: 144px;
  }

  .header-surface {
    padding: 0 var(--space-md) var(--space-md);
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
    gap: 12px;
  }

  .header-stat {
    min-width: 0;
    flex: 1 1 0;
    align-items: flex-start;
    text-align: left;
  }
}
</style>
