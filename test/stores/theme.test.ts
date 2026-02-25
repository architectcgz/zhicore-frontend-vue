/**
 * 主题 Store 单元测试
 * 测试主题切换、持久化和系统主题检测功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useThemeStore } from '@/stores/theme';

describe('Theme Store', () => {
  beforeEach(() => {
    // 为每个测试创建新的 Pinia 实例
    setActivePinia(createPinia());
    
    // 清除 localStorage
    localStorage.clear();
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });
  
  it('应该初始化为 auto 主题', () => {
    const store = useThemeStore();
    expect(store.theme).toBe('auto');
  });
  
  it('应该能够设置主题', () => {
    const store = useThemeStore();
    
    store.setTheme('dark');
    expect(store.theme).toBe('dark');
    
    store.setTheme('light');
    expect(store.theme).toBe('light');
  });
  
  it('应该能够切换主题', () => {
    const store = useThemeStore();
    
    store.setTheme('light');
    store.toggleTheme();
    expect(store.theme).toBe('dark');
    
    store.toggleTheme();
    expect(store.theme).toBe('light');
  });
  
  it('应该能够循环切换主题', () => {
    const store = useThemeStore();
    
    store.setTheme('light');
    store.cycleTheme();
    expect(store.theme).toBe('dark');
    
    store.cycleTheme();
    expect(store.theme).toBe('auto');
    
    store.cycleTheme();
    expect(store.theme).toBe('light');
  });
  
  it('应该将主题保存到 localStorage', () => {
    const store = useThemeStore();
    
    store.setTheme('dark');
    expect(localStorage.getItem('zhicore-theme-preference')).toBe('dark');
    
    store.setTheme('light');
    expect(localStorage.getItem('zhicore-theme-preference')).toBe('light');
  });
  
  it('应该从 localStorage 加载主题', () => {
    localStorage.setItem('zhicore-theme-preference', 'dark');
    
    const store = useThemeStore();
    store.initTheme();
    
    expect(store.theme).toBe('dark');
  });
  
  it('应该正确计算 appliedTheme', () => {
    const store = useThemeStore();
    
    store.setTheme('light');
    expect(store.appliedTheme).toBe('light');
    
    store.setTheme('dark');
    expect(store.appliedTheme).toBe('dark');
    
    // auto 模式应该使用系统主题
    store.setTheme('auto');
    expect(['light', 'dark']).toContain(store.appliedTheme);
  });
  
  it('应该正确计算 isDark 和 isLight', () => {
    const store = useThemeStore();
    
    store.setTheme('light');
    expect(store.isLight).toBe(true);
    expect(store.isDark).toBe(false);
    
    store.setTheme('dark');
    expect(store.isLight).toBe(false);
    expect(store.isDark).toBe(true);
  });
  
  it('应该正确计算 isAuto', () => {
    const store = useThemeStore();
    
    store.setTheme('auto');
    expect(store.isAuto).toBe(true);
    
    store.setTheme('light');
    expect(store.isAuto).toBe(false);
  });
  
  it('应该能够重置主题', () => {
    const store = useThemeStore();
    
    store.setTheme('dark');
    store.resetTheme();
    
    expect(store.theme).toBe('auto');
  });
});
