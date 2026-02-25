/**
 * TanStack Query (Vue Query) 配置
 *
 * 本模块负责创建和配置 Query Client，集成现有的错误处理系统。
 * Query Client 管理所有查询和变更的缓存、重试逻辑和后台同步。
 *
 * @module plugins/vue-query
 */

import { QueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { NetworkErrorClassifier } from '@/utils/network-error-classifier';
import { ErrorMessageGenerator } from '@/utils/error-message-generator';
import { NetworkErrorType } from '@/types/network-errors';

/**
 * Query Client 配置接口
 */
export interface QueryClientConfig {
  defaultOptions: {
    queries: {
      staleTime: number;
      gcTime: number;
      retry: number | ((failureCount: number, error: unknown) => boolean);
      refetchOnWindowFocus: boolean;
      refetchOnReconnect: boolean;
    };
    mutations: {
      retry: number;
    };
  };
}

/**
 * 创建 Query Client 实例
 *
 * 配置默认选项：
 * - staleTime: 5 分钟 - 数据被认为过期的时间
 * - gcTime: 10 分钟 - 数据在缓存中保留的时间（原 cacheTime）
 * - retry: 智能重试 - 使用 NetworkErrorClassifier 判断是否应该重试
 * - refetchOnWindowFocus: true - 窗口获得焦点时重新获取数据
 * - refetchOnReconnect: true - 网络重连时重新获取数据
 *
 * @returns {QueryClient} 配置好的 Query Client 实例
 */
export function createQueryClient(): QueryClient {
  const classifier = new NetworkErrorClassifier();
  const isDev = import.meta.env.DEV;

  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据新鲜度时间：5 分钟
        // 在此时间内，相同的查询会返回缓存数据而不发起新请求
        staleTime: 5 * 60 * 1000,

        // 垃圾回收时间：10 分钟
        // 未使用的查询数据会在此时间后从缓存中移除
        // 注意：TanStack Query v5 使用 gcTime 替代了 cacheTime
        gcTime: 10 * 60 * 1000,

        // 智能重试逻辑
        // 使用 NetworkErrorClassifier 判断错误类型，只对可恢复的错误重试
        retry: (failureCount: number, error: unknown) => {
          // 开发环境：完全禁用重试，快速失败以便调试
          if (isDev) {
            return false;
          }

          // 生产环境：最多重试 1 次
          if (failureCount >= 1) {
            return false;
          }

          // 使用 NetworkErrorClassifier 分类错误
          const classified = classifier.classifyError(error);

          // 定义可重试的错误类型
          // 这些错误通常是临时性的，重试可能会成功
          const retryableTypes = [
            // NetworkErrorType.CONNECTION_REFUSED, // 移除：服务器未启动时重试无意义
            NetworkErrorType.CONNECTION_RESET, // 连接重置（网络波动）
            NetworkErrorType.TIMEOUT, // 超时（服务器响应慢）
            // NetworkErrorType.NETWORK_GENERIC, // 移除：通用网络错误也不重试
          ];

          return retryableTypes.includes(classified.type);
        },

        // 窗口获得焦点时重新获取过期数据
        // 开发环境禁用，避免频繁切换窗口时触发请求
        refetchOnWindowFocus: !isDev,

        // 网络重连时重新获取失败的查询
        // 开发环境禁用，避免后端重启时立即触发大量请求
        refetchOnReconnect: !isDev,
      },
      mutations: {
        // 变更操作不重试
        // 变更操作通常不应该重试，以避免重复提交
        retry: 0,
      },
    },
  });
}

/**
 * 配置全局错误处理器
 *
 * 为 Query Client 设置全局错误处理，集成现有的错误分类和消息生成系统。
 * 所有查询和变更的错误都会经过此处理器，除非在具体的查询/变更中覆盖。
 *
 * 错误处理流程：
 * 1. 使用 NetworkErrorClassifier 分类错误
 * 2. 使用 ErrorMessageGenerator 生成用户友好的消息
 * 3. 使用 ElMessage 显示错误消息
 * 4. 在开发环境中记录详细的开发者日志
 *
 * 注意：TanStack Query v5 使用 QueryCache 和 MutationCache 的 onError 回调
 * 而不是 defaultOptions 中的 onError
 *
 * @param {QueryClient} queryClient - Query Client 实例
 */
export function setupQueryErrorHandler(queryClient: QueryClient): void {
  const classifier = new NetworkErrorClassifier();
  const messageGenerator = new ErrorMessageGenerator({
    environment: import.meta.env.MODE as 'development' | 'production',
    locale: 'zh-CN',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  });

  /**
   * 通用错误处理函数
   *
   * @param {unknown} error - 错误对象
   */
  const handleError = (error: unknown) => {
    // 1. 分类错误
    const classifiedError = classifier.classifyError(error);

    // 2. 生成用户消息
    const userMessage = messageGenerator.generateUserMessage(classifiedError);

    // 3. 生成开发者日志
    const devLog = messageGenerator.generateDeveloperLog(classifiedError);

    // 4. 显示用户消息
    ElMessage.error({
      message: userMessage.message,
      duration: 5000,
      showClose: true,
    });

    // 5. 记录开发者日志
    if (import.meta.env.DEV) {
      console.group('🔴 [TanStack Query Error]');
      console.error('Error Type:', devLog.type);
      console.error('Error Code:', devLog.code);
      console.error('Error Message:', devLog.message);
      console.error('URL:', devLog.url);
      console.error('Timestamp:', new Date(devLog.timestamp).toISOString());
      if (devLog.stack) {
        console.error('Stack:', devLog.stack);
      }
      if (devLog.config) {
        console.error('Request Config:', devLog.config);
      }
      console.groupEnd();
    } else {
      // 生产环境只记录简化的错误信息
      console.error('[Query Error]', {
        type: devLog.type,
        message: devLog.message,
        timestamp: devLog.timestamp,
      });
    }
  };

  // 获取 QueryCache 和 MutationCache 并设置错误处理器
  const queryCache = queryClient.getQueryCache();
  const mutationCache = queryClient.getMutationCache();

  // 监听查询错误
  queryCache.config.onError = handleError;

  // 监听变更错误
  mutationCache.config.onError = handleError;
}

