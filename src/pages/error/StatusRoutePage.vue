<template>
  <section class="status-page">
    <div class="status-page__panel">
      <p class="status-page__code">{{ normalizedStatus }}</p>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <RouterLink to="/auth/login">返回登录页</RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  status: number
}>()

const normalizedStatus = computed(() => Number.isFinite(props.status) ? props.status : 500)

const title = computed(() => {
  if (normalizedStatus.value === 401) return '登录状态已失效'
  if (normalizedStatus.value === 404) return '页面不存在'
  return '页面暂时不可用'
})

const description = computed(() => {
  if (normalizedStatus.value === 401) return '请重新登录后继续访问。'
  if (normalizedStatus.value === 404) return '请检查链接是否正确，或返回首页。'
  return '服务器暂时无法处理请求，请稍后重试。'
})
</script>

<style scoped>
.status-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-elevated-2) 100%);
}

.status-page__panel {
  width: min(420px, 100%);
  padding: 28px;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  color: var(--color-text);
}

.status-page__code {
  margin: 0;
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary-soft);
}

.status-page__panel a {
  color: var(--color-primary);
}
</style>
