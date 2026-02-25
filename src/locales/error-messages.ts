/**
 * 网络错误消息模板
 *
 * 本模块提供多语言的网络错误消息模板，支持中文和英文。
 * 每个错误类型都包含标题、消息、操作建议和开发环境附加信息。
 *
 * @module locales/error-messages
 */

import { NetworkErrorType } from '@/types/network-errors';
import type { ErrorMessageDictionary } from '@/types/network-errors';

/**
 * 错误消息字典
 *
 * 按语言区域（locale）和错误类型组织的错误消息模板。
 * 支持参数替换，使用 {key} 格式的占位符。
 *
 * 参数说明：
 * - {url}: 请求的目标 URL
 * - {origin}: 请求的来源地址
 *
 * @constant
 */
export const ERROR_MESSAGES: ErrorMessageDictionary = {
  'zh-CN': {
    [NetworkErrorType.CONNECTION_REFUSED]: {
      title: '无法连接到服务器',
      message: '服务器未响应，请检查服务器是否启动',
      action: '请联系管理员或稍后重试',
      dev: '目标地址: {url}',
    },
    [NetworkErrorType.CONNECTION_RESET]: {
      title: '连接已重置',
      message: '与服务器的连接在传输过程中被中断',
      action: '请检查网络连接或稍后重试',
      dev: '目标地址: {url}',
    },
    [NetworkErrorType.CORS]: {
      title: '跨域请求失败',
      message: '服务器拒绝了跨域请求',
      action: '请检查服务器 CORS 配置',
      dev: 'Origin: {origin}, Target: {url}',
    },
    [NetworkErrorType.TIMEOUT]: {
      title: '请求超时',
      message: '服务器响应时间过长',
      action: '请检查网络连接或稍后重试',
      dev: '超时 URL: {url}',
    },
    [NetworkErrorType.OFFLINE]: {
      title: '网络连接已断开',
      message: '您的设备已离线',
      action: '请检查网络设置',
      dev: '浏览器离线状态',
    },
    [NetworkErrorType.NETWORK_GENERIC]: {
      title: '网络异常',
      message: '网络请求失败',
      action: '请稍后重试',
      dev: '通用网络错误: {url}',
    },
    [NetworkErrorType.UNKNOWN]: {
      title: '未知错误',
      message: '发生了未知的错误',
      action: '请稍后重试或联系技术支持',
      dev: '未分类错误: {message}',
    },
  },
  'en-US': {
    [NetworkErrorType.CONNECTION_REFUSED]: {
      title: 'Cannot Connect to Server',
      message: 'Server is not responding, please check if the server is running',
      action: 'Please contact administrator or try again later',
      dev: 'Target URL: {url}',
    },
    [NetworkErrorType.CONNECTION_RESET]: {
      title: 'Connection Reset',
      message: 'Connection to server was interrupted during transmission',
      action: 'Please check network connection or try again later',
      dev: 'Target URL: {url}',
    },
    [NetworkErrorType.CORS]: {
      title: 'CORS Request Failed',
      message: 'Server rejected the cross-origin request',
      action: 'Please check server CORS configuration',
      dev: 'Origin: {origin}, Target: {url}',
    },
    [NetworkErrorType.TIMEOUT]: {
      title: 'Request Timeout',
      message: 'Server took too long to respond',
      action: 'Please check network connection or try again later',
      dev: 'Timeout URL: {url}',
    },
    [NetworkErrorType.OFFLINE]: {
      title: 'Network Disconnected',
      message: 'Your device is offline',
      action: 'Please check network settings',
      dev: 'Browser offline state',
    },
    [NetworkErrorType.NETWORK_GENERIC]: {
      title: 'Network Error',
      message: 'Network request failed',
      action: 'Please try again later',
      dev: 'Generic network error: {url}',
    },
    [NetworkErrorType.UNKNOWN]: {
      title: 'Unknown Error',
      message: 'An unknown error occurred',
      action: 'Please try again later or contact technical support',
      dev: 'Unclassified error: {message}',
    },
  },
};

/**
 * 获取支持的语言列表
 *
 * @returns {string[]} 支持的语言区域代码列表
 */
export function getSupportedLocales(): string[] {
  return Object.keys(ERROR_MESSAGES);
}

/**
 * 检查是否支持指定的语言
 *
 * @param {string} locale - 语言区域代码
 * @returns {boolean} 是否支持该语言
 */
export function isLocaleSupported(locale: string): boolean {
  return locale in ERROR_MESSAGES;
}

/**
 * 获取默认语言
 *
 * @returns {string} 默认语言区域代码
 */
export function getDefaultLocale(): string {
  return 'en-US';
}
