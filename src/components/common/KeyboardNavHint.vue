<!--
  键盘导航提示组件
  显示当前可用的键盘快捷键
-->
<template>
  <div
    v-if="visible"
    class="keyboard-nav-hint"
    :class="{ visible: show }"
  >
    <div class="hint-content">
      <p class="hint-title">
        键盘快捷键
      </p>
      <ul class="hint-list">
        <li
          v-for="shortcut in shortcuts"
          :key="shortcut.key"
        >
          <kbd>{{ formatShortcut(shortcut) }}</kbd>
          <span>{{ shortcut.description }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { KeyboardShortcut } from '@/composables/useKeyboardNav';

interface Props {
  shortcuts?: KeyboardShortcut[];
  autoHide?: boolean;
  hideDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  shortcuts: () => [],
  autoHide: true,
  hideDelay: 3000,
});

const visible = ref(false);
const show = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 格式化快捷键显示
 */
const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('⌘');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
};

/**
 * 显示提示
 */
const showHint = () => {
  visible.value = true;
  setTimeout(() => {
    show.value = true;
  }, 10);
  
  if (props.autoHide) {
    if (hideTimer) {
      clearTimeout(hideTimer);
    }
    hideTimer = setTimeout(() => {
      hideHint();
    }, props.hideDelay);
  }
};

/**
 * 隐藏提示
 */
const hideHint = () => {
  show.value = false;
  setTimeout(() => {
    visible.value = false;
  }, 300);
};

/**
 * 监听键盘事件
 */
const handleKeyDown = (event: KeyboardEvent) => {
  // 按下 ? 键显示快捷键提示
  if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (visible.value) {
      hideHint();
    } else {
      showHint();
    }
  }
  
  // 按下 Escape 键隐藏提示
  if (event.key === 'Escape' && visible.value) {
    hideHint();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
});
</script>

<style scoped>
.keyboard-nav-hint {
  max-width: 300px;
}

.hint-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint-title {
  font-weight: 600;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.hint-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

kbd {
  padding: 0.125rem 0.375rem;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.75rem;
  white-space: nowrap;
}

[data-theme='dark'] kbd {
  background-color: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 0, 0, 0.4);
}
</style>
