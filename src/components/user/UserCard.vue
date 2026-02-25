<!--
  用户卡片组件
  显示用户基本信息，用于用户列表展示
-->
<template>
  <div
    class="user-card"
    @click="handleClick"
  >
    <div class="user-avatar">
      <img 
        :src="user.avatar || '/default-avatar.png'" 
        :alt="user.nickname"
        @error="handleImageError"
      >
    </div>
    <div class="user-info">
      <h3 class="user-name">
        {{ user.nickname }}
      </h3>
      <p class="user-username">
        @{{ user.username }}
      </p>
      <p
        v-if="user.bio"
        class="user-bio"
      >
        {{ truncatedBio }}
      </p>
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-number">{{ user.postsCount || 0 }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ user.followersCount || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </div>
      </div>
    </div>
    <div class="user-actions">
      <el-button 
        v-if="!isCurrentUser"
        size="small"
        :type="isFollowing ? 'default' : 'primary'"
        :loading="followLoading"
        @click.stop="handleFollowToggle"
      >
        {{ isFollowing ? '已关注' : '关注' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUser } from '@/composables/useUser';
import type { User } from '@/types';

// Props
interface Props {
  user: User;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  click: [userId: string];
}>();

// 认证状态
const authStore = useAuthStore();

// 组合式函数
const { followUser, unfollowUser } = useUser();

// 响应式状态
const followLoading = ref(false);
const imageError = ref(false);

// 计算属性
const isCurrentUser = computed(() => {
  return authStore.user?.id === props.user.id;
});

const isFollowing = computed(() => {
  // 这里应该从用户关系状态中获取，暂时返回 false
  // 实际实现中需要维护用户关系状态
  return false;
});

const truncatedBio = computed(() => {
  if (!props.user.bio) return '';
  return props.user.bio.length > 100 
    ? props.user.bio.substring(0, 100) + '...' 
    : props.user.bio;
});

/**
 * 处理卡片点击
 */
const handleClick = () => {
  emit('click', props.user.id);
};

/**
 * 处理关注/取消关注
 */
const handleFollowToggle = async () => {
  if (followLoading.value) return;

  followLoading.value = true;
  try {
    if (isFollowing.value) {
      await unfollowUser(props.user.id);
    } else {
      await followUser(props.user.id);
    }
  } catch (error) {
    console.error('关注操作失败:', error);
  } finally {
    followLoading.value = false;
  }
};

/**
 * 处理图片加载错误
 */
const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.user-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.user-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.user-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.user-card:hover .user-avatar img {
  border-color: var(--color-primary);
}

.user-info {
  flex: 1;
  text-align: center;
  margin-bottom: var(--space-md);
}

.user-name {
  margin: 0 0 var(--space-xs) 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.user-username {
  margin: 0 0 var(--space-sm) 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.user-bio {
  margin: 0 0 var(--space-md) 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
  text-align: left;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.user-actions {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .user-card {
    padding: var(--space-md);
  }

  .user-avatar img {
    width: 50px;
    height: 50px;
  }

  .user-name {
    font-size: 1rem;
  }

  .user-stats {
    gap: var(--space-md);
  }

  .stat-number {
    font-size: 1rem;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .user-card {
    background-color: var(--color-bg-secondary);
    border-color: var(--color-border);
  }

  .user-card:hover {
    border-color: var(--color-primary);
  }
}
</style>