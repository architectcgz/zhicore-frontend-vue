/**
 * 焦点指示器指令
 * 为元素添加清晰的焦点样式
 */
import type { Directive } from 'vue';

export const vFocusIndicator: Directive = {
  mounted(el: HTMLElement) {
    // 添加焦点样式类
    el.classList.add('focus-indicator');
    
    // 确保元素可以接收焦点
    if (!el.hasAttribute('tabindex') && !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
      el.setAttribute('tabindex', '0');
    }
  },
};

/**
 * 可见焦点指示器指令（仅键盘导航时显示）
 */
export const vFocusVisible: Directive = {
  mounted(el: HTMLElement) {
    let isKeyboardNav = false;

    // 监听鼠标事件
    const handleMouseDown = () => {
      isKeyboardNav = false;
      el.classList.remove('focus-visible');
    };

    // 监听键盘事件
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isKeyboardNav = true;
      }
    };

    // 监听焦点事件
    const handleFocus = () => {
      if (isKeyboardNav) {
        el.classList.add('focus-visible');
      }
    };

    const handleBlur = () => {
      el.classList.remove('focus-visible');
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('keydown', handleKeyDown);
    el.addEventListener('focus', handleFocus);
    el.addEventListener('blur', handleBlur);

    // 存储清理函数
    (el as any)._focusVisibleCleanup = () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('keydown', handleKeyDown);
      el.removeEventListener('focus', handleFocus);
      el.removeEventListener('blur', handleBlur);
    };
  },

  unmounted(el: HTMLElement) {
    if ((el as any)._focusVisibleCleanup) {
      (el as any)._focusVisibleCleanup();
      delete (el as any)._focusVisibleCleanup;
    }
  },
};
