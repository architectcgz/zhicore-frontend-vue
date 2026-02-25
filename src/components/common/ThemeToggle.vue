<!--
  主题切换组件
  提供主题切换下拉菜单，支持亮色/暗色/自动三种模式
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import type { Theme } from '@/stores/theme';

const {
  theme,
  systemTheme,
  getThemeLabel,
  getThemeIcon,
  setTheme,
} = useTheme();

// 下拉菜单状态
const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

/**
 * 主题选项配置
 */
const themeOptions = [
  {
    value: 'light' as Theme,
    label: '亮色',
    icon: '☀️',
    description: '',
  },
  {
    value: 'dark' as Theme,
    label: '暗色',
    icon: '🌙',
    description: '',
  },
  {
    value: 'auto' as Theme,
    label: '自动',
    icon: '🔄',
    description: '跟随系统',
  },
];

/**
 * 切换下拉菜单
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

/**
 * 选择主题
 */
const selectTheme = (selectedTheme: Theme) => {
  setTheme(selectedTheme);
  isOpen.value = false;
};

/**
 * 点击外部关闭下拉菜单
 */
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

/**
 * 按下 Escape 键关闭下拉菜单
 */
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
};

/**
 * 获取自动模式的描述文字
 */
const getAutoDescription = () => {
  return `跟随系统 (当前: ${systemTheme.value === 'dark' ? '暗色' : '亮色'})`;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="theme-toggle"
  >
    <!-- 主题切换按钮 -->
    <button
      class="theme-toggle__button"
      :class="{ 'theme-toggle__button--active': isOpen }"
      :aria-label="`切换主题 (当前: ${getThemeLabel})`"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <!-- 图标 -->
      <span class="theme-toggle__icon">
        <span v-if="getThemeIcon === 'sun'">☀️</span>
        <span v-else-if="getThemeIcon === 'moon'">🌙</span>
        <span v-else>🔄</span>
      </span>
      
      <!-- 标签 -->
      <span class="theme-toggle__label">
        {{ getThemeLabel }}
      </span>

      <!-- 箭头图标 -->
      <span
        class="theme-toggle__arrow"
        :class="{ 'theme-toggle__arrow--up': isOpen }"
      >
        ▼
      </span>
    </button>

    <!-- 下拉菜单 -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="theme-toggle__dropdown"
        role="menu"
      >
        <button
          v-for="option in themeOptions"
          :key="option.value"
          class="theme-toggle__option"
          :class="{ 'theme-toggle__option--active': theme === option.value }"
          role="menuitem"
          @click="selectTheme(option.value)"
        >
          <span class="theme-toggle__option-icon">{{ option.icon }}</span>
          <div class="theme-toggle__option-content">
            <span class="theme-toggle__option-label">{{ option.label }}</span>
            <span
              v-if="option.value === 'auto'"
              class="theme-toggle__option-description"
            >
              {{ getAutoDescription() }}
            </span>
          </div>
          <span
            v-if="theme === option.value"
            class="theme-toggle__option-check"
          >
            ✓
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-block;
}

/* ========== 按钮样式 ========== */

.theme-toggle__button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 120px;
}

.theme-toggle__button:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
}

.theme-toggle__button--active {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
}

.theme-toggle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
}

.theme-toggle__label {
  flex: 1;
  font-weight: var(--font-weight-medium);
  text-align: left;
}

.theme-toggle__arrow {
  display: flex;
  align-items: center;
  font-size: 10px;
  color: var(--color-text-secondary);
  transition: transform var(--transition-base);
}

.theme-toggle__arrow--up {
  transform: rotate(180deg);
}

/* ========== 下拉菜单样式 ========== */

.theme-toggle__dropdown {
  position: absolute;
  top: calc(100% + var(--space-xs));
  right: 0;
  min-width: 160px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
}

[data-theme='dark'] .theme-toggle__dropdown {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* ========== 选项样式 ========== */

.theme-toggle__option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background-color: transparent;
  border: none;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.theme-toggle__option:hover {
  background-color: var(--color-hover);
}

.theme-toggle__option--active {
  background-color: var(--color-bg-secondary);
}

.theme-toggle__option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  width: 20px;
  flex-shrink: 0;
}

.theme-toggle__option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theme-toggle__option-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.theme-toggle__option-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.theme-toggle__option-check {
  display: flex;
  align-items: center;
  color: var(--color-cta);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

/* ========== 下拉动画 ========== */

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========== 响应式设计 ========== */

/* 移动设备 */
@media (max-width: 767px) {
  .theme-toggle__button {
    min-width: 100px;
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-size-xs);
  }

  .theme-toggle__icon {
    font-size: var(--font-size-base);
  }

  .theme-toggle__dropdown {
    min-width: 140px;
  }

  .theme-toggle__option {
    padding: var(--space-xs) var(--space-sm);
  }
}
</style>
