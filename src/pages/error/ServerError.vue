<template>
  <div class="error-container">
    <div class="error-content">
      <!-- 500 数字 -->
      <h1 class="error-number">
        500
      </h1>

      <!-- 错误消息 -->
      <h2 class="error-title">
        服务器错误
      </h2>
      <p class="error-description">
        抱歉，服务器遇到了一些问题。我们正在努力修复，请稍后再试。
      </p>

      <!-- 插图占位符 -->
      <div class="error-illustration-placeholder">
        <span>⚠️</span>
      </div>

      <!-- 错误详情（仅开发环境） -->
      <div
        v-if="isDev && errorDetails"
        class="error-details"
      >
        <details>
          <summary class="error-details-summary">
            查看错误详情
          </summary>
          <pre class="error-details-content">{{ errorDetails }}</pre>
        </details>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <button
          class="error-action-primary"
          @click="handleRetry"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          重试
        </button>
        <router-link
          to="/"
          class="error-action-secondary"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          返回首页
        </router-link>
      </div>

      <!-- 帮助信息 -->
      <div class="error-help">
        <h3 class="error-help-title">
          您可以尝试：
        </h3>
        <ul class="error-help-list">
          <li>刷新页面重试</li>
          <li>检查网络连接</li>
          <li>稍后再试</li>
          <li>如果问题持续存在，请联系我们</li>
        </ul>
      </div>

      <!-- 联系支持 -->
      <div class="error-support">
        <p class="error-support-text">
          如果问题持续存在，请
          <a
            href="mailto:support@example.com"
            class="error-support-link"
          >
            联系技术支持
          </a>
        </p>
        <p class="error-support-id">
          错误 ID: {{ errorId }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 是否为开发环境
const isDev = computed(() => import.meta.env.DEV);

// 错误详情（从路由参数获取）
const errorDetails = computed(() => route.query.error as string | undefined);

// 错误 ID（用于追踪）
const errorId = ref('');

/**
 * 生成错误 ID
 */
const generateErrorId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ERR-${timestamp}-${random}`.toUpperCase();
};

/**
 * 处理重试
 */
const handleRetry = () => {
  // 尝试返回上一页
  if (window.history.length > 1) {
    router.back();
  } else {
    // 如果没有历史记录，返回首页
    router.push('/');
  }
};

onMounted(() => {
  errorId.value = generateErrorId();
});
</script>

<style scoped>
/* 容器 */
.error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-xl);
  background: var(--color-background);
  text-align: center;
}

.error-content {
  max-width: 800px;
  width: 100%;
}

/* 500 数字 */
.error-number {
  font-family: var(--font-heading);
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-md);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 错误消息 */
.error-title {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.error-description {
  font-size: 18px;
  color: #71717a;
  line-height: 1.6;
  margin-bottom: var(--space-2xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 插图占位符 */
.error-illustration-placeholder {
  width: 300px;
  height: 300px;
  margin: 0 auto var(--space-2xl);
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  animation: fadeIn 600ms ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 错误详情 */
.error-details {
  max-width: 600px;
  margin: 0 auto var(--space-2xl);
  text-align: left;
}

.error-details-summary {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  padding: var(--space-sm);
  background: #f3f4f6;
  border-radius: 8px;
  user-select: none;
}

.error-details-summary:hover {
  background: #e5e7eb;
}

.error-details-content {
  margin-top: var(--space-sm);
  padding: var(--space-md);
  background: #1f2937;
  color: #f3f4f6;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 操作按钮 */
.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-3xl);
  flex-wrap: wrap;
}

.error-action-primary {
  padding: 14px 32px;
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.error-action-primary:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.error-action-secondary {
  padding: 14px 32px;
  background: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-text);
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.error-action-secondary:hover {
  background: var(--color-text);
  color: white;
  transform: translateY(-2px);
}

/* 帮助信息 */
.error-help {
  max-width: 600px;
  margin: 0 auto var(--space-2xl);
  padding: var(--space-lg);
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.error-help-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.error-help-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.error-help-list li {
  padding: var(--space-sm) 0;
  color: #71717a;
  position: relative;
  padding-left: var(--space-lg);
}

.error-help-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-cta);
  font-weight: bold;
}

/* 联系支持 */
.error-support {
  padding-top: var(--space-lg);
  border-top: 1px solid #e5e7eb;
}

.error-support-text {
  font-size: 14px;
  color: #71717a;
  margin-bottom: var(--space-sm);
}

.error-support-link {
  color: var(--color-cta);
  text-decoration: none;
  font-weight: 600;
}

.error-support-link:hover {
  text-decoration: underline;
}

.error-support-id {
  font-size: 12px;
  color: #9ca3af;
  font-family: monospace;
}

/* 响应式 */
@media (max-width: 768px) {
  .error-number {
    font-size: 80px;
  }

  .error-title {
    font-size: 28px;
  }

  .error-description {
    font-size: 16px;
  }

  .error-illustration-placeholder {
    width: 200px;
    height: 200px;
    font-size: 80px;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-action-primary,
  .error-action-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
