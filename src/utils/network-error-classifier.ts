/**
 * 网络错误分类器
 *
 * 负责准确分类网络错误类型，区分连接错误、CORS 错误、超时错误等。
 * 这是错误处理系统的核心组件，确保错误被正确识别以便后续处理。
 *
 * @module utils/network-error-classifier
 */

import type { AxiosError, AxiosRequestConfig } from 'axios';
import { NetworkErrorType, type ClassifiedError } from '@/types/network-errors';

/**
 * 网络错误分类器类
 *
 * 提供精确的错误分类功能，通过分析错误代码、错误消息和网络状态
 * 来准确识别不同类型的网络错误。
 *
 * @class NetworkErrorClassifier
 */
export class NetworkErrorClassifier {
  /**
   * 分类网络错误
   *
   * 根据错误对象的特征（错误代码、消息、网络状态等）将错误分类到
   * 具体的错误类型。分类顺序很重要：先检查连接错误，再检查 CORS 错误，
   * 以避免将连接错误误判为 CORS 错误。
   *
   * @param error - 原始错误对象
   * @param config - Axios 请求配置（可选）
   * @returns 分类后的错误信息
   */
  classifyError(error: unknown, config?: AxiosRequestConfig): ClassifiedError {
    const timestamp = Date.now();
    const axiosError = error as AxiosError;

    // 提取错误信息
    const code = axiosError?.code;
    const message = axiosError?.message || String(error);
    const url = config?.url || axiosError?.config?.url;

    // 按优先级进行错误分类
    // 1. 首先检查离线状态
    if (this.isOfflineError()) {
      return {
        type: NetworkErrorType.OFFLINE,
        originalError: error,
        code,
        message,
        url,
        timestamp,
      };
    }

    // 2. 检查连接错误（必须在 CORS 检查之前）
    if (this.isConnectionError(error)) {
      // 根据具体的错误代码细分连接错误类型
      if (code === 'ERR_CONNECTION_RESET') {
        return {
          type: NetworkErrorType.CONNECTION_RESET,
          originalError: error,
          code,
          message,
          url,
          timestamp,
        };
      }
      return {
        type: NetworkErrorType.CONNECTION_REFUSED,
        originalError: error,
        code,
        message,
        url,
        timestamp,
      };
    }

    // 3. 检查超时错误
    if (this.isTimeoutError(error)) {
      return {
        type: NetworkErrorType.TIMEOUT,
        originalError: error,
        code,
        message,
        url,
        timestamp,
      };
    }

    // 4. 检查 CORS 错误（必须在连接错误检查之后）
    if (this.isCorsError(error)) {
      return {
        type: NetworkErrorType.CORS,
        originalError: error,
        code,
        message,
        url,
        timestamp,
      };
    }

    // 5. 检查是否为通用网络错误
    if (code === 'ERR_NETWORK' || message.includes('Network Error')) {
      return {
        type: NetworkErrorType.NETWORK_GENERIC,
        originalError: error,
        code,
        message,
        url,
        timestamp,
      };
    }

    // 6. 无法分类的错误
    return {
      type: NetworkErrorType.UNKNOWN,
      originalError: error,
      code,
      message,
      url,
      timestamp,
    };
  }

  /**
   * 检查是否为连接错误
   *
   * 连接错误表示无法建立与服务器的 TCP 连接，通常是因为：
   * - 服务器未启动
   * - 端口不可达
   * - 网络配置问题
   *
   * 识别标准：
   * - 错误代码为 ERR_CONNECTION_REFUSED
   * - 错误代码为 ERR_CONNECTION_RESET
   * - 错误代码为 ECONNREFUSED（Node.js 风格）
   *
   * @param error - 错误对象
   * @returns 如果是连接错误返回 true，否则返回 false
   */
  isConnectionError(error: unknown): boolean {
    const axiosError = error as AxiosError;
    const code = axiosError?.code;

    // 检查常见的连接错误代码
    return (
      code === 'ERR_CONNECTION_REFUSED' ||
      code === 'ERR_CONNECTION_RESET' ||
      code === 'ECONNREFUSED'
    );
  }

  /**
   * 检查是否为 CORS 错误
   *
   * CORS 错误表示服务器拒绝了跨域请求，通常是因为：
   * - 服务器未配置 CORS 头
   * - CORS 配置不正确
   * - Origin 不在允许列表中
   *
   * 识别标准：
   * - 错误消息包含 "CORS policy"
   * - 错误消息包含 "Access-Control-Allow-Origin"
   * - 必须不是连接错误（避免误判）
   *
   * 注意：必须先排除连接错误，因为连接错误也可能触发浏览器的
   * CORS 相关错误消息，但根本原因是连接失败而非 CORS 配置问题。
   *
   * @param error - 错误对象
   * @returns 如果是 CORS 错误返回 true，否则返回 false
   */
  isCorsError(error: unknown): boolean {
    // 首先确保不是连接错误
    if (this.isConnectionError(error)) {
      return false;
    }

    const axiosError = error as AxiosError;
    const message = axiosError?.message || '';

    // 检查错误消息中是否包含 CORS 相关关键词
    return (
      message.includes('CORS policy') ||
      message.includes('Access-Control-Allow-Origin')
    );
  }

  /**
   * 检查是否为超时错误
   *
   * 超时错误表示请求或响应超过了时间限制，通常是因为：
   * - 服务器响应缓慢
   * - 网络延迟过高
   * - 请求处理时间过长
   *
   * 识别标准：
   * - 错误代码为 ECONNABORTED
   * - 错误代码为 ETIMEDOUT
   * - 错误消息包含 "timeout"
   *
   * @param error - 错误对象
   * @returns 如果是超时错误返回 true，否则返回 false
   */
  isTimeoutError(error: unknown): boolean {
    const axiosError = error as AxiosError;
    const code = axiosError?.code;
    const message = axiosError?.message || '';

    // 检查超时相关的错误代码和消息
    return (
      code === 'ECONNABORTED' ||
      code === 'ETIMEDOUT' ||
      message.toLowerCase().includes('timeout')
    );
  }

  /**
   * 检查浏览器是否离线
   *
   * 离线状态表示设备失去了网络连接，通常是因为：
   * - WiFi 断开
   * - 网线拔出
   * - 移动网络不可用
   *
   * 识别标准：
   * - 检查 navigator.onLine 属性
   *
   * 注意：navigator.onLine 并不总是可靠，某些情况下即使有网络连接
   * 也可能返回 false，或者没有网络连接时返回 true。但它仍然是
   * 检测离线状态的最佳方式。
   *
   * @returns 如果浏览器离线返回 true，否则返回 false
   */
  isOfflineError(): boolean {
    // 检查浏览器的在线状态
    // 如果 navigator.onLine 为 false，表示浏览器认为设备离线
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }
}
