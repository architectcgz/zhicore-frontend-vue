<!--
  通用刷新按钮组件
  可复用的刷新按钮，支持加载状态和自定义样式
-->

<template>
  <button
    class="refresh-button"
    :class="[
      size === 'small' ? 'refresh-button-sm' : 'refresh-button-md',
      variant === 'primary' ? 'refresh-button-primary' : 'refresh-button-secondary',
      { 'refresh-button-disabled': disabled || loading }
    ]"
    :disabled="disabled || loading"
    :aria-label="loading ? loadingText : label"
    :title="loading ? loadingText : label"
    @click="handleClick"
  >
    <svg 
      class="refresh-icon"
      :class="{ 'animate-spin': loading }"
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
    <span
      v-if="showText"
      class="refresh-text"
    >
      {{ loading ? loadingText : label }}
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * 刷新按钮组件属性
 */
interface Props {
  /** 是否正在加载 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 按钮大小 */
  size?: 'small' | 'medium';
  /** 按钮变体 */
  variant?: 'primary' | 'secondary';
  /** 按钮标签 */
  label?: string;
  /** 加载中文本 */
  loadingText?: string;
  /** 是否显示文本 */
  showText?: boolean;
}

/**
 * 组件事件
 */
interface Emits {
  /** 点击事件 */
  (e: 'click'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  size: 'medium',
  variant: 'secondary',
  label: '刷新',
  loadingText: '刷新中...',
  showText: false,
});

const emit = defineEmits<Emits>();

const handleClick = () => {
  if (!props.loading && !props.disabled) {
    emit('click');
  }
};
</script>

<style scoped>
/* 基础样式 */
.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.refresh-button:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

/* 大小变体 */
.refresh-button-sm {
  padding: 0.375rem;
  font-size: 0.875rem;
}

.refresh-button-md {
  padding: 0.5rem;
  font-size: 1rem;
}

/* 颜色变体 */
.refresh-button-primary {
  background-color: var(--color-cta);
  color: white;
}

.refresh-button-primary:hover:not(.refresh-button-disabled) {
  background-color: var(--color-cta-hover);
  transform: translateY(-1px);
}

.refresh-button-secondary {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.refresh-button-secondary:hover:not(.refresh-button-disabled) {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

/* 禁用状态 */
.refresh-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 图标 */
.refresh-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s;
}

.refresh-button-sm .refresh-icon {
  width: 1rem;
  height: 1rem;
}

/* 旋转动画 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 文本 */
.refresh-text {
  white-space: nowrap;
}

/* 暗色主题 */
[data-theme='dark'] .refresh-button-secondary {
  color: var(--color-text-secondary-dark);
}

[data-theme='dark'] .refresh-button-secondary:hover:not(.refresh-button-disabled) {
  background-color: var(--color-background-dark);
  color: var(--color-text-primary-dark);
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .refresh-button,
  .refresh-icon {
    transition: none;
  }
  
  .animate-spin {
    animation: none;
  }
}
</style>
