/**
 * useAutoSave 组合式函数测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoSave } from '@/composables/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('应该正确初始化状态', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const autoSave = useAutoSave(saveFn);

    expect(autoSave.isSaving.value).toBe(false);
    expect(autoSave.lastSaveTime.value).toBeNull();
    expect(autoSave.saveError.value).toBeNull();
  });

  it('应该能够手动触发保存', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const autoSave = useAutoSave(saveFn);

    await autoSave.save();

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(autoSave.lastSaveTime.value).toBeInstanceOf(Date);
  });

  it('应该在保存过程中设置 isSaving 状态', async () => {
    let resolveSave: () => void;
    const savePromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    const saveFn = vi.fn().mockReturnValue(savePromise);
    const autoSave = useAutoSave(saveFn);

    const savePromiseResult = autoSave.save();
    
    // 保存开始时应该设置为 true
    expect(autoSave.isSaving.value).toBe(true);

    // 完成保存
    resolveSave!();
    await savePromiseResult;

    // 保存完成后应该设置为 false
    expect(autoSave.isSaving.value).toBe(false);
  });

  it('应该在保存失败时设置错误状态', async () => {
    const error = new Error('保存失败');
    const saveFn = vi.fn().mockRejectedValue(error);
    const autoSave = useAutoSave(saveFn, {
      showErrorMessage: false, // 禁用错误提示以避免测试中的 ElMessage
    });

    await expect(autoSave.save()).rejects.toThrow('保存失败');
    expect(autoSave.saveError.value).toBe(error);
    expect(autoSave.isSaving.value).toBe(false);
  });

  it('应该在正在保存时跳过新的保存请求', async () => {
    let resolveSave: () => void;
    const savePromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    const saveFn = vi.fn().mockReturnValue(savePromise);
    const autoSave = useAutoSave(saveFn);

    // 开始第一次保存
    const firstSave = autoSave.save();
    
    // 尝试第二次保存（应该被跳过）
    await autoSave.save();

    // 只应该调用一次
    expect(saveFn).toHaveBeenCalledTimes(1);

    // 完成第一次保存
    resolveSave!();
    await firstSave;
  });

  it('应该按照指定间隔自动保存', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const interval = 30000; // 30秒
    const autoSave = useAutoSave(saveFn, { interval });

    autoSave.startAutoSave();

    // 初始不应该调用
    expect(saveFn).not.toHaveBeenCalled();

    // 前进 30 秒
    await vi.advanceTimersByTimeAsync(interval);
    expect(saveFn).toHaveBeenCalledTimes(1);

    // 再前进 30 秒
    await vi.advanceTimersByTimeAsync(interval);
    expect(saveFn).toHaveBeenCalledTimes(2);

    autoSave.stopAutoSave();
  });

  it('应该在启动时立即保存（如果配置了 saveOnStart）', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const autoSave = useAutoSave(saveFn, {
      saveOnStart: true,
      interval: 30000,
    });

    autoSave.startAutoSave();

    // 等待初始保存完成
    await vi.waitFor(() => {
      expect(saveFn).toHaveBeenCalledTimes(1);
    });

    autoSave.stopAutoSave();
  });

  it('应该能够停止自动保存', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const interval = 30000;
    const autoSave = useAutoSave(saveFn, { interval });

    autoSave.startAutoSave();
    
    // 前进 30 秒
    await vi.advanceTimersByTimeAsync(interval);
    expect(saveFn).toHaveBeenCalledTimes(1);

    // 停止自动保存
    autoSave.stopAutoSave();

    // 再前进 30 秒，不应该再调用
    await vi.advanceTimersByTimeAsync(interval);
    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  it('应该支持防抖保存', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const debounceDelay = 2000;
    const autoSave = useAutoSave(saveFn, { debounceDelay });

    // 触发多次防抖保存
    autoSave.triggerDebouncedSave();
    autoSave.triggerDebouncedSave();
    autoSave.triggerDebouncedSave();

    // 在防抖延迟之前不应该调用
    expect(saveFn).not.toHaveBeenCalled();

    // 前进到防抖延迟
    await vi.advanceTimersByTimeAsync(debounceDelay);

    // 应该只调用一次
    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  it('应该在防抖期间重置定时器', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const debounceDelay = 2000;
    const autoSave = useAutoSave(saveFn, { debounceDelay });

    // 第一次触发
    autoSave.triggerDebouncedSave();
    
    // 前进 1 秒
    await vi.advanceTimersByTimeAsync(1000);
    
    // 第二次触发（重置定时器）
    autoSave.triggerDebouncedSave();
    
    // 再前进 1 秒（总共 2 秒，但从第二次触发算起只有 1 秒）
    await vi.advanceTimersByTimeAsync(1000);
    
    // 不应该调用
    expect(saveFn).not.toHaveBeenCalled();
    
    // 再前进 1 秒（从第二次触发算起 2 秒）
    await vi.advanceTimersByTimeAsync(1000);
    
    // 现在应该调用
    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  it('应该能够重置状态', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const autoSave = useAutoSave(saveFn);

    // 执行保存
    await autoSave.save();
    expect(autoSave.lastSaveTime.value).not.toBeNull();

    // 启动自动保存
    autoSave.startAutoSave();

    // 重置状态
    autoSave.reset();

    expect(autoSave.isSaving.value).toBe(false);
    expect(autoSave.lastSaveTime.value).toBeNull();
    expect(autoSave.saveError.value).toBeNull();

    // 自动保存应该已停止
    await vi.advanceTimersByTimeAsync(30000);
    expect(saveFn).toHaveBeenCalledTimes(1); // 只有之前的手动保存
  });

  it('应该在重新启动时清除之前的定时器', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const interval = 30000;
    const autoSave = useAutoSave(saveFn, { interval });

    // 第一次启动
    autoSave.startAutoSave();
    
    // 前进 15 秒
    await vi.advanceTimersByTimeAsync(15000);
    
    // 重新启动（应该清除之前的定时器）
    autoSave.startAutoSave();
    
    // 前进 15 秒（总共 30 秒，但从重新启动算起只有 15 秒）
    await vi.advanceTimersByTimeAsync(15000);
    
    // 不应该调用
    expect(saveFn).not.toHaveBeenCalled();
    
    // 再前进 15 秒（从重新启动算起 30 秒）
    await vi.advanceTimersByTimeAsync(15000);
    
    // 现在应该调用
    expect(saveFn).toHaveBeenCalledTimes(1);

    autoSave.stopAutoSave();
  });
});
