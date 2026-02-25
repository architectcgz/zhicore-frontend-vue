<!--
  加载动画组件
  支持不同尺寸（small、medium、large）
  提供多种动画样式和自定义选项
-->

<script setup lang="ts">
import { computed } from 'vue';

// 定义属性接口
interface Props {
  /** 尺寸大小 */
  size?: 'small' | 'medium' | 'large';
  /** 动画类型 */
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  /** 颜色 */
  color?: 'primary' | 'secondary' | 'white' | 'current';
  /** 是否显示加载文本 */
  showText?: boolean;
  /** 自定义加载文本 */
  text?: string;
  /** 是否居中显示 */
  centered?: boolean;
  /** 是否覆盖整个容器 */
  overlay?: boolean;
}

// 定义属性默认值
const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  type: 'spinner',
  color: 'primary',
  showText: false,
  text: '加载中...',
  centered: false,
  overlay: false,
});

// 计算样式类名
const spinnerClasses = computed(() => [
  'loading-spinner',
  `loading-spinner--${props.size}`,
  `loading-spinner--${props.type}`,
  `loading-spinner--${props.color}`,
  {
    'loading-spinner--centered': props.centered,
    'loading-spinner--overlay': props.overlay,
  },
]);

// 计算尺寸值
const sizeValue = computed(() => {
  switch (props.size) {
    case 'small':
      return '16px';
    case 'large':
      return '48px';
    default:
      return '32px';
  }
});
</script>

<template>
  <div :class="spinnerClasses">
    <!-- 旋转器动画 -->
    <div
      v-if="type === 'spinner'"
      class="loading-spinner__spinner"
    >
      <svg
        class="loading-spinner__svg"
        viewBox="0 0 50 50"
      >
        <circle
          class="loading-spinner__circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="31.416"
          stroke-dashoffset="31.416"
        />
      </svg>
    </div>
    
    <!-- 点点动画 -->
    <div
      v-else-if="type === 'dots'"
      class="loading-spinner__dots"
    >
      <div class="loading-spinner__dot" />
      <div class="loading-spinner__dot" />
      <div class="loading-spinner__dot" />
    </div>
    
    <!-- 脉冲动画 -->
    <div
      v-else-if="type === 'pulse'"
      class="loading-spinner__pulse"
    >
      <div class="loading-spinner__pulse-ring" />
      <div class="loading-spinner__pulse-ring" />
      <div class="loading-spinner__pulse-ring" />
    </div>
    
    <!-- 条形动画 -->
    <div
      v-else-if="type === 'bars'"
      class="loading-spinner__bars"
    >
      <div class="loading-spinner__bar" />
      <div class="loading-spinner__bar" />
      <div class="loading-spinner__bar" />
      <div class="loading-spinner__bar" />
      <div class="loading-spinner__bar" />
    </div>
    
    <!-- 加载文本 -->
    <div
      v-if="showText"
      class="loading-spinner__text"
    >
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.loading-spinner--centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-spinner--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

[data-theme='dark'] .loading-spinner--overlay {
  background-color: rgba(24, 24, 27, 0.8);
}

/* ========== 尺寸样式 ========== */

.loading-spinner--small {
  --spinner-size: 16px;
  --dot-size: 4px;
  --bar-width: 2px;
  --bar-height: 12px;
}

.loading-spinner--medium {
  --spinner-size: 32px;
  --dot-size: 6px;
  --bar-width: 3px;
  --bar-height: 20px;
}

.loading-spinner--large {
  --spinner-size: 48px;
  --dot-size: 8px;
  --bar-width: 4px;
  --bar-height: 28px;
}

/* ========== 颜色样式 ========== */

.loading-spinner--primary {
  color: var(--color-cta);
}

.loading-spinner--secondary {
  color: var(--color-secondary);
}

.loading-spinner--white {
  color: #ffffff;
}

.loading-spinner--current {
  color: currentColor;
}

/* ========== 旋转器动画 ========== */

.loading-spinner__spinner {
  width: var(--spinner-size);
  height: var(--spinner-size);
  animation: spin 2s linear infinite;
}

.loading-spinner__svg {
  width: 100%;
  height: 100%;
}

.loading-spinner__circle {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* ========== 点点动画 ========== */

.loading-spinner__dots {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.loading-spinner__dot {
  width: var(--dot-size);
  height: var(--dot-size);
  background-color: currentColor;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-spinner__dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-spinner__dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ========== 脉冲动画 ========== */

.loading-spinner__pulse {
  position: relative;
  width: var(--spinner-size);
  height: var(--spinner-size);
}

.loading-spinner__pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid currentColor;
  border-radius: 50%;
  opacity: 1;
  animation: pulse 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.loading-spinner__pulse-ring:nth-child(2) {
  animation-delay: -0.5s;
}

.loading-spinner__pulse-ring:nth-child(3) {
  animation-delay: -1s;
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* ========== 条形动画 ========== */

.loading-spinner__bars {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: var(--bar-height);
}

.loading-spinner__bar {
  width: var(--bar-width);
  background-color: currentColor;
  border-radius: 1px;
  animation: bars 1.2s ease-in-out infinite;
}

.loading-spinner__bar:nth-child(1) {
  animation-delay: -1.2s;
}

.loading-spinner__bar:nth-child(2) {
  animation-delay: -1.1s;
}

.loading-spinner__bar:nth-child(3) {
  animation-delay: -1s;
}

.loading-spinner__bar:nth-child(4) {
  animation-delay: -0.9s;
}

.loading-spinner__bar:nth-child(5) {
  animation-delay: -0.8s;
}

@keyframes bars {
  0%, 40%, 100% {
    height: 20%;
    opacity: 0.5;
  }
  20% {
    height: 100%;
    opacity: 1;
  }
}

/* ========== 加载文本 ========== */

.loading-spinner__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-align: center;
  margin-top: var(--space-xs);
}

.loading-spinner--small .loading-spinner__text {
  font-size: var(--font-size-xs);
}

.loading-spinner--large .loading-spinner__text {
  font-size: var(--font-size-base);
}

/* ========== 响应式设计 ========== */

/* 移动设备优化 */
@media (max-width: 767px) {
  .loading-spinner--overlay {
    gap: var(--space-sm);
  }
  
  .loading-spinner__text {
    font-size: var(--font-size-xs);
  }
}

/* ========== 可访问性 ========== */

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner__spinner,
  .loading-spinner__dot,
  .loading-spinner__pulse-ring,
  .loading-spinner__bar {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
  
  .loading-spinner__circle {
    animation: none;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .loading-spinner--overlay {
    background-color: rgba(0, 0, 0, 0.9);
  }
  
  [data-theme='dark'] .loading-spinner--overlay {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>