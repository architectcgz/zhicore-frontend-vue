/**
 * NetworkErrorClassifier 属性测试
 *
 * 使用 fast-check 进行基于属性的测试，验证错误分类系统的通用正确性属性。
 * 每个测试运行至少 100 次迭代，使用随机生成的输入来验证属性。
 *
 * Feature: blog-frontend-network-error-handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { NetworkErrorClassifier } from '@/utils/network-error-classifier';
import { NetworkErrorType } from '@/types/network-errors';
import type { AxiosError } from 'axios';

describe('NetworkErrorClassifier - Property Tests', () => {
  let classifier: NetworkErrorClassifier;

  beforeEach(() => {
    classifier = new NetworkErrorClassifier();
    // 确保浏览器在线状态，避免所有错误都被分类为 OFFLINE
    vi.stubGlobal('navigator', { onLine: true });
  });

  describe('Property 1: 错误分类互斥性', () => {
    /**
     * Feature: blog-frontend-network-error-handling, Property 1: 错误分类互斥性
     *
     * 验证：
     * 1. 每个错误都被分配到恰好一个 NetworkErrorType
     * 2. 连接错误永远不会被分类为 CORS 错误
     *
     * Validates: Requirements 1.1, 1.5, 2.5
     */
    it('应该将每个错误分配到恰好一个错误类型', () => {
      // 生成各种可能的错误对象
      const errorArbitrary = fc.record({
        code: fc.oneof(
          // 连接错误代码
          fc.constant('ERR_CONNECTION_REFUSED'),
          fc.constant('ERR_CONNECTION_RESET'),
          fc.constant('ECONNREFUSED'),
          // 超时错误代码
          fc.constant('ECONNABORTED'),
          fc.constant('ETIMEDOUT'),
          // 通用网络错误代码
          fc.constant('ERR_NETWORK'),
          // 其他随机代码
          fc.string({ minLength: 1, maxLength: 20 })
        ),
        message: fc.oneof(
          // CORS 相关消息
          fc.constant('blocked by CORS policy'),
          fc.constant('No Access-Control-Allow-Origin header'),
          fc.constant('CORS policy: No Access-Control-Allow-Origin'),
          // 超时相关消息
          fc.constant('timeout of 5000ms exceeded'),
          fc.constant('Request timeout'),
          fc.constant('Connection TIMEOUT'),
          // 连接相关消息
          fc.constant('connect ECONNREFUSED'),
          fc.constant('Connection refused'),
          fc.constant('socket hang up'),
          // 通用网络错误消息
          fc.constant('Network Error'),
          fc.constant('Network Error occurred'),
          // 随机消息
          fc.string({ minLength: 1, maxLength: 100 })
        ),
      });

      fc.assert(
        fc.property(errorArbitrary, (error) => {
          const result = classifier.classifyError(error);

          // 验证 1: 错误必须被分配到一个有效的错误类型
          expect(result.type).toBeDefined();
          expect(Object.values(NetworkErrorType)).toContain(result.type);

          // 验证 2: 连接错误永远不应该被分类为 CORS 错误
          const isConnectionError = classifier.isConnectionError(error);
          if (isConnectionError) {
            expect(result.type).not.toBe(NetworkErrorType.CORS);
            // 连接错误应该被分类为 CONNECTION_REFUSED 或 CONNECTION_RESET
            expect([
              NetworkErrorType.CONNECTION_REFUSED,
              NetworkErrorType.CONNECTION_RESET,
            ]).toContain(result.type);
          }

          // 验证 3: 如果错误被分类为 CORS，它不应该是连接错误
          if (result.type === NetworkErrorType.CORS) {
            expect(isConnectionError).toBe(false);
          }

          // 验证 4: 分类结果应该包含必需的字段
          expect(result.originalError).toBe(error);
          expect(result.timestamp).toBeDefined();
          expect(typeof result.timestamp).toBe('number');
          expect(result.message).toBeDefined();

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('连接错误代码应该始终优先于 CORS 消息', () => {
      // 生成具有连接错误代码和 CORS 消息的错误对象
      const connectionErrorCodeArbitrary = fc.constantFrom(
        'ERR_CONNECTION_REFUSED',
        'ERR_CONNECTION_RESET',
        'ECONNREFUSED'
      );

      const corsMessageArbitrary = fc.constantFrom(
        'blocked by CORS policy',
        'No Access-Control-Allow-Origin header',
        'CORS policy: No Access-Control-Allow-Origin',
        'Access-Control-Allow-Origin missing'
      );

      fc.assert(
        fc.property(
          connectionErrorCodeArbitrary,
          corsMessageArbitrary,
          (code, message) => {
            const error: Partial<AxiosError> = {
              code,
              message,
            };

            const result = classifier.classifyError(error);

            // 即使消息包含 CORS 关键词，连接错误代码应该优先
            expect(result.type).not.toBe(NetworkErrorType.CORS);
            expect([
              NetworkErrorType.CONNECTION_REFUSED,
              NetworkErrorType.CONNECTION_RESET,
            ]).toContain(result.type);

            // isCorsError 方法应该返回 false
            expect(classifier.isCorsError(error)).toBe(false);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('每个错误类型应该是互斥的', () => {
      // 生成各种错误对象
      const errorArbitrary = fc.record({
        code: fc.option(
          fc.oneof(
            fc.constant('ERR_CONNECTION_REFUSED'),
            fc.constant('ERR_CONNECTION_RESET'),
            fc.constant('ECONNREFUSED'),
            fc.constant('ECONNABORTED'),
            fc.constant('ETIMEDOUT'),
            fc.constant('ERR_NETWORK'),
            fc.string()
          ),
          { nil: undefined }
        ),
        message: fc.string({ minLength: 0, maxLength: 200 }),
      });

      fc.assert(
        fc.property(errorArbitrary, (error) => {
          const result = classifier.classifyError(error);

          // 计算错误匹配的类型数量
          let matchCount = 0;

          if (classifier.isConnectionError(error)) matchCount++;
          if (classifier.isCorsError(error)) matchCount++;
          if (classifier.isTimeoutError(error)) matchCount++;

          // 一个错误最多只能匹配一个特定类型
          // （注意：isOfflineError 检查的是浏览器状态，不是错误本身）
          expect(matchCount).toBeLessThanOrEqual(1);

          // 如果匹配了某个类型，分类结果应该反映这一点
          if (classifier.isConnectionError(error)) {
            expect([
              NetworkErrorType.CONNECTION_REFUSED,
              NetworkErrorType.CONNECTION_RESET,
            ]).toContain(result.type);
          }

          if (classifier.isCorsError(error)) {
            expect(result.type).toBe(NetworkErrorType.CORS);
          }

          if (classifier.isTimeoutError(error)) {
            expect(result.type).toBe(NetworkErrorType.TIMEOUT);
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('分类结果应该是确定性的', () => {
      // 对于相同的输入，应该产生相同的分类结果
      const errorArbitrary = fc.record({
        code: fc.option(fc.string(), { nil: undefined }),
        message: fc.string(),
      });

      fc.assert(
        fc.property(errorArbitrary, (error) => {
          const result1 = classifier.classifyError(error);
          const result2 = classifier.classifyError(error);

          // 相同的错误应该被分类为相同的类型
          expect(result1.type).toBe(result2.type);
          expect(result1.code).toBe(result2.code);
          expect(result1.message).toBe(result2.message);
          expect(result1.url).toBe(result2.url);

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('所有错误都应该被分类到有效的错误类型', () => {
      // 生成各种可能的错误输入，包括边界情况
      const errorArbitrary = fc.oneof(
        // 标准错误对象
        fc.record({
          code: fc.option(fc.string(), { nil: undefined }),
          message: fc.option(fc.string(), { nil: undefined }),
        }),
        // 空对象
        fc.constant({}),
        // 字符串
        fc.string(),
        // 数字
        fc.integer(),
        // null
        fc.constant(null),
        // undefined
        fc.constant(undefined)
      );

      fc.assert(
        fc.property(errorArbitrary, (error) => {
          const result = classifier.classifyError(error);

          // 所有错误都应该被分类到一个有效的类型
          expect(result.type).toBeDefined();
          expect(Object.values(NetworkErrorType)).toContain(result.type);

          // 结果应该包含必需的字段
          expect(result.originalError).toBe(error);
          expect(result.timestamp).toBeDefined();
          expect(result.message).toBeDefined();

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
