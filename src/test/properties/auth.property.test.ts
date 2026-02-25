/**
 * 认证相关属性测试
 * Property-based tests for authentication
 * 
 * Feature: blog-frontend-vue
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import * as fc from 'fast-check';
import { PBT_CONFIG } from '../setup';
import { createTestPinia } from '../utils';
import { useAuthStore } from '@/stores/auth';

describe('认证属性测试', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Property 1: Authentication State Consistency
   * Validates: Requirements 1.5, 1.8
   * 
   * 对于任何用户会话，如果本地存储中存在有效 token，则认证状态应反映用户已认证
   * For any user session, if a valid token exists in local storage, 
   * the authentication state should reflect that the user is authenticated
   */
  it('Property 1: Authentication State Consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        // 生成随机的 token 和用户数据
        // Generate random token and user data
        fc.record({
          accessToken: fc.string({ minLength: 20, maxLength: 100 }),
          refreshToken: fc.string({ minLength: 20, maxLength: 100 }),
          user: fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            email: fc.emailAddress(),
            nickname: fc.string({ minLength: 1, maxLength: 50 }),
            role: fc.constantFrom('USER', 'ADMIN'),
          }),
        }),
        async (authData) => {
          // 清理并创建新的 Pinia 实例
          // Clean up and create fresh Pinia instance
          localStorage.clear();
          const pinia = createTestPinia();
          
          // 设置 localStorage 中的 token（使用正确的键名）
          // Set token in localStorage (using correct key names)
          localStorage.setItem('zhicore-access-token', authData.accessToken);
          localStorage.setItem('zhicore-refresh-token', authData.refreshToken);
          localStorage.setItem('zhicore-user-info', JSON.stringify(authData.user));

          // 创建新的 store 实例并初始化
          // Create new store instance and initialize
          const authStore = useAuthStore(pinia);
          
          await authStore.initAuth();
          
          // 等待 Vue 响应式系统更新
          // Wait for Vue reactivity system to update
          await nextTick();

          // 验证：如果 localStorage 中有有效的 token（非空白），认证状态应该为 true
          // Verify: if valid token (non-whitespace) exists in localStorage, authentication state should be true
          const trimmedAccessToken = authData.accessToken.trim();
          const trimmedRefreshToken = authData.refreshToken.trim();
          const hasValidToken = trimmedAccessToken.length > 0 && trimmedRefreshToken.length > 0;
          const isAuthenticated = authStore.isAuthenticated;

          // 属性：有有效 token 则必须已认证
          // Property: if has valid token, must be authenticated
          if (hasValidToken) {
            expect(isAuthenticated).toBe(true);
            expect(authStore.accessToken).toBe(trimmedAccessToken);
            expect(authStore.user).toBeTruthy();
          } else {
            // 如果 token 是空白字符串，应该不认证
            // If token is whitespace, should not be authenticated
            expect(isAuthenticated).toBe(false);
          }

          // 清理
          // Cleanup
          localStorage.clear();
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 1.1: Token Expiration Consistency
   * Validates: Requirements 1.8
   * 
   * 对于任何过期的 token，认证状态应该为未认证
   * For any expired token, authentication state should be unauthenticated
   */
  it('Property 1.1: Token Expiration Consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          accessToken: fc.string({ minLength: 20, maxLength: 100 }),
          refreshToken: fc.string({ minLength: 20, maxLength: 100 }),
          expiresAt: fc.integer({ min: 0, max: Date.now() - 1000 }), // 过期时间在过去
        }),
        async (tokenData) => {
          // 清理并创建新的 Pinia 实例
          // Clean up and create fresh Pinia instance
          localStorage.clear();
          createTestPinia();
          
          // 设置过期的 token（使用正确的键名）
          localStorage.setItem('zhicore-access-token', tokenData.accessToken);
          localStorage.setItem('zhicore-refresh-token', tokenData.refreshToken);
          localStorage.setItem('zhicore-token-expires-at', tokenData.expiresAt.toString());

          const authStore = useAuthStore();
          await authStore.initAuth();

          // 验证：过期的 token 不应该导致认证状态为 true
          // Verify: expired token should not result in authenticated state
          const now = Date.now();
          const expiresAt = parseInt(localStorage.getItem('zhicore-token-expires-at') || '0');
          const isExpired = expiresAt < now;

          if (isExpired) {
            // 过期的 token 应该被清除或标记为未认证
            // Expired token should be cleared or marked as unauthenticated
            expect(authStore.isAuthenticated).toBe(false);
          }

          localStorage.clear();
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 1.2: User Data Consistency
   * Validates: Requirements 1.5
   * 
   * 对于任何用户数据，存储和检索应该保持一致
   * For any user data, storage and retrieval should be consistent
   */
  it('Property 1.2: User Data Consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 20 }),
          email: fc.emailAddress(),
          nickname: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom('USER', 'ADMIN'),
        }),
        async (userData) => {
          // 清理并创建新的 Pinia 实例
          // Clean up and create fresh Pinia instance
          localStorage.clear();
          createTestPinia();
          
          // 存储用户数据（使用正确的键名）
          localStorage.setItem('zhicore-user-info', JSON.stringify(userData));

          const authStore = useAuthStore();
          await authStore.initAuth();

          // 验证：检索的用户数据应该与存储的一致
          // Verify: retrieved user data should match stored data
          if (authStore.user) {
            expect(authStore.user.id).toBe(userData.id);
            expect(authStore.user.username).toBe(userData.username);
            expect(authStore.user.email).toBe(userData.email);
            expect(authStore.user.nickname).toBe(userData.nickname);
            expect(authStore.user.role).toBe(userData.role);
          }

          localStorage.clear();
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });
});
