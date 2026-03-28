<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import CheckInWidget from '@/components/user/CheckInWidget.vue';
import ProfileHeaderActions from '@/components/user/profile/ProfileHeaderActions.vue';
import ProfileUserIdentity from '@/components/user/profile/ProfileUserIdentity.vue';
import { uploadApi } from '@/api/upload';
import { userApi } from '@/api/user';
import type { User } from '@/types';

/**
 * ProfileHeaderSection —— 用户主页顶部区域
 * 包含：封面横幅（支持上传）、用户身份信息、操作按钮、签到组件
 */

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
  /** 封面图更新后向父组件传出新 URL，用于乐观更新本地状态 */
  'cover-updated': [url: string];
}>();

// ─── 封面上传相关状态 ─────────────────────────────────────────────

/** 本地乐观更新后的封面 URL（上传成功前暂存，失败时回滚） */
const localCoverUrl = ref<string | null>(null);

/**
 * 实际展示的封面 URL，优先使用本地乐观值，
 * 其次使用服务端返回的 coverImage，无则为 null 显示渐变背景
 */
const effectiveCoverUrl = computed(
  () => localCoverUrl.value ?? props.user.coverImage ?? null
);

/** 封面上传进行中标志，控制按钮禁用与文字 */
const coverUploading = ref(false);

/** 隐藏的文件选择 input 的 ref */
const coverInputRef = ref<HTMLInputElement | null>(null);

// ─── 封面上传处理 ─────────────────────────────────────────────────

/**
 * 处理封面文件选择
 * 流程：校验文件类型 → 乐观更新本地预览 → 上传图片 → 更新用户信息 → emit 事件
 * 失败时回滚 localCoverUrl，并通过 ElMessage 提示用户
 */
async function handleCoverChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件');
    return;
  }

  coverUploading.value = true;
  // 记录回滚点
  const previousCover = localCoverUrl.value;

  try {
    const result = await uploadApi.uploadImage(file);
    // 乐观更新本地预览
    localCoverUrl.value = result.url;
    // 持久化到服务端用户信息
    await userApi.updateUser(props.userId, { coverImageId: result.fileId });
    // 通知父组件更新，无需全量重新请求
    emit('cover-updated', result.url);
  } catch {
    // 上传或保存失败时回滚本地预览
    localCoverUrl.value = previousCover;
    ElMessage.error('封面上传失败，请重试');
  } finally {
    coverUploading.value = false;
    // 重置 input，允许重复选择同一文件
    if (coverInputRef.value) {
      coverInputRef.value.value = '';
    }
  }
}
</script>

<template>
  <div class="profile-header-section">
    <div class="profile-header">
      <!-- 封面横幅：有封面图时显示图片，否则显示渐变背景 -->
      <div
        class="header-background"
        :class="{ 'banner-gradient': !effectiveCoverUrl }"
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
        <!-- 更换封面按钮：仅当前用户可见，绝对定位在右下角 -->
        <template v-if="props.isCurrentUser">
          <!-- 隐藏的文件选择器 -->
          <input
            ref="coverInputRef"
            type="file"
            accept="image/*"
            class="cover-input-hidden"
            @change="handleCoverChange"
          >
          <button
            class="cover-upload-btn"
            :disabled="coverUploading"
            @click="coverInputRef?.click()"
          >
            <template v-if="coverUploading">
              上传中...
            </template>
            <template v-else>
              <!-- 相机图标 -->
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle
                  cx="12"
                  cy="13"
                  r="4"
                />
              </svg>
              更换封面
            </template>
          </button>
        </template>
      </div>

      <div class="header-content">
        <!-- action buttons 通过 #actions slot 注入到昵称同行，实现 space-between 布局 -->
        <ProfileUserIdentity
          :user="props.user"
          :is-current-user="props.isCurrentUser"
          @upload-avatar="emit('upload-avatar')"
        >
          <template #actions>
            <ProfileHeaderActions
              :is-current-user="props.isCurrentUser"
              :is-following="props.isFollowing"
              :follow-loading="props.followLoading"
              :is-creating-conversation="props.isCreatingConversation"
              @edit-profile="emit('edit-profile')"
              @follow-toggle="emit('follow-toggle')"
              @send-message="emit('send-message')"
            />
          </template>
        </ProfileUserIdentity>
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

/* 封面横幅容器：必须 position: relative 以支持按钮绝对定位 */
.header-background {
  position: relative;
  height: 220px;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
}

/* 无封面图时的默认渐变背景 */
.banner-gradient {
  background: var(
    --gradient-hero,
    linear-gradient(
      135deg,
      rgba(18, 49, 76, 0.98) 0%,
      rgba(15, 118, 98, 0.92) 54%,
      rgba(183, 121, 31, 0.92) 100%
    )
  );
}

/* 隐藏的文件选择 input */
.cover-input-hidden {
  display: none;
}

/* 更换封面按钮：绝对定位在横幅右下角 */
.cover-upload-btn {
  position: absolute;
  bottom: 12px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background 0.2s ease;
  line-height: 1;
}

.cover-upload-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.62);
}

.cover-upload-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.header-content {
  position: relative;
  display: flex;
  align-items: flex-end;
  /* justify-content 移除：actions 已内嵌到 ProfileUserIdentity 的 name-actions-row 中 */
  gap: var(--space-lg);
  margin-top: -110px;
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
