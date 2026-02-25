/**
 * 错误处理工具属性测试
 * Property-based tests for error handler utility
 * 
 * Feature: auth-composable-improvements
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PBT_CONFIG } from '../setup';
import { getErrorMessage } from '@/utils/errorHandler';

describe('错误处理工具属性测试', () => {
  /**
   * Property 7: Error Message Extraction Consistency
   * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
   * 
   * 对于任何错误对象（axios 错误、Error 实例、字符串、未知类型），
   * getErrorMessage() 应该提取有意义的消息或返回后备消息
   * 
   * For any error object (axios error, Error instance, string, unknown),
   * getErrorMessage() should extract a meaningful message or return the fallback
   */
  it('Property 7: Error Message Extraction Consistency', () => {
    fc.assert(
      fc.property(
        // 生成各种错误格式和后备消息
        // Generate various error formats and fallback messages
        fc.oneof(
          // Axios 错误格式：{ response: { data: { message: string } } }
          fc.record({
            response: fc.record({
              data: fc.record({
                message: fc.string({ minLength: 1, maxLength: 100 }),
              }),
            }),
          }),
          // Error 实例
          fc.string({ minLength: 1, maxLength: 100 }).map(msg => new Error(msg)),
          // 字符串错误
          fc.string({ minLength: 1, maxLength: 100 }),
          // null/undefined
          fc.constantFrom(null, undefined),
          // 数字
          fc.integer(),
          // 布尔值
          fc.boolean(),
          // 空对象
          fc.constant({}),
          // 嵌套对象（但没有正确的错误结构）
          fc.record({
            someField: fc.string(),
            anotherField: fc.integer(),
          }),
        ),
        fc.string({ minLength: 1, maxLength: 50 }), // fallback message
        (error, fallback) => {
          const result = getErrorMessage(error, fallback);

          // 验证：结果必须是非空字符串
          // Verify: result must be a non-empty string
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);

          // 验证：根据错误类型，应该返回正确的消息
          // Verify: based on error type, should return correct message
          if (error && typeof error === 'object' && 'response' in error) {
            // Axios 错误格式
            const axiosError = error as { response?: { data?: { message?: string } } };
            const message = axiosError.response?.data?.message;
            if (message && message.trim().length > 0) {
              expect(result).toBe(message);
            } else {
              expect(result).toBe(fallback);
            }
          } else if (error instanceof Error) {
            // Error 实例
            const message = error.message;
            if (message && message.trim().length > 0) {
              expect(result).toBe(message);
            } else {
              expect(result).toBe(fallback);
            }
          } else if (typeof error === 'string' && error.trim().length > 0) {
            // 非空字符串（去除空白后）
            expect(result).toBe(error);
          } else {
            // 其他情况应该返回后备消息
            expect(result).toBe(fallback);
          }
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.1: Axios Error Message Extraction
   * Validates: Requirements 7.1, 7.3
   * 
   * 对于任何 axios 错误格式，应该正确提取 response.data.message
   * For any axios error format, should correctly extract response.data.message
   */
  it('Property 7.1: Axios Error Message Extraction', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // non-whitespace error message
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (errorMessage, fallback) => {
          // 创建 axios 错误格式
          const axiosError = {
            response: {
              data: {
                message: errorMessage,
              },
            },
          };

          const result = getErrorMessage(axiosError, fallback);

          // 验证：应该提取 axios 错误消息
          expect(result).toBe(errorMessage);
          // 只有当 errorMessage 和 fallback 不同时才验证它们不相等
          if (errorMessage !== fallback) {
            expect(result).not.toBe(fallback);
          }
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.2: Error Instance Message Extraction
   * Validates: Requirements 7.1, 7.4
   * 
   * 对于任何 Error 实例，应该正确提取 error.message
   * For any Error instance, should correctly extract error.message
   */
  it('Property 7.2: Error Instance Message Extraction', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // non-whitespace error message
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (errorMessage, fallback) => {
          const error = new Error(errorMessage);
          const result = getErrorMessage(error, fallback);

          // 验证：应该提取 Error 实例的消息
          expect(result).toBe(errorMessage);
          // 只有当 errorMessage 和 fallback 不同时才验证它们不相等
          if (errorMessage !== fallback) {
            expect(result).not.toBe(fallback);
          }
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.3: String Error Handling
   * Validates: Requirements 7.1
   * 
   * 对于任何字符串错误，应该直接返回该字符串
   * For any string error, should return the string directly
   */
  it('Property 7.3: String Error Handling', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // non-whitespace error string
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (errorString, fallback) => {
          const result = getErrorMessage(errorString, fallback);

          // 验证：应该返回字符串本身
          expect(result).toBe(errorString);
          // 只有当 errorString 和 fallback 不同时才验证它们不相等
          if (errorString !== fallback) {
            expect(result).not.toBe(fallback);
          }
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.4: Fallback Message for Unknown Errors
   * Validates: Requirements 7.5
   * 
   * 对于任何未知错误类型，应该返回后备消息
   * For any unknown error type, should return fallback message
   */
  it('Property 7.4: Fallback Message for Unknown Errors', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.integer(),
          fc.boolean(),
          fc.constant({}),
          fc.array(fc.string()),
          fc.record({
            randomField: fc.string(),
          }),
        ),
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (unknownError, fallback) => {
          const result = getErrorMessage(unknownError, fallback);

          // 验证：应该返回后备消息
          expect(result).toBe(fallback);
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.5: Empty String Handling
   * Validates: Requirements 7.1
   * 
   * 对于空字符串错误，应该返回后备消息
   * For empty string error, should return fallback message
   */
  it('Property 7.5: Empty String Handling', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (fallback) => {
          const result = getErrorMessage('', fallback);

          // 验证：空字符串应该返回后备消息
          expect(result).toBe(fallback);
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.5.1: Whitespace String Handling
   * Validates: Requirements 7.1, 7.5
   * 
   * 对于仅包含空白字符的字符串，应该返回后备消息
   * For whitespace-only strings, should return fallback message
   */
  it('Property 7.5.1: Whitespace String Handling', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 10 }), // whitespace string
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (whitespaceString, fallback) => {
          const result = getErrorMessage(whitespaceString, fallback);

          // 验证：空白字符串应该返回后备消息
          expect(result).toBe(fallback);
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.5.2: Whitespace in Axios Errors
   * Validates: Requirements 7.3, 7.5
   * 
   * 对于 axios 错误中的空白字符串消息，应该返回后备消息
   * For whitespace messages in axios errors, should return fallback message
   */
  it('Property 7.5.2: Whitespace in Axios Errors', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 10 }), // whitespace string
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (whitespaceString, fallback) => {
          const axiosError = {
            response: {
              data: {
                message: whitespaceString,
              },
            },
          };

          const result = getErrorMessage(axiosError, fallback);

          // 验证：空白字符串应该返回后备消息
          expect(result).toBe(fallback);
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.5.3: Whitespace in Error Instances
   * Validates: Requirements 7.4, 7.5
   * 
   * 对于 Error 实例中的空白字符串消息，应该返回后备消息
   * For whitespace messages in Error instances, should return fallback message
   */
  it('Property 7.5.3: Whitespace in Error Instances', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 10 }), // whitespace string
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (whitespaceString, fallback) => {
          const error = new Error(whitespaceString);
          const result = getErrorMessage(error, fallback);

          // 验证：空白字符串应该返回后备消息
          expect(result).toBe(fallback);
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 7.6: Nested Axios Error Handling
   * Validates: Requirements 7.3
   * 
   * 对于不完整的 axios 错误结构，应该返回后备消息
   * For incomplete axios error structure, should return fallback message
   */
  it('Property 7.6: Nested Axios Error Handling', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // fallback
        (fallback) => {
          // 测试各种不完整的 axios 错误结构
          const incompleteErrors = [
            { response: {} },
            { response: { data: {} } },
            { response: { data: { message: '' } } },
            { response: { data: { message: null } } },
            { response: { data: { message: undefined } } },
          ];

          incompleteErrors.forEach(error => {
            const result = getErrorMessage(error, fallback);
            // 不完整的结构应该返回后备消息
            expect(result).toBe(fallback);
          });
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });
});
