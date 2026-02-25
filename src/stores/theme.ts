/**
 * 主题状态管理 Store
 * 管理应用的主题状态（亮色/暗色/自动）
 * 实现主题切换和持久化功能
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { tabSyncManager } from '@/utils/tabSync';

// 主题类型定义
export type Theme = 'light' | 'dark' | 'auto';

// 本地存储键名
const THEME_STORAGE_KEY = 'zhicore-theme-preference';

/**
 * 获取系统主题偏好
 * @returns 'light' | 'dark'
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 从本地存储加载主题偏好
 * @returns Theme
 */
function loadThemeFromStorage(): Theme {
  if (typeof window === 'undefined') return 'auto';
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored as Theme;
    }
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error);
  }
  
  return 'auto';
}

/**
 * 保存主题偏好到本地存储
 * @param theme - 主题类型
 */
function saveThemeToStorage(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

/**
 * 应用主题到 DOM
 * @param theme - 实际应用的主题（light 或 dark）
 */
function applyThemeToDOM(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
  } else {
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
  }
}

export const useThemeStore = defineStore('theme', () => {
  // ========== 状态 ==========
  
  // 用户选择的主题（light/dark/auto）
  const theme = ref<Theme>('auto');
  
  // 系统主题（light/dark）
  const systemTheme = ref<'light' | 'dark'>(getSystemTheme());
  
  // ========== 计算属性 ==========
  
  /**
   * 实际应用的主题
   * 如果用户选择 auto，则使用系统主题
   */
  const appliedTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'auto') {
      return systemTheme.value;
    }
    return theme.value;
  });
  
  /**
   * 是否为暗色主题
   */
  const isDark = computed(() => appliedTheme.value === 'dark');
  
  /**
   * 是否为亮色主题
   */
  const isLight = computed(() => appliedTheme.value === 'light');
  
  /**
   * 是否为自动模式
   */
  const isAuto = computed(() => theme.value === 'auto');
  
  // ========== 方法 ==========
  
  /**
   * 设置主题
   * @param newTheme - 新主题
   */
  function setTheme(newTheme: Theme): void {
    theme.value = newTheme;
    saveThemeToStorage(newTheme);
    applyThemeToDOM(appliedTheme.value);
    
    // 广播主题变化到其他标签页
    tabSyncManager.broadcast('theme_change', { theme: newTheme });
  }
  
  /**
   * 切换主题（在 light 和 dark 之间切换）
   * 如果当前是 auto，则切换到相反的系统主题
   */
  function toggleTheme(): void {
    if (theme.value === 'auto') {
      // 从 auto 切换到相反的系统主题
      setTheme(systemTheme.value === 'dark' ? 'light' : 'dark');
    } else if (theme.value === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }
  
  /**
   * 切换到下一个主题（light -> dark -> auto -> light）
   */
  function cycleTheme(): void {
    const themeOrder: Theme[] = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(theme.value);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  }
  
  /**
   * 初始化主题
   * 从本地存储加载主题偏好，并监听系统主题变化
   */
  function initTheme(): void {
    // 从本地存储加载主题
    const savedTheme = loadThemeFromStorage();
    theme.value = savedTheme;
    
    // 应用主题到 DOM
    applyThemeToDOM(appliedTheme.value);
    
    // 监听系统主题变化
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        systemTheme.value = e.matches ? 'dark' : 'light';
        
        // 如果用户选择了 auto，则应用新的系统主题
        if (theme.value === 'auto') {
          applyThemeToDOM(systemTheme.value);
        }
      };
      
      // 初始化系统主题
      handleSystemThemeChange(mediaQuery);
      
      // 监听系统主题变化
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        // 兼容旧版浏览器
        mediaQuery.addListener(handleSystemThemeChange);
      }
    }
    
    // 设置标签页同步监听器
    setupTabSyncListeners();
  }
  
  /**
   * 设置标签页同步监听器
   */
  function setupTabSyncListeners(): void {
    // 监听其他标签页的主题变化
    tabSyncManager.on('theme_change', (data) => {
      const newTheme = data.theme as Theme;
      console.log('Received theme change from another tab:', newTheme);
      
      // 验证主题值
      if (!['light', 'dark', 'auto'].includes(newTheme)) {
        console.warn('Invalid theme received:', newTheme);
        return;
      }
      
      // 更新本地主题（不再广播，避免循环）
      theme.value = newTheme;
      saveThemeToStorage(newTheme);
      applyThemeToDOM(appliedTheme.value);
    });
  }
  
  /**
   * 重置主题为默认值（auto）
   */
  function resetTheme(): void {
    setTheme('auto');
  }
  
  // ========== 监听主题变化 ==========
  
  // 监听 appliedTheme 变化，应用到 DOM
  watch(appliedTheme, (newTheme) => {
    applyThemeToDOM(newTheme);
  });
  
  // ========== 返回 ==========
  
  return {
    // 状态
    theme,
    systemTheme,
    
    // 计算属性
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
  };
});
