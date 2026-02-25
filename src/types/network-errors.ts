/**
 * 网络错误处理类型定义
 *
 * 本模块提供网络错误分类、消息生成和统计跟踪所需的核心类型定义。
 * 这些类型用于实现精确的错误分类系统，支持多语言错误消息和智能重试机制。
 *
 * @module types/network-errors
 */

import type { AxiosRequestConfig } from 'axios';

/**
 * 网络错误类型枚举
 *
 * 定义所有可能的网络错误类型，用于精确分类和处理不同的网络错误场景。
 *
 * @enum {string}
 */
export enum NetworkErrorType {
  /** 连接被拒绝 - 服务器未响应或未启动 */
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  /** 连接重置 - 连接在传输过程中被中断 */
  CONNECTION_RESET = 'CONNECTION_RESET',

  /** 跨域错误 - CORS 策略阻止了请求 */
  CORS = 'CORS',

  /** 超时 - 请求或响应超过了时间限制 */
  TIMEOUT = 'TIMEOUT',

  /** 浏览器离线 - 设备失去网络连接 */
  OFFLINE = 'OFFLINE',

  /** 通用网络错误 - 其他网络相关错误 */
  NETWORK_GENERIC = 'NETWORK_GENERIC',

  /** 未知错误 - 无法分类的错误 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 分类后的错误信息
 *
 * 包含错误分类结果和相关元数据，用于后续的消息生成和统计记录。
 *
 * @interface ClassifiedError
 */
export interface ClassifiedError {
  /** 错误类型 */
  type: NetworkErrorType;

  /** 原始错误对象 */
  originalError: unknown;

  /** 错误代码（如 ERR_CONNECTION_REFUSED） */
  code?: string;

  /** 错误消息 */
  message: string;

  /** 请求的 URL */
  url?: string;

  /** 错误发生时的时间戳（毫秒） */
  timestamp: number;
}

/**
 * 用户消息
 *
 * 用于向用户显示的友好错误消息，包含标题、描述和可操作的建议。
 *
 * @interface UserMessage
 */
export interface UserMessage {
  /** 错误标题 */
  title: string;

  /** 错误描述消息 */
  message: string;

  /** 可操作的建议（可选） */
  action?: string;
}

/**
 * 开发者日志
 *
 * 用于开发者调试的详细错误信息，包含完整的技术细节。
 *
 * @interface DeveloperLog
 */
export interface DeveloperLog {
  /** 错误类型 */
  type: NetworkErrorType;

  /** 错误代码 */
  code?: string;

  /** 错误消息 */
  message: string;

  /** 请求的 URL */
  url?: string;

  /** 错误发生时的时间戳（毫秒） */
  timestamp: number;

  /** 错误堆栈跟踪 */
  stack?: string;

  /** Axios 请求配置 */
  config?: AxiosRequestConfig;

  /** 运行环境（development 或 production） */
  environment: string;
}

/**
 * 错误消息配置
 *
 * 用于配置错误消息生成器的参数。
 *
 * @interface ErrorMessageConfig
 */
export interface ErrorMessageConfig {
  /** 运行环境 */
  environment: 'development' | 'production';

  /** 语言区域设置 */
  locale: 'zh-CN' | 'en-US';

  /** API 基础 URL（可选） */
  apiBaseUrl?: string;
}

/**
 * 错误统计信息
 *
 * 记录特定错误类型的统计数据，用于监控和分析。
 *
 * @interface ErrorStatistics
 */
export interface ErrorStatistics {
  /** 错误类型 */
  type: NetworkErrorType;

  /** 错误发生次数 */
  count: number;

  /** 首次发生时间戳（毫秒） */
  firstOccurrence: number;

  /** 最后发生时间戳（毫秒） */
  lastOccurrence: number;

  /** 连续发生次数 */
  consecutiveCount: number;
}

/**
 * 重试配置
 *
 * 定义请求重试的策略和限制。
 *
 * @interface RetryConfig
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number;

  /** 重试延迟（毫秒） */
  retryDelay: number;

  /** 可重试的错误类型列表 */
  retryableErrors: NetworkErrorType[];
}

/**
 * 缓存的请求
 *
 * 存储失败的请求信息，用于后续重试。
 *
 * @interface CachedRequest
 */
export interface CachedRequest {
  /** 请求唯一标识符 */
  id: string;

  /** Axios 请求配置 */
  config: AxiosRequestConfig;

  /** 缓存时间戳（毫秒） */
  timestamp: number;

  /** 已重试次数 */
  retryCount: number;
}

/**
 * 错误消息模板
 *
 * 定义不同语言的错误消息模板结构。
 *
 * @interface ErrorMessageTemplate
 */
export interface ErrorMessageTemplate {
  /** 错误标题 */
  title: string;

  /** 错误消息 */
  message: string;

  /** 可操作的建议 */
  action: string;

  /** 开发环境附加信息（可选） */
  dev?: string;
}

/**
 * 错误消息字典
 *
 * 按语言和错误类型组织的错误消息模板集合。
 *
 * @type ErrorMessageDictionary
 */
export type ErrorMessageDictionary = {
  [locale: string]: {
    [key in NetworkErrorType]?: ErrorMessageTemplate;
  };
};
