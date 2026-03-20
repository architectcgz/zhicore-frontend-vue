/**
 * useDebounce Composable 单元测试
 * Unit tests for useDebounce composable
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ref, nextTick } from 'vue';
import { debounce, useDebounce, useDebounceFn } from '@/composables/useDebounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该延迟执行函数', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该在多次调用时只执行最后一次', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('应该在延迟时间内重置计时器', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    vi.advanceTimersByTime(200);
    
    debouncedFn();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该使用自定义延迟时间', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 500);

    debouncedFn();
    vi.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该传递正确的参数', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('arg1', 'arg2', 'arg3');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });
});

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该返回防抖后的响应式值', async () => {
    const value = ref('initial');
    const debouncedValue = useDebounce(value, 300);

    expect(debouncedValue.value).toBe('initial');

    value.value = 'updated';
    await nextTick();
    expect(debouncedValue.value).toBe('initial');

    vi.advanceTimersByTime(300);
    await nextTick();
    expect(debouncedValue.value).toBe('updated');
  });

  it('应该在多次更新时只应用最后一次', async () => {
    const value = ref(0);
    const debouncedValue = useDebounce(value, 300);

    value.value = 1;
    await nextTick();
    value.value = 2;
    await nextTick();
    value.value = 3;
    await nextTick();

    expect(debouncedValue.value).toBe(0);

    vi.advanceTimersByTime(300);
    await nextTick();
    expect(debouncedValue.value).toBe(3);
  });

  it('应该使用自定义延迟时间', async () => {
    const value = ref('initial');
    const debouncedValue = useDebounce(value, 500);

    value.value = 'updated';
    await nextTick();

    vi.advanceTimersByTime(400);
    await nextTick();
    expect(debouncedValue.value).toBe('initial');

    vi.advanceTimersByTime(100);
    await nextTick();
    expect(debouncedValue.value).toBe('updated');
  });

  it('应该处理不同类型的值', async () => {
    const numberValue = ref(0);
    const debouncedNumber = useDebounce(numberValue, 300);

    numberValue.value = 42;
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(debouncedNumber.value).toBe(42);

    const objectValue = ref({ name: 'test' });
    const debouncedObject = useDebounce(objectValue, 300);

    objectValue.value = { name: 'updated' };
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(debouncedObject.value).toEqual({ name: 'updated' });
  });
});

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该返回防抖函数和取消函数', () => {
    const fn = vi.fn();
    const { debouncedFn, cancel } = useDebounceFn(fn, 300);

    expect(typeof debouncedFn).toBe('function');
    expect(typeof cancel).toBe('function');
  });

  it('应该延迟执行函数', () => {
    const fn = vi.fn();
    const { debouncedFn } = useDebounceFn(fn, 300);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该能够取消防抖', () => {
    const fn = vi.fn();
    const { debouncedFn, cancel } = useDebounceFn(fn, 300);

    debouncedFn();
    vi.advanceTimersByTime(200);
    cancel();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it('应该在取消后能够重新调用', () => {
    const fn = vi.fn();
    const { debouncedFn, cancel } = useDebounceFn(fn, 300);

    debouncedFn();
    cancel();
    debouncedFn();
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该传递正确的参数', () => {
    const fn = vi.fn();
    const { debouncedFn } = useDebounceFn(fn, 300);

    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('应该使用自定义延迟时间', () => {
    const fn = vi.fn();
    const { debouncedFn } = useDebounceFn(fn, 500);

    debouncedFn();
    vi.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
