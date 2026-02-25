<!--
  空状态组件
  用于显示无数据、无搜索结果等空状态
  支持自定义图标、文本和操作按钮
-->

<script setup lang="ts">
import { computed } from 'vue';

// 定义属性接口
interface Props {
  /** 空状态类型 */
  type?: 'no-data' | 'no-results' | 'no-content' | 'error' | 'offline' | 'custom';
  /** 自定义图标 */
  icon?: string;
  /** 主标题 */
  title?: string;
  /** 描述文本 */
  description?: string;
  /** 是否显示操作按钮 */
  showAction?: boolean;
  /** 操作按钮文本 */
  actionText?: string;
  /** 操作按钮类型 */
  actionType?: 'primary' | 'secondary';
  /** 图片URL（替代图标） */
  image?: string;
  /** 图片alt文本 */
  imageAlt?: string;
  /** 尺寸大小 */
  size?: 'small' | 'medium' | 'large';
}

// 定义事件
const emit = defineEmits<{
  action: [];
}>();

// 定义属性默认值
const props = withDefaults(defineProps<Props>(), {
  type: 'no-data',
  showAction: false,
  actionType: 'primary',
  size: 'medium',
});

// 预定义的空状态配置
const presetConfigs = {
  'no-data': {
    icon: '📄',
    title: '暂无数据',
    description: '这里还没有任何内容',
  },
  'no-results': {
    icon: '🔍',
    title: '未找到相关内容',
    description: '尝试调整搜索条件或浏览其他内容',
  },
  'no-content': {
    icon: '📝',
    title: '还没有内容',
    description: '成为第一个发布内容的人吧',
  },
  'error': {
    icon: '⚠️',
    title: '出现了一些问题',
    description: '请稍后重试或联系客服',
  },
  'offline': {
    icon: '📡',
    title: '网络连接异常',
    description: '请检查网络连接后重试',
  },
  'custom': {
    icon: '💭',
    title: '自定义状态',
    description: '请设置相关属性',
  },
};

// 计算当前配置
const currentConfig = computed(() => {
  const preset = presetConfigs[props.type];
  return {
    icon: props.icon || preset.icon,
    title: props.title || preset.title,
    description: props.description || preset.description,
  };
});

// 计算样式类名
const containerClasses = computed(() => [
  'empty-state',
  `empty-state--${props.size}`,
  `empty-state--${props.type}`,
]);

// 处理操作按钮点击
const handleAction = () => {
  emit('action');
};
</script>

<template>
  <div :class="containerClasses">
    <div class="empty-state__content">
      <!-- 图片或图标 -->
      <div class="empty-state__visual">
        <img
          v-if="image"
          :src="image"
          :alt="imageAlt || currentConfig.title"
          class="empty-state__image"
        >
        <div
          v-else
          class="empty-state__icon"
        >
          {{ currentConfig.icon }}
        </div>
      </div>
      
      <!-- 文本内容 -->
      <div class="empty-state__text">
        <h3 class="empty-state__title">
          {{ currentConfig.title }}
        </h3>
        <p class="empty-state__description">
          {{ currentConfig.description }}
        </p>
      </div>
      
      <!-- 操作按钮 -->
      <div
        v-if="showAction"
        class="empty-state__actions"
      >
        <button
          class="empty-state__action-button"
          :class="`empty-state__action-button--${actionType}`"
          @click="handleAction"
        >
          {{ actionText || '重试' }}
        </button>
      </div>
      
      <!-- 自定义插槽 -->
      <div
        v-if="$slots.default"
        class="empty-state__custom"
      >
        <slot />
      </div>
      
      <!-- 操作插槽 -->
      <div
        v-if="$slots.actions"
        class="empty-state__custom-actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  min-height: 200px;
}

.empty-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

/* ========== 尺寸样式 ========== */

.empty-state--small {
  min-height: 120px;
  padding: var(--space-lg);
}

.empty-state--small .empty-state__content {
  max-width: 300px;
}

.empty-state--large {
  min-height: 300px;
  padding: var(--space-3xl);
}

.empty-state--large .empty-state__content {
  max-width: 500px;
}

/* ========== 视觉元素 ========== */

.empty-state__visual {
  margin-bottom: var(--space-lg);
}

.empty-state__icon {
  font-size: 4rem;
  line-height: 1;
  opacity: 0.8;
  animation: float 3s ease-in-out infinite;
}

.empty-state--small .empty-state__icon {
  font-size: 3rem;
}

.empty-state--large .empty-state__icon {
  font-size: 5rem;
}

.empty-state__image {
  max-width: 200px;
  max-height: 200px;
  width: auto;
  height: auto;
  opacity: 0.9;
  border-radius: var(--radius-lg);
}

.empty-state--small .empty-state__image {
  max-width: 150px;
  max-height: 150px;
}

.empty-state--large .empty-state__image {
  max-width: 250px;
  max-height: 250px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ========== 文本内容 ========== */

.empty-state__text {
  margin-bottom: var(--space-lg);
}

.empty-state__title {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  line-height: var(--line-height-tight);
}

.empty-state--small .empty-state__title {
  font-size: var(--font-size-lg);
}

.empty-state--large .empty-state__title {
  font-size: var(--font-size-2xl);
}

.empty-state__description {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.empty-state--small .empty-state__description {
  font-size: var(--font-size-sm);
}

.empty-state--large .empty-state__description {
  font-size: var(--font-size-lg);
}

/* ========== 操作按钮 ========== */

.empty-state__actions {
  margin-bottom: var(--space-md);
}

.empty-state__action-button {
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  min-width: 120px;
}

.empty-state__action-button--primary {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
}

.empty-state__action-button--primary:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.empty-state__action-button--secondary {
  background-color: transparent;
  color: var(--color-cta);
  border: 1px solid var(--color-cta);
}

.empty-state__action-button--secondary:hover {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ========== 自定义内容 ========== */

.empty-state__custom {
  margin-bottom: var(--space-md);
}

.empty-state__custom-actions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  justify-content: center;
}

/* ========== 类型特定样式 ========== */

.empty-state--error .empty-state__icon {
  color: var(--color-danger);
}

.empty-state--error .empty-state__title {
  color: var(--color-danger);
}

.empty-state--offline .empty-state__icon {
  color: var(--color-warning);
}

.empty-state--offline .empty-state__title {
  color: var(--color-warning);
}

.empty-state--no-results .empty-state__icon {
  color: var(--color-info);
}

.empty-state--no-content .empty-state__icon {
  color: var(--color-cta);
}

/* ========== 响应式设计 ========== */

/* 平板设备 */
@media (max-width: 1023px) {
  .empty-state {
    padding: var(--space-lg);
    min-height: 180px;
  }
  
  .empty-state__content {
    max-width: 350px;
  }
  
  .empty-state__icon {
    font-size: 3.5rem;
  }
  
  .empty-state__title {
    font-size: var(--font-size-lg);
  }
  
  .empty-state__description {
    font-size: var(--font-size-sm);
  }
}

/* 移动设备 */
@media (max-width: 767px) {
  .empty-state {
    padding: var(--space-md);
    min-height: 160px;
  }
  
  .empty-state__content {
    max-width: 280px;
  }
  
  .empty-state__visual {
    margin-bottom: var(--space-md);
  }
  
  .empty-state__icon {
    font-size: 3rem;
  }
  
  .empty-state__image {
    max-width: 120px;
    max-height: 120px;
  }
  
  .empty-state__text {
    margin-bottom: var(--space-md);
  }
  
  .empty-state__title {
    font-size: var(--font-size-base);
  }
  
  .empty-state__description {
    font-size: var(--font-size-xs);
  }
  
  .empty-state__action-button {
    padding: var(--space-xs) var(--space-lg);
    font-size: var(--font-size-xs);
    min-width: 100px;
  }
  
  .empty-state__custom-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }
}

/* 小屏移动设备 */
@media (max-width: 479px) {
  .empty-state {
    padding: var(--space-sm);
    min-height: 140px;
  }
  
  .empty-state__content {
    max-width: 240px;
  }
  
  .empty-state__icon {
    font-size: 2.5rem;
  }
  
  .empty-state__image {
    max-width: 100px;
    max-height: 100px;
  }
}

/* ========== 可访问性 ========== */

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .empty-state__icon {
    animation: none;
  }
  
  .empty-state__action-button:hover {
    transform: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .empty-state__title {
    color: var(--color-text);
  }
  
  .empty-state__description {
    color: var(--color-text-secondary);
  }
  
  .empty-state__action-button--secondary {
    border-width: 2px;
  }
}

/* 焦点样式 */
.empty-state__action-button:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.empty-state__action-button:focus:not(:focus-visible) {
  outline: none;
}
</style>