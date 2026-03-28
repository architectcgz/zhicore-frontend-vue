<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/types';

/**
 * ProfileUserIdentity
 * 展示用户头像、昵称、用户名、简介及统计数据（文章/粉丝/关注）。
 * 桌面端：头像上移覆盖 banner 底部，昵称与 username 左对齐，bio 和统计并排。
 * 移动端：所有内容居中排列。
 */

interface Props {
  /** 用户数据对象 */
  user: User;
  /** 是否为当前登录用户，控制头像编辑按钮的可见性 */
  isCurrentUser: boolean;
}

const props = defineProps<Props>();

/**
 * 触发头像上传，由父组件处理实际上传逻辑
 * 使用隐藏 <input type="file"> + label 触发，避免直接操作 DOM
 */
const emit = defineEmits<{
  /** 用户点击头像编辑按钮后触发，父组件负责打开文件选择器并处理上传 */
  'upload-avatar': [];
}>();

/** 统计项：文章数、粉丝数、关注数 */
const statItems = computed(() => [
  { label: '文章', value: props.user.postsCount },
  { label: '粉丝', value: props.user.followersCount },
  { label: '关注', value: props.user.followingCount },
]);

/** 处理文件输入变更，选择文件后向父组件发出 upload-avatar 事件 */
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    emit('upload-avatar');
    // 重置 input，确保同一文件可再次触发
    input.value = '';
  }
}
</script>

<template>
  <div class="user-identity">
    <!-- 头像区域：桌面端通过 margin-top: -52px 上移覆盖 banner 底部 -->
    <div class="avatar-wrapper">
      <img
        :src="props.user.avatar || '/images/default-avatar.svg'"
        :alt="props.user.nickname"
        class="user-avatar"
        loading="lazy"
      >

      <!-- 头像编辑按钮：仅当前用户可见 -->
      <template v-if="props.isCurrentUser">
        <!-- 隐藏的文件输入，接受图片格式 -->
        <input
          id="avatar-upload-input"
          type="file"
          accept="image/*"
          class="avatar-file-input"
          aria-label="更换头像"
          @change="handleFileChange"
        >
        <!-- label 触发文件选择器，样式为圆形相机图标按钮 -->
        <label
          for="avatar-upload-input"
          class="avatar-edit-btn"
          title="更换头像"
          role="button"
          tabindex="0"
          @keydown.enter.prevent="($el as HTMLElement).click()"
        >
          <!-- 相机图标 SVG -->
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
            <circle cx="12" cy="13" r="4" />
          </svg>
        </label>
      </template>
    </div>

    <!-- 信息区域 -->
    <div class="info-section">
      <!-- 昵称行 -->
      <h1 class="user-name">
        {{ props.user.nickname }}
      </h1>

      <!-- @用户名 -->
      <p class="user-username">
        @{{ props.user.username }}
      </p>

      <!-- 简介 + 统计数据并排（仅桌面端） -->
      <div class="bio-stats-row">
        <!-- 简介（有内容才渲染） -->
        <p
          v-if="props.user.bio"
          class="user-bio"
        >
          {{ props.user.bio }}
        </p>

        <!-- 统计数据 -->
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
  </div>
</template>

<style scoped>
/* ========== 整体容器 ========== */
.user-identity {
  display: flex;
  flex: 1;
  gap: var(--space-lg);
  /* 桌面端：头像顶部对齐，允许 avatar 通过负 margin 上移覆盖 banner */
  align-items: flex-start;
}

/* ========== 头像区域 ========== */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  /* 桌面端上移 52px，使头像一半覆盖 banner 底部 */
  margin-top: -52px;
}

.user-avatar {
  display: block;
  width: 104px;
  height: 104px;
  border: 4px solid white;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-lg);
}

/* 隐藏文件输入，保留在 DOM 中供 label 触发 */
.avatar-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 头像编辑按钮：32px 圆形，定位在头像右下角 */
.avatar-edit-btn {
  position: absolute;
  right: 2px;
  bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: white;
  background-color: var(--color-cta);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.avatar-edit-btn:hover {
  background-color: var(--color-cta-hover);
}

.avatar-edit-btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* ========== 信息区域 ========== */
.info-section {
  flex: 1;
  /* 顶部留一点空间，视觉上与 avatar 对齐 */
  padding-top: var(--space-sm);
}

.user-name {
  margin: 0 0 var(--space-xs);
  color: var(--color-text);
  font-size: 2rem;
  font-weight: 700;
  line-height: var(--line-height-tight, 1.25);
}

.user-username {
  margin: 0 0 var(--space-sm);
  color: var(--color-text-secondary);
  font-size: 1rem;
}

/* ========== bio + 统计并排行 ========== */
.bio-stats-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
}

.user-bio {
  flex: 1;
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.5;
}

/* 统计数据：flex row，右对齐 */
.user-stats {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  margin-top: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

/* ========== 移动端适配（≤768px）========== */
@media (max-width: 768px) {
  .user-identity {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* 移动端头像居中，取消桌面端的上移效果 */
  .avatar-wrapper {
    margin-top: 0;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
  }

  .info-section {
    padding-top: 0;
    width: 100%;
  }

  .user-name {
    font-size: 1.5rem;
  }

  /* 移动端 bio + 统计改为纵向堆叠，全部居中 */
  .bio-stats-row {
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  .user-bio {
    text-align: center;
  }

  .user-stats {
    justify-content: center;
  }
}

/* ========== 小屏额外适配（≤480px）========== */
@media (max-width: 480px) {
  .user-stats {
    gap: var(--space-md);
  }

  .stat-number {
    font-size: 1.125rem;
  }
}
</style>
