/**
 * 全局错误处理工具
 * 提供统一的错误处理、日志记录和错误上报功能
 */

import { ElMessage } from 'element-plus';
import type { App } from 'vue';
import {
  isApiError,
  isNetworkError,
  isValidationError,
  getErrorMessage as getErrorMessageFromTypes,
} from '@/types/errors';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VUE_ERROR = 'VUE_ERROR',
  PROMISE_REJECTION = 'PROMISE_REJECTION',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 错误信息接口
 * 
 * 注意：此接口保留用于向后兼容，但 propsData 已更新为强类型
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  stack?: string;
  componentName?: string;
  propsData?: Record<string, unknown>;
  url?: string;
  timestamp: number;
  userAgent: string;
}

/**
 * 错误处理配置
 */
export interface ErrorHandlerConfig {
  // 是否启用错误上报
  enableReporting?: boolean;
  // 错误上报 URL（例如 Sentry DSN）
  reportUrl?: string;
  // 是否在控制台显示错误
  showInConsole?: boolean;
  // 是否显示用户友好的错误提示
  showUserMessage?: boolean;
  // 自定义错误处理函数
  onError?: (errorInfo: ErrorInfo) => void;
}

class ErrorHandler {
  private config: ErrorHandlerConfig = {
    enableReporting: false,
    showInConsole: true,
    showUserMessage: true,
  };

  /**
   * 初始化错误处理器
   */
  init(config?: ErrorHandlerConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 处理错误
   * 
   * @param error - 未知类型的错误对象，将被类型收窄
   * @param errorType - 错误类型分类
   * @param additionalInfo - 附加错误信息（强类型）
   */
  handleError(error: unknown, errorType: ErrorType, additionalInfo?: Record<string, unknown>) {
    // 使用类型守卫收窄错误类型
    let message: string;
    let stack: string | undefined;

    if (error instanceof Error) {
      // 标准 Error 实例
      message = error.message;
      stack = error.stack;
    } else if (isApiError(error)) {
      // API 错误
      message = error.details || error.message;
      stack = error.stack;
    } else if (isNetworkError(error)) {
      // 网络错误
      message = error.message;
      stack = error.stack;
    } else if (isValidationError(error)) {
      // 验证错误
      message = `${error.field}: ${error.constraint}`;
      stack = error.stack;
    } else {
      // 未知错误类型，使用辅助函数安全提取消息
      message = getErrorMessageFromTypes(error);
      stack = undefined;
    }

    const errorInfo: ErrorInfo = {
      type: errorType,
      message,
      stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...additionalInfo,
    };

    // 在控制台显示错误
    if (this.config.showInConsole) {
      console.error(`[${errorType}]`, error, additionalInfo);
    }

    // 显示用户友好的错误提示
    if (this.config.showUserMessage) {
      this.showUserMessage(errorInfo);
    }

    // 调用自定义错误处理函数
    if (this.config.onError) {
      this.config.onError(errorInfo);
    }

    // 上报错误
    if (this.config.enableReporting) {
      this.reportError(errorInfo);
    }
  }

  /**
   * 显示用户友好的错误提示
   */
  private showUserMessage(errorInfo: ErrorInfo) {
    let message = '操作失败，请稍后重试';

    // 根据错误类型显示不同的提示
    switch (errorInfo.type) {
      case ErrorType.NETWORK_ERROR:
        message = '网络连接失败，请检查网络设置';
        break;
      case ErrorType.RESOURCE_ERROR:
        message = '资源加载失败，请刷新页面重试';
        break;
      case ErrorType.VUE_ERROR:
        message = '页面渲染出错，请刷新页面';
        break;
      case ErrorType.PROMISE_REJECTION:
        // Promise 错误通常已经在业务代码中处理，这里不显示提示
        return;
    }

    ElMessage.error(message);
  }

  /**
   * 上报错误到服务器
   */
  private reportError(errorInfo: ErrorInfo) {
    if (!this.config.reportUrl) {
      return;
    }

    // 使用 navigator.sendBeacon 确保在页面卸载时也能发送
    const data = JSON.stringify(errorInfo);
    const blob = new Blob([data], { type: 'application/json' });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.reportUrl, blob);
    } else {
      // 降级方案：使用 fetch
      fetch(this.config.reportUrl, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch((err) => {
        console.error('Failed to report error:', err);
      });
    }
  }
}

// 创建单例
export const errorHandler = new ErrorHandler();

/**
 * 安装 Vue 全局错误处理器
 */
export function setupErrorHandler(app: App, config?: ErrorHandlerConfig) {
  // 初始化配置
  errorHandler.init(config);

  // Vue 全局错误处理器
  app.config.errorHandler = (err, instance, info) => {
    errorHandler.handleError(err, ErrorType.VUE_ERROR, {
      componentName: instance?.$options?.name || instance?.$options?.__name,
      propsData: instance?.$props,
      info,
    });
  };

  // Vue 警告处理器（开发环境）
  if (import.meta.env.DEV) {
    app.config.warnHandler = (msg, _instance, trace) => {
      console.warn('[Vue warn]', msg, trace);
    };
  }

  // 全局 Promise 未捕获错误处理
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault(); // 阻止默认的控制台错误输出

    errorHandler.handleError(
      event.reason,
      ErrorType.PROMISE_REJECTION,
      {
        promise: event.promise,
      }
    );
  });

  // 全局资源加载错误处理
  window.addEventListener(
    'error',
    (event) => {
      // 区分资源加载错误和 JS 运行时错误
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        errorHandler.handleError(
          new Error(`Resource load failed: ${target.tagName}`),
          ErrorType.RESOURCE_ERROR,
          {
            url: (target as any).src || (target as any).href,
            tagName: target.tagName,
          }
        );
      }
    },
    true // 使用捕获阶段
  );
}

/**
 * 手动上报错误
 * 
 * @param error - 未知类型的错误对象
 * @param additionalInfo - 附加错误信息（强类型）
 */
export function reportError(error: unknown, additionalInfo?: Record<string, unknown>) {
  errorHandler.handleError(error, ErrorType.UNKNOWN_ERROR, additionalInfo);
}

/**
 * 从各种错误格式中提取错误消息
 * 支持 axios 错误、Error 实例、字符串错误等多种格式
 * 
 * @param error - 错误对象（使用 unknown 类型确保类型安全）
 * @param fallback - 提取失败时的后备消息
 * @returns 提取的错误消息或后备消息
 * 
 * @example
 * ```typescript
 * try {
 *   await api.login(credentials);
 * } catch (error: unknown) {
 *   const message = getErrorMessage(error, '登录失败');
 *   ElMessage.error(message);
 * }
 * ```
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  // 处理 axios 错误响应格式
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message = axiosError.response?.data?.message;
    if (message && message.trim().length > 0) {
      return message;
    }
  }
  
  // 处理 Error 实例
  if (error instanceof Error) {
    const message = error.message;
    if (message && message.trim().length > 0) {
      return message;
    }
  }
  
  // 处理字符串错误
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed.length > 0) {
      return error; // 返回原始字符串（保留格式）
    }
  }
  
  // 返回后备消息
  return fallback;
}
