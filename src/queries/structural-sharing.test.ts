/**
 * Structural Sharing Tests
 *
 * 测试 TanStack Query 的结构共享功能，确保未变化的数据保持相同引用。
 *
 * @module queries/structural-sharing.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin, useQuery } from '@tanstack/vue-query';
import type { Post, PaginatedResponse } from '@/types';

describe('Structural Sharing', () => {
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

  describe('Basic Structural Sharing', () => {
    it('should preserve references for unchanged data', async () => {
      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          items: [
            { id: '1', title: 'Post 1', content: 'Content 1' },
            { id: '2', title: 'Post 2', content: 'Content 2' },
          ],
          total: callCount, // 只有这个字段变化
          page: 1,
          size: 10,
          hasMore: false,
        } as PaginatedResponse<Post>);
      });

      const wrapper = mount(
        {
          setup() {
            const query = useQuery({
              queryKey: ['posts'],
              queryFn: mockFn,
            });
            return { query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待第一次查询完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstData = wrapper.vm.query.data.value;
      const firstItems = firstData?.items;

      // 触发重新获取
      await wrapper.vm.query.refetch();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondData = wrapper.vm.query.data.value;
      const secondItems = secondData?.items;

      // 验证结构共享
      expect(firstItems).toBe(secondItems); // items 数组引用相同
      expect(firstItems?.[0]).toBe(secondItems?.[0]); // 第一个 item 引用相同
      expect(firstItems?.[1]).toBe(secondItems?.[1]); // 第二个 item 引用相同
      expect(firstData?.total).not.toBe(secondData?.total); // 变化的字段不同
    });

    it('should create new references when data changes', async () => {
      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          items: [
            { id: '1', title: `Post 1 - v${callCount}`, content: 'Content 1' },
            { id: '2', title: 'Post 2', content: 'Content 2' },
          ],
          total: 2,
          page: 1,
          size: 10,
          hasMore: false,
        } as PaginatedResponse<Post>);
      });

      const wrapper = mount(
        {
          setup() {
            const query = useQuery({
              queryKey: ['posts'],
              queryFn: mockFn,
            });
            return { query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待第一次查询完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstData = wrapper.vm.query.data.value;
      const firstItems = firstData?.items;

      // 触发重新获取
      await wrapper.vm.query.refetch();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondData = wrapper.vm.query.data.value;
      const secondItems = secondData?.items;

      // 验证引用变化
      expect(firstItems).not.toBe(secondItems); // items 数组引用不同
      expect(firstItems?.[0]).not.toBe(secondItems?.[0]); // 第一个 item 引用不同（因为 title 变化）
      expect(firstItems?.[1]).toBe(secondItems?.[1]); // 第二个 item 引用相同（未变化）
    });
  });

  describe('Structural Sharing with Nested Objects', () => {
    it('should preserve nested object references', async () => {
      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          items: [
            {
              id: '1',
              title: 'Post 1',
              author: {
                id: 'author-1',
                name: 'Author 1',
              },
            },
          ],
          total: callCount, // 只有这个字段变化
        });
      });

      const wrapper = mount(
        {
          setup() {
            const query = useQuery({
              queryKey: ['posts'],
              queryFn: mockFn,
            });
            return { query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待第一次查询完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstData = wrapper.vm.query.data.value;
      const firstAuthor = firstData?.items[0]?.author;

      // 触发重新获取
      await wrapper.vm.query.refetch();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondData = wrapper.vm.query.data.value;
      const secondAuthor = secondData?.items[0]?.author;

      // 验证嵌套对象的结构共享
      expect(firstAuthor).toBe(secondAuthor); // 嵌套对象引用相同
    });
  });

  describe('Structural Sharing with Arrays', () => {
    it('should preserve array item references', async () => {
      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          items: [
            { id: '1', tags: ['tag1', 'tag2'] },
            { id: '2', tags: ['tag3', 'tag4'] },
          ],
          total: callCount,
        });
      });

      const wrapper = mount(
        {
          setup() {
            const query = useQuery({
              queryKey: ['posts'],
              queryFn: mockFn,
            });
            return { query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待第一次查询完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstData = wrapper.vm.query.data.value;
      const firstTags = firstData?.items[0]?.tags;

      // 触发重新获取
      await wrapper.vm.query.refetch();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondData = wrapper.vm.query.data.value;
      const secondTags = secondData?.items[0]?.tags;

      // 验证数组的结构共享
      expect(firstTags).toBe(secondTags); // 数组引用相同
    });
  });

  describe('Structural Sharing with Select', () => {
    it('should apply structural sharing to select results', async () => {
      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          items: [
            { id: '1', title: 'Post 1', content: 'Content 1' },
            { id: '2', title: 'Post 2', content: 'Content 2' },
          ],
          total: callCount,
        });
      });

      const wrapper = mount(
        {
          setup() {
            const query = useQuery({
              queryKey: ['posts'],
              queryFn: mockFn,
              select: (data: any) =>
                data.items.map((item: any) => ({
                  id: item.id,
                  title: item.title,
                })),
            });
            return { query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待第一次查询完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstData = wrapper.vm.query.data.value;

      // 触发重新获取
      await wrapper.vm.query.refetch();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondData = wrapper.vm.query.data.value;

      // 验证 select 结果的结构共享
      expect(firstData).toBe(secondData); // select 结果引用相同
      expect(firstData?.[0]).toBe(secondData?.[0]); // 第一个 item 引用相同
    });
  });

  describe('Disabling Structural Sharing', () => {
    it('should create new references when structural sharing is disabled', async () => {
      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          items: [
            { id: '1', title: 'Post 1' },
            { id: '2', title: 'Post 2' },
          ],
          total: callCount,
        });
      });

      const wrapper = mount(
        {
          setup() {
            const query = useQuery({
              queryKey: ['posts'],
              queryFn: mockFn,
              structuralSharing: false, // 禁用结构共享
            });
            return { query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待第一次查询完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstData = wrapper.vm.query.data.value;
      const firstItems = firstData?.items;

      // 触发重新获取
      await wrapper.vm.query.refetch();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondData = wrapper.vm.query.data.value;
      const secondItems = secondData?.items;

      // 验证引用不同（因为禁用了结构共享）
      expect(firstItems).not.toBe(secondItems);
      expect(firstItems?.[0]).not.toBe(secondItems?.[0]);
    });
  });

  describe('Performance Impact', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: `${i}`,
          title: `Post ${i}`,
          content: `Content ${i}`,
        })),
        total: 1000,
      };

      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        return Promise.resolve({
          ...largeDataset,
          total: callCount, // 只有这个字段变化
        });
      });

      const wrapper = mount(
        {
          setup() {
            const query = useQuery({
              queryKey: ['large-posts'],
              queryFn: mockFn,
            });
            return { query };
          },
          template: '<div></div>',
        },
        {
          global: {
            plugins: [[VueQueryPlugin, { queryClient }]],
          },
        }
      );

      // 等待第一次查询完成
      const startTime = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstData = wrapper.vm.query.data.value;

      // 触发重新获取
      await wrapper.vm.query.refetch();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const secondData = wrapper.vm.query.data.value;
      const endTime = performance.now();

      // 验证结构共享
      expect(firstData?.items).toBe(secondData?.items);

      // 验证性能（结构共享应该很快）
      const duration = endTime - startTime;
      console.log(`Structural sharing with 1000 items took: ${duration}ms`);
      expect(duration).toBeLessThan(1000); // 应该在 1 秒内完成
    });
  });
});
