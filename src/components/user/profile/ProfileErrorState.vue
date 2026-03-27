<script setup lang="ts">
import SiteErrorState from '@/components/common/SiteErrorState.vue';

interface Props {
  message: string;
  isUnauthorizedError: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  retry: [];
  'go-login': [];
  'go-home': [];
}>();
</script>

<template>
  <div class="profile-error-state">
    <div
      v-if="props.isUnauthorizedError"
      class="auth-required-state"
    >
      <div
        class="auth-required-icon"
        aria-hidden="true"
      >
        401
      </div>
      <h2 class="auth-required-title">
        请先登录
      </h2>
      <p class="auth-required-description">
        当前页面需要登录后访问。登录后可查看完整的用户资料、收藏和关注信息。
      </p>
      <div class="auth-required-actions">
        <el-button
          type="primary"
          @click="emit('go-login')"
        >
          去登录
        </el-button>
        <el-button @click="emit('go-home')">
          返回首页
        </el-button>
        <el-button
          text
          @click="emit('retry')"
        >
          重新加载
        </el-button>
      </div>
    </div>

    <SiteErrorState
      v-else
      title="加载用户信息失败"
      :message="props.message"
      mode="section"
      retry-text="重试加载"
      @retry="emit('retry')"
    />
  </div>
</template>

<style scoped>
.profile-error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--color-text-secondary);
}

.auth-required-state {
  width: min(560px, 100%);
  padding: var(--space-lg) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

.auth-required-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-md);
  border: 1px solid var(--color-warning);
  border-radius: 50%;
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
  font-size: 1.75rem;
}

.auth-required-title {
  margin: 0 0 var(--space-sm);
  color: var(--color-text-primary);
  font-size: 1.5rem;
}

.auth-required-description {
  margin: 0 0 var(--space-lg);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.auth-required-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-sm);
}

@media (max-width: 480px) {
  .auth-required-state {
    padding: var(--space-md) 0;
  }

  .auth-required-actions {
    flex-direction: column;
  }
}
</style>
