/**
 * Query Cancellation Tests
 *
 * 测试查询取消功能，确保组件卸载时正确取消查询。
 *
 * @module queries/cancellation-utils.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin, useQuery } from '@tanstack/vue-query';
import {
  useCancelQuery,
  useCancelQueries,
  useCancelOnUnmount,
  useIsQueryRunning,
  useWaitForQuery,
  useBatchCancellation,
  useQueryCancellationStatus,
} from './cancellation-utils';
import { queryKeys } from './query-keys';

describe('Query Cancellation Utils', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useCancelQuery', () => {
    it('should cancel a specific query', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const wrapper = mount(
        {
          setup() {
            const cancelQuery = useCancelQuery();
            const query = useQuery({
              queryKey: queryKeys.posts.detail('123'),
              queryFn: mockFn,
            });

            return { cancelQuery, query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待查询开始
      await nextTick();

      // 取消查询
      await wrapper.vm.cancelQuery(queryKeys.posts.detail('123'));

      // 验证查询被取消
      const queryState = queryClient.getQueryState(queryKeys.posts.detail('123'));
      expect(queryState?.fetchStatus).toBe('idle');
    });
  });

  describe('useCancelQueries', () => {
    it('should cancel all matching queries', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const wrapper = mount(
        {
          setup() {
            const cancelQueries = useCancelQueries();

            // 创建多个查询
            useQuery({
              queryKey: queryKeys.posts.detail('1'),
              queryFn: mockFn,
            });

            useQuery({
              queryKey: queryKeys.posts.detail('2'),
              queryFn: mockFn,
            });

            useQuery({
              queryKey: queryKeys.posts.detail('3'),
              queryFn: mockFn,
            });

            return { cancelQueries };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      // 取消所有文章查询
      await wrapper.vm.cancelQueries(queryKeys.posts.all);

      // 验证所有查询被取消
      const query1 = queryClient.getQueryState(queryKeys.posts.detail('1'));
      const query2 = queryClient.getQueryState(queryKeys.posts.detail('2'));
      const query3 = queryClient.getQueryState(queryKeys.posts.detail('3'));

      expect(query1?.fetchStatus).toBe('idle');
      expect(query2?.fetchStatus).toBe('idle');
      expect(query3?.fetchStatus).toBe('idle');
    });
  });

  describe('useCancelOnUnmount', () => {
    it('should cancel query when component unmounts', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const wrapper = mount(
        {
          setup() {
            const postId = ref('123');

            useQuery({
              queryKey: queryKeys.posts.detail(postId.value),
              queryFn: mockFn,
            });

            // 组件卸载时自动取消
            useCancelOnUnmount(queryKeys.posts.detail(postId.value));

            return {};
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      // 验证查询正在运行
      let queryState = queryClient.getQueryState(queryKeys.posts.detail('123'));
      expect(queryState?.fetchStatus).toBe('fetching');

      // 卸载组件
      wrapper.unmount();
      await nextTick();

      // 验证查询被取消
      queryState = queryClient.getQueryState(queryKeys.posts.detail('123'));
      expect(queryState?.fetchStatus).toBe('idle');
    });

    it('should cancel multiple queries when component unmounts', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const wrapper = mount(
        {
          setup() {
            useQuery({
              queryKey: queryKeys.posts.detail('1'),
              queryFn: mockFn,
            });

            useQuery({
              queryKey: queryKeys.comments.list('1'),
              queryFn: mockFn,
            });

            // 组件卸载时取消多个查询
            useCancelOnUnmount([
              queryKeys.posts.detail('1'),
              queryKeys.comments.list('1'),
            ]);

            return {};
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      // 卸载组件
      wrapper.unmount();
      await nextTick();

      // 验证所有查询被取消
      const postQuery = queryClient.getQueryState(queryKeys.posts.detail('1'));
      const commentQuery = queryClient.getQueryState(queryKeys.comments.list('1'));

      expect(postQuery?.fetchStatus).toBe('idle');
      expect(commentQuery?.fetchStatus).toBe('idle');
    });
  });

  describe('useIsQueryRunning', () => {
    it('should return true when query is running', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const wrapper = mount(
        {
          setup() {
            const isRunning = useIsQueryRunning();

            useQuery({
              queryKey: queryKeys.posts.detail('123'),
              queryFn: mockFn,
            });

            return { isRunning };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      // 验证查询正在运行
      const running = wrapper.vm.isRunning(queryKeys.posts.detail('123'));
      expect(running).toBe(true);
    });

    it('should return false when query is not running', () => {
      const wrapper = mount(
        {
          setup() {
            const isRunning = useIsQueryRunning();
            return { isRunning };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 验证查询未运行
      const running = wrapper.vm.isRunning(queryKeys.posts.detail('123'));
      expect(running).toBe(false);
    });
  });

  describe('useWaitForQuery', () => {
    it('should wait for query to complete', async () => {
      const mockFn = vi.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve({ id: '123' }), 100))
      );

      const wrapper = mount(
        {
          setup() {
            const waitForQuery = useWaitForQuery();

            useQuery({
              queryKey: queryKeys.posts.detail('123'),
              queryFn: mockFn,
            });

            return { waitForQuery };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      // 等待查询完成
      await wrapper.vm.waitForQuery(queryKeys.posts.detail('123'), 5000);

      // 验证查询已完成
      const queryState = queryClient.getQueryState(queryKeys.posts.detail('123'));
      expect(queryState?.status).toBe('success');
    });

    it('should timeout if query takes too long', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 5000)));

      const wrapper = mount(
        {
          setup() {
            const waitForQuery = useWaitForQuery();

            useQuery({
              queryKey: queryKeys.posts.detail('123'),
              queryFn: mockFn,
            });

            return { waitForQuery };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      // 等待查询超时
      await expect(
        wrapper.vm.waitForQuery(queryKeys.posts.detail('123'), 100)
      ).rejects.toThrow('Query timeout');
    });
  });

  describe('useBatchCancellation', () => {
    it('should cancel all added queries', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const wrapper = mount(
        {
          setup() {
            const batch = useBatchCancellation();

            useQuery({
              queryKey: queryKeys.posts.detail('1'),
              queryFn: mockFn,
            });

            useQuery({
              queryKey: queryKeys.posts.detail('2'),
              queryFn: mockFn,
            });

            // 添加到批量取消列表
            batch.addQuery(queryKeys.posts.detail('1'));
            batch.addQuery(queryKeys.posts.detail('2'));

            return { batch };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      // 批量取消
      await wrapper.vm.batch.cancelAll();

      // 验证所有查询被取消
      const query1 = queryClient.getQueryState(queryKeys.posts.detail('1'));
      const query2 = queryClient.getQueryState(queryKeys.posts.detail('2'));

      expect(query1?.fetchStatus).toBe('idle');
      expect(query2?.fetchStatus).toBe('idle');
    });

    it('should track query count', () => {
      const wrapper = mount(
        {
          setup() {
            const batch = useBatchCancellation();

            batch.addQuery(queryKeys.posts.detail('1'));
            batch.addQuery(queryKeys.posts.detail('2'));
            batch.addQuery(queryKeys.posts.detail('3'));

            return { batch };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      expect(wrapper.vm.batch.size()).toBe(3);

      wrapper.vm.batch.removeQuery(queryKeys.posts.detail('1'));
      expect(wrapper.vm.batch.size()).toBe(2);

      wrapper.vm.batch.clear();
      expect(wrapper.vm.batch.size()).toBe(0);
    });
  });

  describe('useQueryCancellationStatus', () => {
    it('should return correct status for running query', async () => {
      const mockFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const wrapper = mount(
        {
          setup() {
            const getStatus = useQueryCancellationStatus();

            useQuery({
              queryKey: queryKeys.posts.detail('123'),
              queryFn: mockFn,
            });

            return { getStatus };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      await nextTick();

      const status = wrapper.vm.getStatus(queryKeys.posts.detail('123'));
      expect(status.isRunning).toBe(true);
      expect(status.isCancelled).toBe(false);
      expect(status.isCompleted).toBe(false);
    });

    it('should return correct status for completed query', async () => {
      const mockFn = vi.fn(() => Promise.resolve({ id: '123' }));

      const wrapper = mount(
        {
          setup() {
            const getStatus = useQueryCancellationStatus();

            useQuery({
              queryKey: queryKeys.posts.detail('123'),
              queryFn: mockFn,
            });

            return { getStatus };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待查询完成
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = wrapper.vm.getStatus(queryKeys.posts.detail('123'));
      expect(status.isRunning).toBe(false);
      expect(status.isCancelled).toBe(false);
      expect(status.isCompleted).toBe(true);
    });
  });
});
