/**
 * NetworkErrorClassifier 单元测试
 *
 * 测试网络错误分类器的各种错误识别功能，包括：
 * - 连接错误识别（ERR_CONNECTION_REFUSED, ERR_CONNECTION_RESET, ECONNREFUSED）
 * - CORS 错误识别（消息包含 "CORS policy", "Access-Control-Allow-Origin"）
 * - 超时错误识别
 * - 离线错误识别
 * - 边界情况（null, undefined, 空对象）
 *
 * Requirements: 1.2, 1.3, 1.4, 2.2, 2.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NetworkErrorClassifier } from '@/utils/network-error-classifier';
import { NetworkErrorType } from '@/types/network-errors';
import type { AxiosError } from 'axios';

describe('NetworkErrorClassifier', () => {
  let classifier: NetworkErrorClassifier;

  beforeEach(() => {
    classifier = new NetworkErrorClassifier();
    // 重置 navigator.onLine 模拟
    vi.stubGlobal('navigator', { onLine: true });
  });

  describe('连接错误识别', () => {
    it('应该识别 ERR_CONNECTION_REFUSED 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_CONNECTION_REFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:8080',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CONNECTION_REFUSED);
      expect(result.code).toBe('ERR_CONNECTION_REFUSED');
      expect(result.message).toBe('connect ECONNREFUSED 127.0.0.1:8080');
      expect(result.timestamp).toBeDefined();
      expect(result.originalError).toBe(error);
    });

    it('应该识别 ERR_CONNECTION_RESET 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_CONNECTION_RESET',
        message: 'socket hang up',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CONNECTION_RESET);
      expect(result.code).toBe('ERR_CONNECTION_RESET');
    });

    it('应该识别 ECONNREFUSED 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CONNECTION_REFUSED);
      expect(result.code).toBe('ECONNREFUSED');
    });

    it('isConnectionError 应该正确识别连接错误代码', () => {
      const error1: Partial<AxiosError> = { code: 'ERR_CONNECTION_REFUSED' };
      const error2: Partial<AxiosError> = { code: 'ERR_CONNECTION_RESET' };
      const error3: Partial<AxiosError> = { code: 'ECONNREFUSED' };

      expect(classifier.isConnectionError(error1)).toBe(true);
      expect(classifier.isConnectionError(error2)).toBe(true);
      expect(classifier.isConnectionError(error3)).toBe(true);
    });

    it('isConnectionError 应该拒绝非连接错误', () => {
      const error: Partial<AxiosError> = { code: 'ERR_NETWORK' };

      expect(classifier.isConnectionError(error)).toBe(false);
    });
  });

  describe('CORS 错误识别', () => {
    it('应该识别包含 "CORS policy" 的错误消息', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error: blocked by CORS policy',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CORS);
      expect(result.message).toContain('CORS policy');
    });

    it('应该识别包含 "Access-Control-Allow-Origin" 的错误消息', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'No Access-Control-Allow-Origin header is present',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CORS);
      expect(result.message).toContain('Access-Control-Allow-Origin');
    });

    it('isCorsError 应该正确识别 CORS 错误消息', () => {
      const error1: Partial<AxiosError> = {
        message: 'blocked by CORS policy',
      };
      const error2: Partial<AxiosError> = {
        message: 'Access-Control-Allow-Origin header missing',
      };

      expect(classifier.isCorsError(error1)).toBe(true);
      expect(classifier.isCorsError(error2)).toBe(true);
    });

    it('isCorsError 应该拒绝非 CORS 错误', () => {
      const error: Partial<AxiosError> = {
        message: 'Network Error',
      };

      expect(classifier.isCorsError(error)).toBe(false);
    });

    it('不应该将连接错误误判为 CORS 错误', () => {
      // 这是一个关键测试：即使消息包含 CORS 关键词，
      // 如果是连接错误，也不应该被分类为 CORS 错误
      const error: Partial<AxiosError> = {
        code: 'ERR_CONNECTION_REFUSED',
        message: 'Connection refused - might be CORS policy issue',
      };

      const result = classifier.classifyError(error);

      // 应该被分类为连接错误，而不是 CORS 错误
      expect(result.type).toBe(NetworkErrorType.CONNECTION_REFUSED);
      expect(result.type).not.toBe(NetworkErrorType.CORS);
    });

    it('isCorsError 应该在连接错误时返回 false', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_CONNECTION_REFUSED',
        message: 'CORS policy blocked',
      };

      // 即使消息包含 CORS 关键词，连接错误应该返回 false
      expect(classifier.isCorsError(error)).toBe(false);
    });
  });

  describe('超时错误识别', () => {
    it('应该识别 ECONNABORTED 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.TIMEOUT);
      expect(result.code).toBe('ECONNABORTED');
    });

    it('应该识别 ETIMEDOUT 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ETIMEDOUT',
        message: 'Connection timed out',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.TIMEOUT);
      expect(result.code).toBe('ETIMEDOUT');
    });

    it('应该识别消息中包含 "timeout" 的错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Request timeout after 10 seconds',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.TIMEOUT);
    });

    it('应该识别大小写不敏感的 timeout 消息', () => {
      const error: Partial<AxiosError> = {
        message: 'Request TIMEOUT',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.TIMEOUT);
    });

    it('isTimeoutError 应该正确识别超时错误', () => {
      const error1: Partial<AxiosError> = { code: 'ECONNABORTED' };
      const error2: Partial<AxiosError> = { code: 'ETIMEDOUT' };
      const error3: Partial<AxiosError> = { message: 'timeout exceeded' };

      expect(classifier.isTimeoutError(error1)).toBe(true);
      expect(classifier.isTimeoutError(error2)).toBe(true);
      expect(classifier.isTimeoutError(error3)).toBe(true);
    });

    it('isTimeoutError 应该拒绝非超时错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      expect(classifier.isTimeoutError(error)).toBe(false);
    });
  });

  describe('离线错误识别', () => {
    it('应该识别浏览器离线状态', () => {
      // 模拟浏览器离线
      vi.stubGlobal('navigator', { onLine: false });

      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.OFFLINE);
    });

    it('isOfflineError 应该在离线时返回 true', () => {
      vi.stubGlobal('navigator', { onLine: false });

      expect(classifier.isOfflineError()).toBe(true);
    });

    it('isOfflineError 应该在在线时返回 false', () => {
      vi.stubGlobal('navigator', { onLine: true });

      expect(classifier.isOfflineError()).toBe(false);
    });

    it('离线状态应该优先于其他错误类型', () => {
      // 模拟离线状态
      vi.stubGlobal('navigator', { onLine: false });

      // 即使是连接错误，也应该被分类为离线错误
      const error: Partial<AxiosError> = {
        code: 'ERR_CONNECTION_REFUSED',
        message: 'Connection refused',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.OFFLINE);
    });
  });

  describe('通用网络错误识别', () => {
    it('应该识别 ERR_NETWORK 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.NETWORK_GENERIC);
    });

    it('应该识别消息中包含 "Network Error" 的错误', () => {
      const error: Partial<AxiosError> = {
        message: 'Network Error occurred',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.NETWORK_GENERIC);
    });
  });

  describe('未知错误处理', () => {
    it('应该将无法分类的错误标记为 UNKNOWN', () => {
      const error: Partial<AxiosError> = {
        code: 'SOME_UNKNOWN_CODE',
        message: 'Some unknown error',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.UNKNOWN);
    });
  });

  describe('边界情况处理', () => {
    it('应该处理 null 错误', () => {
      const result = classifier.classifyError(null);

      expect(result.type).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.originalError).toBe(null);
    });

    it('应该处理 undefined 错误', () => {
      const result = classifier.classifyError(undefined);

      expect(result.type).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.originalError).toBe(undefined);
    });

    it('应该处理空对象', () => {
      const error = {};

      const result = classifier.classifyError(error);

      expect(result.type).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.originalError).toBe(error);
    });

    it('应该处理没有 code 的错误', () => {
      const error: Partial<AxiosError> = {
        message: 'Some error without code',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBeDefined();
      expect(result.code).toBeUndefined();
      expect(result.message).toBe('Some error without code');
    });

    it('应该处理没有 message 的错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('应该处理字符串错误', () => {
      const error = 'Simple string error';

      const result = classifier.classifyError(error);

      expect(result.type).toBeDefined();
      expect(result.message).toBe('Simple string error');
      expect(result.originalError).toBe(error);
    });

    it('应该处理数字错误', () => {
      const error = 404;

      const result = classifier.classifyError(error);

      expect(result.type).toBeDefined();
      expect(result.message).toBe('404');
      expect(result.originalError).toBe(error);
    });
  });

  describe('请求配置处理', () => {
    it('应该从 config 参数提取 URL', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };
      const config = {
        url: 'https://api.example.com/users',
        method: 'GET',
      };

      const result = classifier.classifyError(error, config);

      expect(result.url).toBe('https://api.example.com/users');
    });

    it('应该从 error.config 提取 URL', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
        config: {
          url: 'https://api.example.com/posts',
        } as any,
      };

      const result = classifier.classifyError(error);

      expect(result.url).toBe('https://api.example.com/posts');
    });

    it('config 参数应该优先于 error.config', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
        config: {
          url: 'https://api.example.com/old',
        } as any,
      };
      const config = {
        url: 'https://api.example.com/new',
      };

      const result = classifier.classifyError(error, config);

      expect(result.url).toBe('https://api.example.com/new');
    });

    it('应该处理没有 URL 的情况', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      const result = classifier.classifyError(error);

      expect(result.url).toBeUndefined();
    });
  });

  describe('时间戳生成', () => {
    it('应该为每个分类的错误生成时间戳', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      const result = classifier.classifyError(error);

      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('number');
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('时间戳应该接近当前时间', () => {
      const before = Date.now();
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      const result = classifier.classifyError(error);
      const after = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('错误分类优先级', () => {
    it('离线状态应该优先于连接错误', () => {
      vi.stubGlobal('navigator', { onLine: false });

      const error: Partial<AxiosError> = {
        code: 'ERR_CONNECTION_REFUSED',
        message: 'Connection refused',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.OFFLINE);
    });

    it('连接错误应该优先于 CORS 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_CONNECTION_REFUSED',
        message: 'Connection refused - CORS policy',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CONNECTION_REFUSED);
      expect(result.type).not.toBe(NetworkErrorType.CORS);
    });

    it('超时错误应该优先于 CORS 错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ECONNABORTED',
        message: 'timeout - CORS policy',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.TIMEOUT);
      expect(result.type).not.toBe(NetworkErrorType.CORS);
    });

    it('CORS 错误应该优先于通用网络错误', () => {
      const error: Partial<AxiosError> = {
        code: 'ERR_NETWORK',
        message: 'Network Error - CORS policy blocked',
      };

      const result = classifier.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CORS);
      expect(result.type).not.toBe(NetworkErrorType.NETWORK_GENERIC);
    });
  });
});
