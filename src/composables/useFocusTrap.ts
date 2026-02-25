/**
 * 焦点陷阱 Composable
 * 用于在模态框或侧边栏打开时限制焦点在容器内循环
 */

import { onMounted, onUnmounted, watch, type Ref } from 'vue';

/**
 * 获取容器内所有可聚焦元素
 */
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
};

/**
 * 焦点陷阱选项
 */
interface UseFocusTrapOptions {
  /** 是否激活焦点陷阱 */
  isActive: Ref<boolean>;
  /** 容器元素引用 */
  containerRef: Ref<HTMLElement | null>;
  /** 初始焦点元素选择器（可选） */
  initialFocusSelector?: string;
  /** 返回焦点元素引用（可选） */
  returnFocusRef?: Ref<HTMLElement | null>;
}

/**
 * 使用焦点陷阱
 */
export function useFocusTrap(options: UseFocusTrapOptions) {
  const { isActive, containerRef, initialFocusSelector, returnFocusRef } = options;

  let previousActiveElement: HTMLElement | null = null;

  /**
   * 处理 Tab 键按下
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isActive.value || !containerRef.value) {
      return;
    }

    // 处理 Tab 键
    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(containerRef.value);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: 向前循环
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      }
      // Tab: 向后循环
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  /**
   * 激活焦点陷阱
   */
  const activate = () => {
    if (!containerRef.value) {
      return;
    }

    // 保存当前焦点元素
    previousActiveElement = document.activeElement as HTMLElement;

    // 设置初始焦点
    const focusableElements = getFocusableElements(containerRef.value);

    if (focusableElements.length > 0) {
      // 如果指定了初始焦点选择器，尝试找到该元素
      if (initialFocusSelector) {
        const initialElement = containerRef.value.querySelector(
          initialFocusSelector
        ) as HTMLElement;
        if (initialElement) {
          initialElement.focus();
          return;
        }
      }

      // 否则聚焦第一个可聚焦元素
      focusableElements[0].focus();
    }
  };

  /**
   * 停用焦点陷阱
   */
  const deactivate = () => {
    // 恢复之前的焦点
    if (returnFocusRef?.value) {
      returnFocusRef.value.focus();
    } else if (previousActiveElement) {
      previousActiveElement.focus();
    }

    previousActiveElement = null;
  };

  // 监听激活状态变化
  watch(isActive, (active) => {
    if (active) {
      // 延迟激活，确保 DOM 已更新
      setTimeout(activate, 100);
    } else {
      deactivate();
    }
  });

  // 挂载时添加键盘事件监听
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  // 卸载时移除键盘事件监听
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    deactivate();
  });

  return {
    activate,
    deactivate,
  };
}
