/**
 * 错误消息生成器
 *
 * 本模块负责根据分类后的错误生成用户友好的错误消息和详细的开发者日志。
 * 支持多语言、环境差异化和参数替换。
 *
 * @module utils/error-message-generator
 */

import type {
  ClassifiedError,
  UserMessage,
  DeveloperLog,
  ErrorMessageConfig,
  ErrorMessageTemplate,
} from '@/types/network-errors';
import { NetworkErrorType } from '@/types/network-errors';
import { ERROR_MESSAGES, isLocaleSupported, getDefaultLocale } from '@/locales/error-messages';

/**
 * 错误消息生成器类
 *
 * 负责生成用户消息和开发者日志，支持：
 * - 多语言错误消息
 * - 开发/生产环境差异化
 * - 参数替换
 * - 后备语言机制
 *
 * @class ErrorMessageGenerator
 */
export class ErrorMessageGenerator {
  private config: ErrorMessageConfig;

  /**
   * 创建错误消息生成器实例
   *
   * @param {ErrorMessageConfig} config - 配置对象
   */
  constructor(config: ErrorMessageConfig) {
    this.config = config;
  }

  /**
   * 生成用户消息
   *
   * 根据分类后的错误生成用户友好的错误消息。
   * 在开发环境中，消息会包含更多技术细节。
   *
   * @param {ClassifiedError} classifiedError - 分类后的错误
   * @returns {UserMessage} 用户消息对象
   */
  generateUserMessage(classifiedError: ClassifiedError): UserMessage {
    const template = this.getMessageTemplate(classifiedError.type);

    // 准备参数替换的数据
    const params: Record<string, string> = {
      url: classifiedError.url || 'unknown',
      origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      message: classifiedError.message,
    };

    // 生成基本消息
    const userMessage: UserMessage = {
      title: this.replaceParams(template.title, params),
      message: this.replaceParams(template.message, params),
      action: this.replaceParams(template.action, params),
    };

    // 在开发环境中添加技术细节
    if (this.config.environment === 'development' && template.dev) {
      const devInfo = this.replaceParams(template.dev, params);

      // 对于连接错误，添加 API 基础 URL 信息
      if (
        (classifiedError.type === NetworkErrorType.CONNECTION_REFUSED ||
          classifiedError.type === NetworkErrorType.CONNECTION_RESET) &&
        this.config.apiBaseUrl
      ) {
        userMessage.message += `\n[开发环境] API 基础地址: ${this.config.apiBaseUrl}`;
      }

      // 添加开发环境信息到消息末尾
      userMessage.message += `\n[开发环境] ${devInfo}`;
    }

    return userMessage;
  }

  /**
   * 生成开发者日志
   *
   * 生成详细的开发者日志，用于调试和问题排查。
   * 在开发环境中包含完整的错误堆栈和请求配置。
   *
   * @param {ClassifiedError} classifiedError - 分类后的错误
   * @param {any} [config] - Axios 请求配置（可选）
   * @returns {DeveloperLog} 开发者日志对象
   */
  generateDeveloperLog(classifiedError: ClassifiedError, config?: any): DeveloperLog {
    const log: DeveloperLog = {
      type: classifiedError.type,
      code: classifiedError.code,
      message: classifiedError.message,
      url: classifiedError.url,
      timestamp: classifiedError.timestamp,
      environment: this.config.environment,
    };

    // 在开发环境中添加完整的错误堆栈
    if (this.config.environment === 'development') {
      if (classifiedError.originalError instanceof Error) {
        log.stack = classifiedError.originalError.stack;
      }

      // 添加请求配置（移除敏感信息）
      if (config) {
        log.config = this.sanitizeConfig(config);
      }
    } else {
      // 在生产环境中只包含简化的错误信息
      log.message = this.simplifyErrorMessage(classifiedError.message);
    }

    return log;
  }

  /**
   * 获取本地化消息
   *
   * 根据配置的语言区域获取本地化的错误消息。
   * 如果指定语言不存在，则回退到英文。
   *
   * @param {string} key - 消息键（错误类型）
   * @param {Record<string, string>} [params] - 参数替换对象（可选）
   * @returns {string} 本地化的消息
   */
  getLocalizedMessage(key: string, params?: Record<string, string>): string {
    const locale = this.getEffectiveLocale();
    const messages = ERROR_MESSAGES[locale];

    if (!messages) {
      return key;
    }

    const errorType = key as NetworkErrorType;
    const template = messages[errorType];

    if (!template) {
      return key;
    }

    const message = template.message;
    return params ? this.replaceParams(message, params) : message;
  }

  /**
   * 获取消息模板
   *
   * 根据错误类型和配置的语言获取对应的消息模板。
   * 如果指定语言不存在，则回退到英文。
   *
   * @private
   * @param {NetworkErrorType} errorType - 错误类型
   * @returns {ErrorMessageTemplate} 错误消息模板
   */
  private getMessageTemplate(errorType: NetworkErrorType): ErrorMessageTemplate {
    const locale = this.getEffectiveLocale();
    const messages = ERROR_MESSAGES[locale];

    const template = messages?.[errorType];

    if (!template) {
      // 如果找不到模板，返回一个默认模板
      return {
        title: 'Error',
        message: 'An error occurred',
        action: 'Please try again later',
        dev: 'Error type: ' + errorType,
      };
    }

    return template;
  }

  /**
   * 获取有效的语言区域
   *
   * 如果配置的语言不支持，则回退到默认语言（英文）。
   *
   * @private
   * @returns {string} 有效的语言区域代码
   */
  private getEffectiveLocale(): string {
    if (isLocaleSupported(this.config.locale)) {
      return this.config.locale;
    }
    return getDefaultLocale();
  }

  /**
   * 替换消息中的参数
   *
   * 将消息模板中的 {key} 占位符替换为实际值。
   *
   * @private
   * @param {string} template - 消息模板
   * @param {Record<string, string>} params - 参数对象
   * @returns {string} 替换后的消息
   */
  private replaceParams(template: string, params: Record<string, string>): string {
    let result = template;

    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }

  /**
   * 清理请求配置
   *
   * 移除请求配置中的敏感信息（如 Authorization 头）。
   *
   * @private
   * @param {any} config - Axios 请求配置
   * @returns {any} 清理后的配置
   */
  private sanitizeConfig(config: any): any {
    const sanitized = { ...config };

    // 移除敏感的请求头
    if (sanitized.headers) {
      const headers = { ...sanitized.headers };
      delete headers.Authorization;
      delete headers.authorization;
      sanitized.headers = headers;
    }

    // 移除敏感的请求数据（如果包含密码字段）
    if (sanitized.data && typeof sanitized.data === 'object') {
      const data = { ...sanitized.data };
      if ('password' in data) {
        data.password = '***';
      }
      if ('token' in data) {
        data.token = '***';
      }
      sanitized.data = data;
    }

    return sanitized;
  }

  /**
   * 简化错误消息
   *
   * 在生产环境中简化错误消息，移除技术细节。
   *
   * @private
   * @param {string} message - 原始错误消息
   * @returns {string} 简化后的消息
   */
  private simplifyErrorMessage(message: string): string {
    // 移除可能包含的技术细节（如堆栈跟踪、文件路径等）
    const simplified = message
      .split('\n')[0] // 只保留第一行
      .replace(/at\s+.*\(.*\)/g, '') // 移除堆栈跟踪
      .replace(/\/[^\s]+/g, '') // 移除文件路径
      .trim();

    return simplified || 'An error occurred';
  }
}
