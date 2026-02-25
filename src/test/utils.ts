/**
 * 测试工具函数
 * Test utility functions
 */

import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';
import type { Router } from 'vue-router';

/**
 * 创建测试用的 Pinia 实例
 * Create a Pinia instance for testing
 */
export function createTestPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

/**
 * 创建 Mock Router
 * Create a mock router
 */
export function createMockRouter(): Router {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        name: 'home',
        params: {},
        query: {},
        hash: '',
        fullPath: '/',
        matched: [],
        meta: {},
        redirectedFrom: undefined,
      },
    },
  } as unknown as Router;
}

/**
 * 等待异步操作完成
 * Wait for async operations to complete
 */
export function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * 模拟延迟
 * Mock delay
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建 Mock Axios 响应
 * Create a mock Axios response
 */
export function createMockAxiosResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

/**
 * 创建 Mock Axios 错误
 * Create a mock Axios error
 */
export function createMockAxiosError(message: string, status = 500) {
  return {
    message,
    response: {
      data: { message },
      status,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
    },
    isAxiosError: true,
  };
}
