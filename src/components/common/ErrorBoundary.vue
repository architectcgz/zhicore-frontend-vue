<!--
  错误边界组件
  捕获子组件中的错误并显示友好的错误界面
  提供重试和返回首页功能
-->

<script setup lang="ts">
import { ref, onErrorCaptured, nextTick } from 'vue';
import { useRouter } from 'vue-router';

// 定义属性接口
interface Props {
  /** 是否显示错误详情 */
  showDetails?: boolean;
  /** 自定义错误标题 */
  title?: string;
  /** 自定义错误描述 */
  description?: string;
  /** 是否显示重试按钮 */
  showRetry?: boolean;
  /** 是否显示返回首页按钮 */
  showHome?: boolean;
  /** 是否自动上报错误 */
  autoReport?: boolean;
  /** 错误级别 */
  level?: 'error' | 'warning' | 'info';
}

// 定义事件
const emit = defineEmits<{
  error: [error: Error, instance: any, info: string];
  retry: [];
  home: [];
}>();

// 定义属性默认值
const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  title: '页面出现了问题',
  description: '抱歉，页面遇到了一些技术问题。请尝试刷新页面或稍后再试。',
  showRetry: true,
  showHome: true,
  autoReport: true,
  level: 'error',
});

// 路由
const router = useRouter();

// 响应式状态
const hasError = ref(false);
const errorInfo = ref<{
  error: Error | null;
  errorString: string;
  info: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}>({
  error: null,
  errorString: '',
  info: '',
  timestamp: new Date(),
  userAgent: '',
  url: '',
});

const retryCount = ref(0);
const maxRetries = 3;

/**
 * 捕获错误
 */
onErrorCaptured((error: Error, instance: any, info: string) => {
  console.error('ErrorBoundary caught an error:', error, info);
  
  hasError.value = true;
  errorInfo.value = {
    error,
    errorString: error.toString(),
    info,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  // 发出错误事件
  emit('error', error, instance, info);
  
  // 自动上报错误
  if (props.autoReport) {
    reportError(error, info);
  }
  
  // 阻止错误继续传播
  return false;
});

/**
 * 上报错误到服务器
 */
const reportError = async (error: Error, info: string) => {
  try {
    // TODO: 实现错误上报逻辑
    const errorReport = {
      message: error.message,
      stack: error.stack,
      info,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: null, // TODO: 从认证状态获取用户ID
    };
    
    console.log('Error report:', errorReport);
    
    // 发送到错误监控服务
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport),
    // });
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
};

/**
 * 重试操作
 */
const handleRetry = async () => {
  if (retryCount.value >= maxRetries) {
    alert(`已达到最大重试次数 (${maxRetries})，请刷新页面或联系客服。`);
    return;
  }
  
  retryCount.value++;
  hasError.value = false;
  errorInfo.value.error = null;
  
  emit('retry');
  
  // 等待下一个tick，让组件重新渲染
  await nextTick();
  
  // 如果仍然有错误，显示错误状态
  if (hasError.value) {
    console.warn(`Retry ${retryCount.value} failed`);
  }
};

/**
 * 返回首页
 */
const handleGoHome = () => {
  emit('home');
  router.push('/');
};

/**
 * 刷新页面
 */
const handleRefresh = () => {
  window.location.reload();
};

/**
 * 复制错误信息
 */
const handleCopyError = async () => {
  const errorText = `
错误时间: ${errorInfo.value.timestamp.toLocaleString()}
错误信息: ${errorInfo.value.errorString}
错误详情: ${errorInfo.value.info}
页面地址: ${errorInfo.value.url}
浏览器: ${errorInfo.value.userAgent}
  `.trim();
  
  try {
    await navigator.clipboard.writeText(errorText);
    alert('错误信息已复制到剪贴板');
  } catch (err) {
    console.error('Failed to copy error info:', err);
    // 降级方案：选择文本
    const textArea = document.createElement('textarea');
    textArea.value = errorText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('错误信息已复制到剪贴板');
  }
};

/**
 * 格式化错误堆栈
 */
const formatStack = (stack: string | undefined): string => {
  if (!stack) return '';
  
  return stack
    .split('\n')
    .slice(0, 10) // 只显示前10行
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
};
</script>

<template>
  <div class="error-boundary">
    <!-- 正常内容 -->
    <template v-if="!hasError">
      <slot />
    </template>
    
    <!-- 错误状态 -->
    <div
      v-else
      class="error-boundary__error"
      :class="`error-boundary__error--${level}`"
    >
      <div class="error-boundary__container">
        <!-- 错误图标 -->
        <div class="error-boundary__icon">
          <span v-if="level === 'error'">💥</span>
          <span v-else-if="level === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        
        <!-- 错误信息 -->
        <div class="error-boundary__content">
          <h2 class="error-boundary__title">
            {{ title }}
          </h2>
          
          <p class="error-boundary__description">
            {{ description }}
          </p>
          
          <!-- 错误详情（开发模式或显式启用时） -->
          <div
            v-if="showDetails && errorInfo.error"
            class="error-boundary__details"
          >
            <details class="error-boundary__details-toggle">
              <summary class="error-boundary__details-summary">
                查看技术详情
              </summary>
              
              <div class="error-boundary__details-content">
                <div class="error-boundary__detail-item">
                  <strong>错误信息:</strong>
                  <code class="error-boundary__code">{{ errorInfo.errorString }}</code>
                </div>
                
                <div class="error-boundary__detail-item">
                  <strong>发生时间:</strong>
                  <span>{{ errorInfo.timestamp.toLocaleString() }}</span>
                </div>
                
                <div class="error-boundary__detail-item">
                  <strong>组件信息:</strong>
                  <code class="error-boundary__code">{{ errorInfo.info }}</code>
                </div>
                
                <div
                  v-if="errorInfo.error?.stack"
                  class="error-boundary__detail-item"
                >
                  <strong>错误堆栈:</strong>
                  <pre class="error-boundary__stack">{{ formatStack(errorInfo.error.stack) }}</pre>
                </div>
                
                <button
                  class="error-boundary__copy-button"
                  @click="handleCopyError"
                >
                  📋 复制错误信息
                </button>
              </div>
            </details>
          </div>
          
          <!-- 重试次数提示 -->
          <div
            v-if="retryCount > 0"
            class="error-boundary__retry-info"
          >
            已重试 {{ retryCount }} 次 (最多 {{ maxRetries }} 次)
          </div>
          
          <!-- 操作按钮 -->
          <div class="error-boundary__actions">
            <button
              v-if="showRetry && retryCount < maxRetries"
              class="error-boundary__button error-boundary__button--primary"
              @click="handleRetry"
            >
              🔄 重试
            </button>
            
            <button
              class="error-boundary__button error-boundary__button--secondary"
              @click="handleRefresh"
            >
              🔃 刷新页面
            </button>
            
            <button
              v-if="showHome"
              class="error-boundary__button error-boundary__button--secondary"
              @click="handleGoHome"
            >
              🏠 返回首页
            </button>
          </div>
          
          <!-- 自定义操作插槽 -->
          <div
            v-if="$slots.actions"
            class="error-boundary__custom-actions"
          >
            <slot
              name="actions"
              :error="errorInfo.error"
              :retry="handleRetry"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-boundary__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--space-xl);
  background-color: var(--color-bg);
}

.error-boundary__container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

/* ========== 错误图标 ========== */

.error-boundary__icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* ========== 错误内容 ========== */

.error-boundary__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.error-boundary__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.error-boundary__description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* ========== 错误级别样式 ========== */

.error-boundary__error--error .error-boundary__title {
  color: var(--color-danger);
}

.error-boundary__error--warning .error-boundary__title {
  color: var(--color-warning);
}

.error-boundary__error--info .error-boundary__title {
  color: var(--color-info);
}

/* ========== 错误详情 ========== */

.error-boundary__details {
  text-align: left;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.error-boundary__details-toggle {
  width: 100%;
}

.error-boundary__details-summary {
  padding: var(--space-md) var(--space-lg);
  background-color: var(--color-bg-tertiary);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  border: none;
  outline: none;
  transition: background-color var(--transition-base);
}

.error-boundary__details-summary:hover {
  background-color: var(--color-hover);
}

.error-boundary__details-content {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.error-boundary__detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.error-boundary__detail-item strong {
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.error-boundary__code {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  word-break: break-all;
}

.error-boundary__stack {
  background-color: var(--color-bg-tertiary);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.error-boundary__copy-button {
  align-self: flex-start;
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.error-boundary__copy-button:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
}

/* ========== 重试信息 ========== */

.error-boundary__retry-info {
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  color: var(--color-warning-dark);
  font-size: var(--font-size-sm);
  text-align: center;
}

/* ========== 操作按钮 ========== */

.error-boundary__actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.error-boundary__button {
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  min-width: 120px;
}

.error-boundary__button--primary {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
}

.error-boundary__button--primary:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.error-boundary__button--secondary {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.error-boundary__button--secondary:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
  color: var(--color-text);
}

.error-boundary__custom-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

/* ========== 响应式设计 ========== */

/* 平板设备 */
@media (max-width: 1023px) {
  .error-boundary__error {
    padding: var(--space-lg);
    min-height: 350px;
  }
  
  .error-boundary__icon {
    font-size: 3.5rem;
  }
  
  .error-boundary__title {
    font-size: var(--font-size-xl);
  }
  
  .error-boundary__description {
    font-size: var(--font-size-sm);
  }
}

/* 移动设备 */
@media (max-width: 767px) {
  .error-boundary__error {
    padding: var(--space-md);
    min-height: 300px;
  }
  
  .error-boundary__container {
    max-width: 100%;
  }
  
  .error-boundary__icon {
    font-size: 3rem;
  }
  
  .error-boundary__title {
    font-size: var(--font-size-lg);
  }
  
  .error-boundary__description {
    font-size: var(--font-size-xs);
  }
  
  .error-boundary__actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-boundary__button {
    width: 100%;
    max-width: 200px;
  }
  
  .error-boundary__details-content {
    padding: var(--space-md);
  }
  
  .error-boundary__stack {
    font-size: 10px;
  }
}

/* ========== 可访问性 ========== */

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .error-boundary__icon {
    animation: none;
  }
  
  .error-boundary__button:hover {
    transform: none;
  }
}

/* 焦点样式 */
.error-boundary__button:focus,
.error-boundary__copy-button:focus,
.error-boundary__details-summary:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.error-boundary__button:focus:not(:focus-visible),
.error-boundary__copy-button:focus:not(:focus-visible),
.error-boundary__details-summary:focus:not(:focus-visible) {
  outline: none;
}
</style>