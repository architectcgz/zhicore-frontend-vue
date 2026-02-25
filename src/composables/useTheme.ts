/**
 * 主题 Composable
 * 提供主题相关的响应式状态和方法
 * 封装 Theme Store 的使用
 */

import { computed } from 'vue';
import { useThemeStore, type Theme } from '@/stores/theme';

/**
 * 使用主题功能
 * @returns 主题相关的状态和方法
 */
export function useTheme() {
  const themeStore = useThemeStore();
  
  // ========== 响应式状态 ==========
  
  /**
   * 当前用户选择的主题（light/dark/auto）
   */
  const theme = computed(() => themeStore.theme);
  
  /**
   * 系统主题（light/dark）
   */
  const systemTheme = computed(() => themeStore.systemTheme);
  
  /**
   * 实际应用的主题（light/dark）
   */
  const appliedTheme = computed(() => themeStore.appliedTheme);
  
  /**
   * 是否为暗色主题
   */
  const isDark = computed(() => themeStore.isDark);
  
  /**
   * 是否为亮色主题
   */
  const isLight = computed(() => themeStore.isLight);
  
  /**
   * 是否为自动模式
   */
  const isAuto = computed(() => themeStore.isAuto);
  
  // ========== 方法 ==========
  
  /**
   * 设置主题
   * @param newTheme - 新主题（light/dark/auto）
   */
  const setTheme = (newTheme: Theme): void => {
    themeStore.setTheme(newTheme);
  };
  
  /**
   * 切换主题（在 light 和 dark 之间切换）
   */
  const toggleTheme = (): void => {
    themeStore.toggleTheme();
  };
  
  /**
   * 循环切换主题（light -> dark -> auto -> light）
   */
  const cycleTheme = (): void => {
    themeStore.cycleTheme();
  };
  
  /**
   * 初始化主题
   * 从本地存储加载主题偏好，并监听系统主题变化
   */
  const initTheme = (): void => {
    themeStore.initTheme();
  };
  
  /**
   * 重置主题为默认值（auto）
   */
  const resetTheme = (): void => {
    themeStore.resetTheme();
  };
  
  /**
   * 获取主题图标名称（用于 UI 显示）
   */
  const getThemeIcon = computed(() => {
    if (theme.value === 'auto') {
      return 'auto-mode';
    }
    return isDark.value ? 'moon' : 'sun';
  });
  
  /**
   * 获取主题显示名称（用于 UI 显示）
   */
  const getThemeLabel = computed(() => {
    switch (theme.value) {
      case 'light':
        return '亮色';
      case 'dark':
        return '暗色';
      case 'auto':
        return '自动';
      default:
        return '未知';
    }
  });
  
  // ========== 返回 ==========
  
  return {
    // 状态
    theme,
    systemTheme,
    appliedTheme,
    isDark,
    isLight,
    isAuto,
    
    // 方法
    setTheme,
    toggleTheme,
    cycleTheme,
    initTheme,
    resetTheme,
    
    // 辅助方法
    getThemeIcon,
    getThemeLabel,
  };
}
