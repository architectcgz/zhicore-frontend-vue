/**
 * 自动保存 Composable
 * 提供定时自动保存和内容变化时保存的功能
 * 
 * 功能特性：
 * - 定时自动保存（默认30秒）
 * - 内容变化时防抖保存
 * - 保存状态跟踪
 * - 手动触发保存
 * - 自动启动/停止
 */

import { ref, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

/**
 * 自动保存配置接口
 */
export interface AutoSaveConfig {
  /**
   * 自动保存间隔（毫秒）
   * @default 30000 (30秒)
   */
  interval?: number;
  
  /**
   * 防抖延迟（毫秒）
   * @default 2000 (2秒)
   */
  debounceDelay?: number;
  
  /**
   * 是否在启动时立即保存
   * @default false
   */
  saveOnStart?: boolean;
  
  /**
   * 是否显示保存成功提示
   * @default false
   */
  showSuccessMessage?: boolean;
  
  /**
   * 是否显示保存失败提示
   * @default true
   */
  showErrorMessage?: boolean;
}

/**
 * 自动保存返回值接口
 */
export interface AutoSaveReturn {
  /**
   * 是否正在保存
   */
  isSaving: Readonly<typeof ref<boolean>>;
  
  /**
   * 上次保存时间
   */
  lastSaveTime: Readonly<typeof ref<Date | null>>;
  
  /**
   * 保存错误信息
   */
  saveError: Readonly<typeof ref<Error | null>>;
  
  /**
   * 手动触发保存
   */
  save: () => Promise<void>;
  
  /**
   * 启动自动保存
   */
  startAutoSave: () => void;
  
  /**
   * 停止自动保存
   */
  stopAutoSave: () => void;
  
  /**
   * 触发防抖保存（内容变化时调用）
   */
  triggerDebouncedSave: () => void;
  
  /**
   * 重置状态
   */
  reset: () => void;
}

/**
 * 自动保存 Composable
 * 
 * @param saveFunction 保存函数，返回 Promise
 * @param config 配置选项
 * @returns 自动保存控制对象
 * 
 * @example
 * ```typescript
 * const autoSave = useAutoSave(async () => {
 *   await saveDraft({
 *     title: editorState.title,
 *     content: editorState.content,
 *   });
 * }, {
 *   interval: 30000, // 30秒自动保存
 *   debounceDelay: 2000, // 2秒防抖
 * });
 * 
 * // 启动自动保存
 * autoSave.startAutoSave();
 * 
 * // 内容变化时触发防抖保存
 * const handleContentChange = () => {
 *   autoSave.triggerDebouncedSave();
 * };
 * 
 * // 手动保存
 * await autoSave.save();
 * 
 * // 停止自动保存
 * autoSave.stopAutoSave();
 * ```
 */
export function useAutoSave(
  saveFunction: () => Promise<void>,
  config: AutoSaveConfig = {}
): AutoSaveReturn {
  // 配置默认值
  const {
    interval = 30000, // 30秒
    debounceDelay = 2000, // 2秒
    saveOnStart = false,
    showSuccessMessage = false,
    showErrorMessage = true,
  } = config;

  // 响应式状态
  const isSaving = ref(false);
  const lastSaveTime = ref<Date | null>(null);
  const saveError = ref<Error | null>(null);

  // 定时器引用
  let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 执行保存操作
   */
  const save = async (): Promise<void> => {
    // 如果正在保存，跳过
    if (isSaving.value) {
      return;
    }

    isSaving.value = true;
    saveError.value = null;

    try {
      await saveFunction();
      lastSaveTime.value = new Date();
      
      if (showSuccessMessage) {
        ElMessage.success('保存成功');
      }
    } catch (error) {
      saveError.value = error instanceof Error ? error : new Error('保存失败');
      
      if (showErrorMessage) {
        ElMessage.error(saveError.value.message || '保存失败');
      }
      
      console.error('自动保存失败:', error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * 启动自动保存
   */
  const startAutoSave = (): void => {
    // 如果已经启动，先停止
    if (autoSaveTimer) {
      stopAutoSave();
    }

    // 如果配置了启动时立即保存
    if (saveOnStart) {
      save().catch(() => {
        // 错误已在 save 函数中处理
      });
    }

    // 启动定时器
    autoSaveTimer = setInterval(() => {
      save().catch(() => {
        // 错误已在 save 函数中处理
      });
    }, interval);
  };

  /**
   * 停止自动保存
   */
  const stopAutoSave = (): void => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }

    // 清除防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };

  /**
   * 触发防抖保存
   * 内容变化时调用，会在指定延迟后执行保存
   */
  const triggerDebouncedSave = (): void => {
    // 清除之前的防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 设置新的防抖定时器
    debounceTimer = setTimeout(() => {
      save().catch(() => {
        // 错误已在 save 函数中处理
      });
    }, debounceDelay);
  };

  /**
   * 重置状态
   */
  const reset = (): void => {
    stopAutoSave();
    isSaving.value = false;
    lastSaveTime.value = null;
    saveError.value = null;
  };

  // 组件卸载时自动停止
  onUnmounted(() => {
    stopAutoSave();
  });

  return {
    isSaving: isSaving as Readonly<typeof isSaving>,
    lastSaveTime: lastSaveTime as Readonly<typeof lastSaveTime>,
    saveError: saveError as Readonly<typeof saveError>,
    save,
    startAutoSave,
    stopAutoSave,
    triggerDebouncedSave,
    reset,
  };
}
