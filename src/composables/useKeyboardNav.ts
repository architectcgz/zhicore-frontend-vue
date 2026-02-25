/**
 * 键盘导航组合式函数
 * 提供键盘快捷键和焦点管理功能
 */
import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

/**
 * 键盘导航 Hook
 */
export function useKeyboardNav() {
  const shortcuts = new Map<string, KeyboardShortcut>();

  /**
   * 生成快捷键标识符
   */
  const getShortcutKey = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.meta) parts.push('meta');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  };

  /**
   * 注册快捷键
   */
  const registerShortcut = (shortcut: KeyboardShortcut) => {
    const key = getShortcutKey(shortcut);
    shortcuts.set(key, shortcut);
  };

  /**
   * 注销快捷键
   */
  const unregisterShortcut = (shortcut: KeyboardShortcut) => {
    const key = getShortcutKey(shortcut);
    shortcuts.delete(key);
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    if (event.metaKey) parts.push('meta');
    parts.push(event.key.toLowerCase());
    
    const key = parts.join('+');
    const shortcut = shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.handler(event);
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    shortcuts.clear();
  });

  return {
    registerShortcut,
    unregisterShortcut,
  };
}

/**
 * 焦点管理 Hook
 */
export function useFocusManagement() {
  /**
   * 获取所有可聚焦元素
   */
  const getFocusableElements = (container: HTMLElement = document.body): HTMLElement[] => {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(container.querySelectorAll<HTMLElement>(selector));
  };

  /**
   * 焦点陷阱（用于模态框）
   */
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 自动聚焦第一个元素
    firstElement?.focus();

    // 返回清理函数
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  /**
   * 焦点到下一个元素
   */
  const focusNext = (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    
    if (currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1]?.focus();
    } else {
      focusableElements[0]?.focus();
    }
  };

  /**
   * 焦点到上一个元素
   */
  const focusPrevious = (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1]?.focus();
    } else {
      focusableElements[focusableElements.length - 1]?.focus();
    }
  };

  return {
    getFocusableElements,
    trapFocus,
    focusNext,
    focusPrevious,
  };
}

/**
 * 跳过导航链接 Hook
 */
export function useSkipNav() {
  /**
   * 跳转到主内容
   */
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    skipToMain,
  };
}
