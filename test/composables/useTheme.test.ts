/**
 * useTheme Composable 单元测试
 * Unit tests for useTheme composable
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTheme } from '@/composables/useTheme';
import { createTestPinia } from '@/test/utils';
import { useThemeStore } from '@/stores/theme';

describe('useTheme', () => {
  beforeEach(() => {
    // 创建测试用的 Pinia 实例
    createTestPinia();
    
    // 清除 localStorage
    localStorage.clear();
  });

  describe('响应式状态', () => {
    it('应该正确暴露主题状态', () => {
      const themeStore = useThemeStore();
      themeStore.theme = 'dark';
      themeStore.systemTheme = 'light';

      const { theme, systemTheme, isDark, isLight } = useTheme();

      expect(theme.value).toBe('dark');
      expect(systemTheme.value).toBe('light');
      expect(isDark.value).toBe(true);
      expect(isLight.value).toBe(false);
    });

    it('应该正确识别自动模式', () => {
      const themeStore = useThemeStore();
      themeStore.theme = 'auto';

      const { isAuto } = useTheme();

      expect(isAuto.value).toBe(true);
    });

    it('应该正确计算应用的主题', () => {
      const themeStore = useThemeStore();
      themeStore.theme = 'auto';
      themeStore.systemTheme = 'dark';

      const { appliedTheme } = useTheme();

      expect(appliedTheme.value).toBe('dark');
    });
  });

  describe('设置主题', () => {
    it('应该能够设置亮色主题', () => {
      const themeStore = useThemeStore();
      themeStore.setTheme = vi.fn();

      const { setTheme } = useTheme();
      setTheme('light');

      expect(themeStore.setTheme).toHaveBeenCalledWith('light');
    });

    it('应该能够设置暗色主题', () => {
      const themeStore = useThemeStore();
      themeStore.setTheme = vi.fn();

      const { setTheme } = useTheme();
      setTheme('dark');

      expect(themeStore.setTheme).toHaveBeenCalledWith('dark');
    });

    it('应该能够设置自动模式', () => {
      const themeStore = useThemeStore();
      themeStore.setTheme = vi.fn();

      const { setTheme } = useTheme();
      setTheme('auto');

      expect(themeStore.setTheme).toHaveBeenCalledWith('auto');
    });
  });

  describe('切换主题', () => {
    it('应该能够在亮色和暗色之间切换', () => {
      const themeStore = useThemeStore();
      themeStore.toggleTheme = vi.fn();

      const { toggleTheme } = useTheme();
      toggleTheme();

      expect(themeStore.toggleTheme).toHaveBeenCalled();
    });

    it('应该能够循环切换主题', () => {
      const themeStore = useThemeStore();
      themeStore.cycleTheme = vi.fn();

      const { cycleTheme } = useTheme();
      cycleTheme();

      expect(themeStore.cycleTheme).toHaveBeenCalled();
    });
  });

  describe('初始化主题', () => {
    it('应该能够初始化主题', () => {
      const themeStore = useThemeStore();
      themeStore.initTheme = vi.fn();

      const { initTheme } = useTheme();
      initTheme();

      expect(themeStore.initTheme).toHaveBeenCalled();
    });

    it('应该能够重置主题', () => {
      const themeStore = useThemeStore();
      themeStore.resetTheme = vi.fn();

      const { resetTheme } = useTheme();
      resetTheme();

      expect(themeStore.resetTheme).toHaveBeenCalled();
    });
  });

  describe('辅助方法', () => {
    it('应该返回正确的主题图标', () => {
      const themeStore = useThemeStore();
      
      // 测试亮色主题
      themeStore.theme = 'light';
      const { getThemeIcon: lightIcon } = useTheme();
      expect(lightIcon.value).toBe('sun');

      // 测试暗色主题
      themeStore.theme = 'dark';
      const { getThemeIcon: darkIcon } = useTheme();
      expect(darkIcon.value).toBe('moon');

      // 测试自动模式
      themeStore.theme = 'auto';
      const { getThemeIcon: autoIcon } = useTheme();
      expect(autoIcon.value).toBe('auto-mode');
    });

    it('应该返回正确的主题标签', () => {
      const themeStore = useThemeStore();
      
      // 测试亮色主题
      themeStore.theme = 'light';
      const { getThemeLabel: lightLabel } = useTheme();
      expect(lightLabel.value).toBe('亮色');

      // 测试暗色主题
      themeStore.theme = 'dark';
      const { getThemeLabel: darkLabel } = useTheme();
      expect(darkLabel.value).toBe('暗色');

      // 测试自动模式
      themeStore.theme = 'auto';
      const { getThemeLabel: autoLabel } = useTheme();
      expect(autoLabel.value).toBe('自动');
    });
  });

  describe('主题持久化', () => {
    it('应该从 localStorage 加载主题', () => {
      // Set theme in localStorage before creating store
      localStorage.setItem('zhicore-theme-preference', 'dark');
      
      // Create a fresh store instance
      const themeStore = useThemeStore();
      themeStore.initTheme();

      expect(themeStore.theme).toBe('dark');
    });

    it('应该将主题保存到 localStorage', () => {
      const themeStore = useThemeStore();
      themeStore.setTheme('dark');

      expect(localStorage.getItem('zhicore-theme-preference')).toBe('dark');
    });
  });
});
