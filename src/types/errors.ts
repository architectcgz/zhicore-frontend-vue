/**
 * 错误处理类型和工具
 *
 * 本模块提供类型安全的错误处理，包括可辨识联合类型、
 * 类型守卫和辅助函数，用于一致的错误管理。
 *
 * @module types/errors
 */

/**
 * 基础错误接口
 *
 * 所有应用程序错误共享的通用属性。
 */
export interface BaseError {
  /** 人类可读的错误消息 */
  message: string;
  /** 可选的堆栈跟踪，用于调试 */
  stack?: string;
  /** 错误发生时的 Unix 时间戳 */
  timestamp: number;
}

/**
 * API 错误
 *
 * 表示从 API 端点返回的错误，包含 HTTP 状态码
 * 和可选的字段级验证信息。
 *
 * @property code - HTTP 状态码或应用程序错误码
 * @property details - 附加错误详情
 * @property field - 验证错误的字段名
 */
export interface ApiError extends BaseError {
  code: number;
  details?: string;
  field?: string;
}

/**
 * 网络错误
 *
 * 表示网络级错误，如超时、连接失败或请求中止。
 *
 * @property type - 网络错误的具体类型
 * @property url - 可选的导致错误的 URL
 */
export interface NetworkError extends BaseError {
  type: 'timeout' | 'connection' | 'abort';
  url?: string;
}

/**
 * 验证错误
 *
 * 表示客户端验证错误，包含字段特定信息。
 *
 * @property field - 验证失败的字段名
 * @property value - 无效的值
 * @property constraint - 被违反的验证约束描述
 */
export interface ValidationError extends BaseError {
  field: string;
  value: unknown;
  constraint: string;
}

/**
 * 应用程序错误联合类型
 *
 * 应用程序中所有可能错误类型的可辨识联合。
 * 使用类型守卫来收窄到特定错误类型。
 */
export type AppError = ApiError | NetworkError | ValidationError | Error;

/**
 * 错误处理器回调
 *
 * 错误处理回调的函数签名。
 */
export type ErrorHandler = (error: AppError) => void;

/**
 * 错误类型枚举
 *
 * 用于日志记录和监控的错误类别。
 */
export type ErrorType = 'api' | 'network' | 'validation' | 'runtime' | 'unknown';

/**
 * 用于日志记录的错误信息
 *
 * 增强的错误信息结构，用于日志记录和监控。
 * 替换了之前使用 'any' 类型的版本。
 *
 * @property type - 错误类别
 * @property message - 人类可读的错误消息
 * @property stack - 可选的堆栈跟踪
 * @property componentName - 可选的发生错误的 Vue 组件名
 * @property propsData - 可选的组件 props 数据（强类型）
 * @property url - 可选的与错误相关的 URL
 * @property timestamp - 错误发生时的 Unix 时间戳
 * @property userId - 可选的用户 ID，用于跟踪
 * @property userAgent - 可选的浏览器用户代理字符串
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  stack?: string;
  componentName?: string;
  propsData?: Record<string, unknown>;
  url?: string;
  timestamp: number;
  userId?: string;
  userAgent?: string;
}

/**
 * API 错误的类型守卫
 *
 * 通过验证必需属性的存在来检查未知错误是否为 ApiError。
 *
 * @param error - 要检查的错误
 * @returns 如果错误是 ApiError 返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * try {
 *   await api.fetchData();
 * } catch (error: unknown) {
 *   if (isApiError(error)) {
 *     console.log(`API 错误 ${error.code}: ${error.message}`);
 *   }
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ApiError).code === 'number' &&
    typeof (error as ApiError).message === 'string'
  );
}

/**
 * 网络错误的类型守卫
 *
 * 通过验证 type 属性是否存在且具有有效值来检查未知错误是否为 NetworkError。
 *
 * @param error - 要检查的错误
 * @returns 如果错误是 NetworkError 返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * try {
 *   await api.fetchData();
 * } catch (error: unknown) {
 *   if (isNetworkError(error)) {
 *     console.log(`网络错误: ${error.type}`);
 *   }
 * }
 * ```
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    ['timeout', 'connection', 'abort'].includes((error as NetworkError).type)
  );
}

/**
 * 验证错误的类型守卫
 *
 * 通过验证必需的 field 和 constraint 属性是否存在来检查未知错误是否为 ValidationError。
 *
 * @param error - 要检查的错误
 * @returns 如果错误是 ValidationError 返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * try {
 *   validateForm(data);
 * } catch (error: unknown) {
 *   if (isValidationError(error)) {
 *     console.log(`${error.field} 验证失败: ${error.constraint}`);
 *   }
 * }
 * ```
 */
export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    'constraint' in error &&
    typeof (error as ValidationError).field === 'string' &&
    typeof (error as ValidationError).constraint === 'string'
  );
}

/**
 * 获取错误消息辅助函数
 *
 * 安全地从任何错误类型中提取人类可读的错误消息。
 * 为未知错误类型提供后备消息。
 *
 * @param error - 要提取消息的错误
 * @returns 人类可读的错误消息
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error: unknown) {
 *   const message = getErrorMessage(error);
 *   showNotification(message);
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isApiError(error)) {
    return error.details || error.message;
  }

  if (isNetworkError(error)) {
    return error.message;
  }

  if (isValidationError(error)) {
    return `${error.field}: ${error.constraint}`;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '发生未知错误';
}

/**
 * 创建 API 错误辅助函数
 *
 * 用于创建具有一致结构的 ApiError 实例的工厂函数。
 *
 * @param code - HTTP 状态码或应用程序错误码
 * @param message - 人类可读的错误消息
 * @param details - 可选的附加错误详情
 * @param field - 可选的验证错误字段名
 * @returns ApiError 实例
 */
export function createApiError(
  code: number,
  message: string,
  details?: string,
  field?: string
): ApiError {
  return {
    code,
    message,
    details,
    field,
    timestamp: Date.now(),
  };
}

/**
 * 创建网络错误辅助函数
 *
 * 用于创建具有一致结构的 NetworkError 实例的工厂函数。
 *
 * @param type - 网络错误类型
 * @param message - 人类可读的错误消息
 * @param url - 可选的导致错误的 URL
 * @returns NetworkError 实例
 */
export function createNetworkError(
  type: NetworkError['type'],
  message: string,
  url?: string
): NetworkError {
  return {
    type,
    message,
    url,
    timestamp: Date.now(),
  };
}

/**
 * 创建验证错误辅助函数
 *
 * 用于创建具有一致结构的 ValidationError 实例的工厂函数。
 *
 * @param field - 验证失败的字段名
 * @param constraint - 验证约束描述
 * @param value - 无效的值
 * @returns ValidationError 实例
 */
export function createValidationError(
  field: string,
  constraint: string,
  value: unknown
): ValidationError {
  return {
    field,
    constraint,
    value,
    message: `${field} 验证失败: ${constraint}`,
    timestamp: Date.now(),
  };
}
