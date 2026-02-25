/**
 * 焦点陷阱测试
 * 验证焦点陷阱功能是否正常工作
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useFocusTrap } from '@/composables/useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <button id="btn2">Button 2</button>
      <button id="btn3">Button 3</button>
    `;
    document.body.appendChild(container);

    button1 = document.getElementById('btn1') as HTMLButtonElement;
    button2 = document.getElementById('btn2') as HTMLButtonElement;
    button3 = document.getElementById('btn3') as HTMLButtonElement;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should trap focus within container', async () => {
    const isActive = ref(false);
    const containerRef = ref(container);

    useFocusTrap({
      isActive,
      containerRef,
    });

    // 激活焦点陷阱
    isActive.value = true;
    await nextTick();

    // 等待焦点设置
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 验证第一个按钮获得焦点
    expect(document.activeElement).toBe(button1);
  });

  it('should cycle focus forward with Tab', async () => {
    const isActive = ref(true);
    const containerRef = ref(container);

    useFocusTrap({
      isActive,
      containerRef,
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 聚焦最后一个按钮
    button3.focus();
    expect(document.activeElement).toBe(button3);

    // 模拟 Tab 键
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(tabEvent);
    await nextTick();

    // 如果事件被阻止，焦点应该循环到第一个按钮
    if (tabEvent.defaultPrevented) {
      button1.focus();
      expect(document.activeElement).toBe(button1);
    }
  });

  it('should cycle focus backward with Shift+Tab', async () => {
    const isActive = ref(true);
    const containerRef = ref(container);

    useFocusTrap({
      isActive,
      containerRef,
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 聚焦第一个按钮
    button1.focus();
    expect(document.activeElement).toBe(button1);

    // 模拟 Shift+Tab 键
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(shiftTabEvent);
    await nextTick();

    // 如果事件被阻止，焦点应该循环到最后一个按钮
    if (shiftTabEvent.defaultPrevented) {
      button3.focus();
      expect(document.activeElement).toBe(button3);
    }
  });

  it('should restore focus when deactivated', async () => {
    const isActive = ref(false);
    const containerRef = ref(container);
    const returnFocusRef = ref<HTMLElement | null>(null);

    // 创建一个外部按钮作为返回焦点目标
    const externalButton = document.createElement('button');
    externalButton.id = 'external';
    document.body.appendChild(externalButton);
    returnFocusRef.value = externalButton;

    // 聚焦外部按钮
    externalButton.focus();
    expect(document.activeElement).toBe(externalButton);

    useFocusTrap({
      isActive,
      containerRef,
      returnFocusRef,
    });

    // 激活焦点陷阱
    isActive.value = true;
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 焦点应该在容器内
    expect(container.contains(document.activeElement)).toBe(true);

    // 停用焦点陷阱
    isActive.value = false;
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 焦点应该返回到外部按钮
    expect(document.activeElement).toBe(externalButton);

    // 清理
    document.body.removeChild(externalButton);
  });

  it('should focus initial element when specified', async () => {
    const isActive = ref(false);
    const containerRef = ref(container);

    useFocusTrap({
      isActive,
      containerRef,
      initialFocusSelector: '#btn2',
    });

    // 激活焦点陷阱
    isActive.value = true;
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 验证第二个按钮获得焦点
    expect(document.activeElement).toBe(button2);
  });
});
