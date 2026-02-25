/**
 * ErrorMessageGenerator 单元测试
 *
 * 测试错误消息生成器的各种功能，包括：
 * - 不同错误类型的消息生成
 * - 中文和英文消息
 * - 开发环境消息包含技术细节
 * - 生产环境消息隐藏技术细节
 * - 开发者日志包含所有必需字段
 *
 * Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorMessageGenerator } from '@/utils/error-message-generator';
import { NetworkErrorType } from '@/types/network-errors';
import type { ClassifiedError, ErrorMessageConfig } from '@/types/network-errors';

describe('ErrorMessageGenerator', () => {
  let generator: ErrorMessageGenerator;
  let mockClassifiedError: ClassifiedError;

  beforeEach(() => {
    // 默认配置：开发环境，中文
    const config: ErrorMessageConfig = {
      environment: 'development',
      locale: 'zh-CN',
      apiBaseUrl: 'http://localhost:8080',
    };
    generator = new ErrorMessageGenerator(config);

    // 模拟 window.location.origin
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost:3000',
      },
    });

    // 默认的分类错误对象
    mockClassifiedError = {
      type: NetworkErrorType.CONNECTION_REFUSED,
      originalError: new Error('Connection refused'),
      code: 'ERR_CONNECTION_REFUSED',
      message: 'connect ECONNREFUSED 127.0.0.1:8080',
      url: 'http://localhost:8080/api/users',
      timestamp: Date.now(),
    };
  });

  describe('不同错误类型的消息生成', () => {
    it('应该为 CONNECTION_REFUSED 错误生成正确的消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.title).toBe('无法连接到服务器');
      expect(userMessage.message).toContain('服务器未响应');
      expect(userMessage.action).toBe('请联系管理员或稍后重试');
    });

    it('应该为 CONNECTION_RESET 错误生成正确的消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_RESET,
        code: 'ERR_CONNECTION_RESET',
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.title).toBe('连接已重置');
      expect(userMessage.message).toContain('连接在传输过程中被中断');
      expect(userMessage.action).toBe('请检查网络连接或稍后重试');
    });

    it('应该为 CORS 错误生成正确的消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CORS,
        code: 'ERR_NETWORK',
        message: 'CORS policy blocked',
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.title).toBe('跨域请求失败');
      expect(userMessage.message).toContain('服务器拒绝了跨域请求');
      expect(userMessage.action).toBe('请检查服务器 CORS 配置');
    });

    it('应该为 TIMEOUT 错误生成正确的消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.TIMEOUT,
        code: 'ECONNABORTED',
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.title).toBe('请求超时');
      expect(userMessage.message).toContain('服务器响应时间过长');
      expect(userMessage.action).toBe('请检查网络连接或稍后重试');
    });

    it('应该为 OFFLINE 错误生成正确的消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.OFFLINE,
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.title).toBe('网络连接已断开');
      expect(userMessage.message).toContain('您的设备已离线');
      expect(userMessage.action).toBe('请检查网络设置');
    });

    it('应该为 NETWORK_GENERIC 错误生成正确的消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.NETWORK_GENERIC,
        code: 'ERR_NETWORK',
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.title).toBe('网络异常');
      expect(userMessage.message).toContain('网络请求失败');
      expect(userMessage.action).toBe('请稍后重试');
    });

    it('应该为 UNKNOWN 错误生成正确的消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.UNKNOWN,
        code: undefined,
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.title).toBe('未知错误');
      expect(userMessage.message).toContain('发生了未知的错误');
      expect(userMessage.action).toBe('请稍后重试或联系技术支持');
    });
  });

  describe('中文和英文消息', () => {
    it('应该生成中文错误消息', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const zhGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
      };

      const userMessage = zhGenerator.generateUserMessage(error);

      expect(userMessage.title).toBe('无法连接到服务器');
      expect(userMessage.message).toContain('服务器未响应');
      expect(userMessage.action).toBe('请联系管理员或稍后重试');
    });

    it('应该生成英文错误消息', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'en-US',
      };
      const enGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
      };

      const userMessage = enGenerator.generateUserMessage(error);

      expect(userMessage.title).toBe('Cannot Connect to Server');
      expect(userMessage.message).toContain('Server is not responding');
      expect(userMessage.action).toBe('Please contact administrator or try again later');
    });

    it('应该为所有错误类型提供中文消息', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const zhGenerator = new ErrorMessageGenerator(config);

      const errorTypes = [
        NetworkErrorType.CONNECTION_REFUSED,
        NetworkErrorType.CONNECTION_RESET,
        NetworkErrorType.CORS,
        NetworkErrorType.TIMEOUT,
        NetworkErrorType.OFFLINE,
        NetworkErrorType.NETWORK_GENERIC,
        NetworkErrorType.UNKNOWN,
      ];

      errorTypes.forEach((type) => {
        const error: ClassifiedError = {
          ...mockClassifiedError,
          type,
        };

        const userMessage = zhGenerator.generateUserMessage(error);

        expect(userMessage.title).toBeTruthy();
        expect(userMessage.message).toBeTruthy();
        expect(userMessage.action).toBeTruthy();
        // 确保消息是中文（包含中文字符）
        expect(userMessage.title).toMatch(/[\u4e00-\u9fa5]/);
      });
    });

    it('应该为所有错误类型提供英文消息', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'en-US',
      };
      const enGenerator = new ErrorMessageGenerator(config);

      const errorTypes = [
        NetworkErrorType.CONNECTION_REFUSED,
        NetworkErrorType.CONNECTION_RESET,
        NetworkErrorType.CORS,
        NetworkErrorType.TIMEOUT,
        NetworkErrorType.OFFLINE,
        NetworkErrorType.NETWORK_GENERIC,
        NetworkErrorType.UNKNOWN,
      ];

      errorTypes.forEach((type) => {
        const error: ClassifiedError = {
          ...mockClassifiedError,
          type,
        };

        const userMessage = enGenerator.generateUserMessage(error);

        expect(userMessage.title).toBeTruthy();
        expect(userMessage.message).toBeTruthy();
        expect(userMessage.action).toBeTruthy();
        // 确保消息是英文（不包含中文字符）
        expect(userMessage.title).not.toMatch(/[\u4e00-\u9fa5]/);
      });
    });
  });

  describe('开发环境消息包含技术细节', () => {
    it('开发环境应该在消息中包含目标 URL', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
        url: 'http://localhost:8080/api/users',
      };

      const userMessage = devGenerator.generateUserMessage(error);

      expect(userMessage.message).toContain('[开发环境]');
      expect(userMessage.message).toContain('目标地址');
      expect(userMessage.message).toContain('http://localhost:8080/api/users');
    });

    it('开发环境应该为连接错误添加 API 基础 URL', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
        apiBaseUrl: 'http://localhost:8080',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
      };

      const userMessage = devGenerator.generateUserMessage(error);

      expect(userMessage.message).toContain('API 基础地址');
      expect(userMessage.message).toContain('http://localhost:8080');
    });

    it('开发环境应该为 CONNECTION_RESET 错误添加 API 基础 URL', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
        apiBaseUrl: 'http://localhost:8080',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_RESET,
      };

      const userMessage = devGenerator.generateUserMessage(error);

      expect(userMessage.message).toContain('API 基础地址');
      expect(userMessage.message).toContain('http://localhost:8080');
    });

    it('开发环境应该为 CORS 错误显示 Origin 和 Target', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CORS,
        url: 'http://api.example.com/data',
      };

      const userMessage = devGenerator.generateUserMessage(error);

      expect(userMessage.message).toContain('[开发环境]');
      expect(userMessage.message).toContain('Origin');
      expect(userMessage.message).toContain('http://localhost:3000');
      expect(userMessage.message).toContain('http://api.example.com/data');
    });

    it('开发环境应该为 TIMEOUT 错误显示超时 URL', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.TIMEOUT,
        url: 'http://slow-api.example.com/data',
      };

      const userMessage = devGenerator.generateUserMessage(error);

      expect(userMessage.message).toContain('[开发环境]');
      expect(userMessage.message).toContain('超时 URL');
      expect(userMessage.message).toContain('http://slow-api.example.com/data');
    });

    it('开发环境应该处理 URL 为 unknown 的情况', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
        url: undefined,
      };

      const userMessage = devGenerator.generateUserMessage(error);

      expect(userMessage.message).toContain('[开发环境]');
      expect(userMessage.message).toContain('unknown');
    });
  });

  describe('生产环境消息隐藏技术细节', () => {
    it('生产环境不应该在消息中包含技术细节', () => {
      const config: ErrorMessageConfig = {
        environment: 'production',
        locale: 'zh-CN',
        apiBaseUrl: 'http://localhost:8080',
      };
      const prodGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
        url: 'http://localhost:8080/api/users',
      };

      const userMessage = prodGenerator.generateUserMessage(error);

      expect(userMessage.message).not.toContain('[开发环境]');
      expect(userMessage.message).not.toContain('目标地址');
      expect(userMessage.message).not.toContain('http://localhost:8080');
      expect(userMessage.message).not.toContain('API 基础地址');
    });

    it('生产环境不应该显示 URL 信息', () => {
      const config: ErrorMessageConfig = {
        environment: 'production',
        locale: 'zh-CN',
      };
      const prodGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CORS,
        url: 'http://api.example.com/data',
      };

      const userMessage = prodGenerator.generateUserMessage(error);

      expect(userMessage.message).not.toContain('http://api.example.com/data');
      expect(userMessage.message).not.toContain('Origin');
      expect(userMessage.message).not.toContain('[开发环境]');
    });

    it('生产环境应该只显示用户友好的消息', () => {
      const config: ErrorMessageConfig = {
        environment: 'production',
        locale: 'zh-CN',
      };
      const prodGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
      };

      const userMessage = prodGenerator.generateUserMessage(error);

      expect(userMessage.title).toBe('无法连接到服务器');
      expect(userMessage.message).toBe('服务器未响应，请检查服务器是否启动');
      expect(userMessage.action).toBe('请联系管理员或稍后重试');
    });

    it('生产环境和开发环境的基本消息应该相同', () => {
      const devConfig: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const prodConfig: ErrorMessageConfig = {
        environment: 'production',
        locale: 'zh-CN',
      };

      const devGenerator = new ErrorMessageGenerator(devConfig);
      const prodGenerator = new ErrorMessageGenerator(prodConfig);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.TIMEOUT,
      };

      const devMessage = devGenerator.generateUserMessage(error);
      const prodMessage = prodGenerator.generateUserMessage(error);

      // 标题和操作建议应该相同
      expect(devMessage.title).toBe(prodMessage.title);
      expect(devMessage.action).toBe(prodMessage.action);

      // 开发环境的消息应该包含额外的技术细节
      expect(devMessage.message.length).toBeGreaterThan(prodMessage.message.length);
    });
  });

  describe('开发者日志包含所有必需字段', () => {
    it('开发者日志应该包含错误类型', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.type).toBe(NetworkErrorType.CONNECTION_REFUSED);
    });

    it('开发者日志应该包含错误代码', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        code: 'ERR_CONNECTION_REFUSED',
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.code).toBe('ERR_CONNECTION_REFUSED');
    });

    it('开发者日志应该包含错误消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        message: 'connect ECONNREFUSED 127.0.0.1:8080',
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.message).toBe('connect ECONNREFUSED 127.0.0.1:8080');
    });

    it('开发者日志应该包含请求 URL', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        url: 'http://localhost:8080/api/users',
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.url).toBe('http://localhost:8080/api/users');
    });

    it('开发者日志应该包含时间戳', () => {
      const timestamp = Date.now();
      const error: ClassifiedError = {
        ...mockClassifiedError,
        timestamp,
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.timestamp).toBe(timestamp);
    });

    it('开发者日志应该包含环境信息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.environment).toBe('development');
    });

    it('开发环境的开发者日志应该包含错误堆栈', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const originalError = new Error('Test error');
      const error: ClassifiedError = {
        ...mockClassifiedError,
        originalError,
      };

      const devLog = devGenerator.generateDeveloperLog(error);

      expect(devLog.stack).toBeDefined();
      expect(devLog.stack).toBe(originalError.stack);
    });

    it('开发环境的开发者日志应该包含请求配置', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
      };

      const requestConfig = {
        url: 'http://localhost:8080/api/users',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer secret-token',
        },
      };

      const devLog = devGenerator.generateDeveloperLog(error, requestConfig);

      expect(devLog.config).toBeDefined();
      expect(devLog.config?.url).toBe('http://localhost:8080/api/users');
      expect(devLog.config?.method).toBe('GET');
    });

    it('开发环境应该清理请求配置中的敏感信息', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
      };

      const requestConfig = {
        url: 'http://localhost:8080/api/users',
        headers: {
          Authorization: 'Bearer secret-token',
          authorization: 'Bearer another-token',
        },
        data: {
          username: 'testuser',
          password: 'secret-password',
          token: 'secret-token',
        },
      };

      const devLog = devGenerator.generateDeveloperLog(error, requestConfig);

      // Authorization 头应该被移除
      expect(devLog.config?.headers?.Authorization).toBeUndefined();
      expect(devLog.config?.headers?.authorization).toBeUndefined();

      // 敏感数据应该被脱敏
      expect(devLog.config?.data?.password).toBe('***');
      expect(devLog.config?.data?.token).toBe('***');
      expect(devLog.config?.data?.username).toBe('testuser');
    });

    it('生产环境的开发者日志不应该包含错误堆栈', () => {
      const config: ErrorMessageConfig = {
        environment: 'production',
        locale: 'zh-CN',
      };
      const prodGenerator = new ErrorMessageGenerator(config);

      const originalError = new Error('Test error');
      const error: ClassifiedError = {
        ...mockClassifiedError,
        originalError,
      };

      const devLog = prodGenerator.generateDeveloperLog(error);

      expect(devLog.stack).toBeUndefined();
    });

    it('生产环境的开发者日志不应该包含请求配置', () => {
      const config: ErrorMessageConfig = {
        environment: 'production',
        locale: 'zh-CN',
      };
      const prodGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
      };

      const requestConfig = {
        url: 'http://localhost:8080/api/users',
        method: 'GET',
      };

      const devLog = prodGenerator.generateDeveloperLog(error, requestConfig);

      expect(devLog.config).toBeUndefined();
    });

    it('生产环境应该简化错误消息', () => {
      const config: ErrorMessageConfig = {
        environment: 'production',
        locale: 'zh-CN',
      };
      const prodGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        message: 'Connection refused at /path/to/file.js:123\nat someFunction (file.js:456)',
      };

      const devLog = prodGenerator.generateDeveloperLog(error);

      // 生产环境应该移除堆栈跟踪和文件路径
      expect(devLog.message).not.toContain('/path/to/file.js');
      expect(devLog.message).not.toContain('someFunction');
      expect(devLog.message).not.toContain('file.js:456');
      // 应该只保留第一行的主要错误信息
      expect(devLog.message).toContain('Connection refused');
      expect(devLog.message.split('\n').length).toBe(1);
    });

    it('开发者日志应该处理没有错误代码的情况', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        code: undefined,
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.code).toBeUndefined();
      expect(devLog.type).toBeDefined();
      expect(devLog.message).toBeDefined();
    });

    it('开发者日志应该处理没有 URL 的情况', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        url: undefined,
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.url).toBeUndefined();
      expect(devLog.type).toBeDefined();
      expect(devLog.message).toBeDefined();
    });
  });

  describe('getLocalizedMessage 方法', () => {
    it('应该返回本地化的错误消息', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const zhGenerator = new ErrorMessageGenerator(config);

      const message = zhGenerator.getLocalizedMessage(NetworkErrorType.CONNECTION_REFUSED);

      expect(message).toBe('服务器未响应，请检查服务器是否启动');
    });

    it('应该支持参数替换', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const zhGenerator = new ErrorMessageGenerator(config);

      const message = zhGenerator.getLocalizedMessage(NetworkErrorType.CONNECTION_REFUSED, {
        url: 'http://localhost:8080/api/users',
      });

      expect(message).toBe('服务器未响应，请检查服务器是否启动');
    });

    it('应该处理不存在的消息键', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const zhGenerator = new ErrorMessageGenerator(config);

      const message = zhGenerator.getLocalizedMessage('INVALID_KEY' as NetworkErrorType);

      expect(message).toBe('INVALID_KEY');
    });

    it('应该在不支持的语言时回退到英文', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'fr-FR' as any, // 不支持的语言
      };
      const generator = new ErrorMessageGenerator(config);

      const message = generator.getLocalizedMessage(NetworkErrorType.CONNECTION_REFUSED);

      // 应该回退到英文
      expect(message).toBe('Server is not responding, please check if the server is running');
    });
  });

  describe('参数替换功能', () => {
    it('应该替换消息中的 URL 参数', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
        url: 'http://api.example.com/data',
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.message).toContain('http://api.example.com/data');
    });

    it('应该替换消息中的 Origin 参数', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CORS,
        url: 'http://api.example.com/data',
      };

      const userMessage = generator.generateUserMessage(error);

      expect(userMessage.message).toContain('http://localhost:3000');
    });

    it('应该处理多个相同参数的替换', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
        url: 'http://test.com',
      };

      const userMessage = devGenerator.generateUserMessage(error);

      // URL 应该在开发环境信息中出现
      const urlCount = (userMessage.message.match(/http:\/\/test\.com/g) || []).length;
      expect(urlCount).toBeGreaterThan(0);
    });

    it('应该处理 window 对象不存在的情况', () => {
      // 保存原始的 window 对象
      const originalWindow = global.window;

      // 删除 window 对象
      // @ts-ignore
      delete global.window;

      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const generator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CORS,
      };

      const userMessage = generator.generateUserMessage(error);

      // 应该使用 'unknown' 作为 origin
      expect(userMessage.message).toContain('unknown');

      // 恢复 window 对象
      global.window = originalWindow as any;
    });
  });

  describe('边界情况处理', () => {
    it('应该处理没有 apiBaseUrl 的配置', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
        // 没有 apiBaseUrl
      };
      const generator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        type: NetworkErrorType.CONNECTION_REFUSED,
      };

      const userMessage = generator.generateUserMessage(error);

      // 不应该包含 API 基础地址信息
      expect(userMessage.message).not.toContain('API 基础地址');
    });

    it('应该处理空的错误消息', () => {
      const error: ClassifiedError = {
        ...mockClassifiedError,
        message: '',
      };

      const devLog = generator.generateDeveloperLog(error);

      expect(devLog.message).toBe('');
    });

    it('应该处理非 Error 对象的 originalError', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
        originalError: 'string error',
      };

      const devLog = devGenerator.generateDeveloperLog(error);

      // 不应该有 stack 字段
      expect(devLog.stack).toBeUndefined();
    });

    it('应该处理没有 data 的请求配置', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
      };

      const requestConfig = {
        url: 'http://localhost:8080/api/users',
        method: 'GET',
        // 没有 data
      };

      const devLog = devGenerator.generateDeveloperLog(error, requestConfig);

      expect(devLog.config).toBeDefined();
      expect(devLog.config?.url).toBe('http://localhost:8080/api/users');
    });

    it('应该处理没有 headers 的请求配置', () => {
      const config: ErrorMessageConfig = {
        environment: 'development',
        locale: 'zh-CN',
      };
      const devGenerator = new ErrorMessageGenerator(config);

      const error: ClassifiedError = {
        ...mockClassifiedError,
      };

      const requestConfig = {
        url: 'http://localhost:8080/api/users',
        method: 'GET',
        // 没有 headers
      };

      const devLog = devGenerator.generateDeveloperLog(error, requestConfig);

      expect(devLog.config).toBeDefined();
      expect(devLog.config?.url).toBe('http://localhost:8080/api/users');
    });
  });
});
