# TanStack Query 结构共享 (Structural Sharing)

## 概述

结构共享是 TanStack Query 的一个重要性能优化特性。它通过智能地比较新旧数据，只在数据真正发生变化时才触发组件重新渲染，从而减少不必要的渲染。

**Validates: Requirements 12.5**

## 什么是结构共享？

结构共享是一种优化技术，当查询数据更新时，TanStack Query 会：

1. 比较新数据和旧数据
2. 如果数据相同（深度相等），则返回旧的引用
3. 如果数据不同，则只替换变化的部分，保留未变化的部分

这样可以确保：
- 未变化的数据保持相同的引用
- 使用 `===` 比较时，未变化的数据返回 `true`
- 依赖引用比较的优化（如 React.memo、Vue computed）能够正常工作

## TanStack Query 中的结构共享

TanStack Query **默认启用**结构共享，无需额外配置。

### 默认行为

```typescript
import { useQuery } from '@tanstack/vue-query';

// 结构共享默认启用
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  // structuralSharing: true (默认值)
});
```

### 工作原理

```typescript
// 第一次查询返回
const data1 = {
  items: [
    { id: '1', title: 'Post 1' },
    { id: '2', title: 'Post 2' },
  ],
  total: 2,
};

// 第二次查询返回（只有 total 变化）
const data2 = {
  items: [
    { id: '1', title: 'Post 1' },
    { id: '2', title: 'Post 2' },
  ],
  total: 3, // 只有这个字段变化
};

// 结构共享后：
// - data2.items === data1.items (引用相同，因为内容未变化)
// - data2.items[0] === data1.items[0] (引用相同)
// - data2.items[1] === data1.items[1] (引用相同)
// - data2.total !== data1.total (值不同)
```

## 结构共享的优势

### 1. 减少不必要的重新渲染

```vue
<template>
  <div>
    <!-- 只有当 post 真正变化时才重新渲染 -->
    <PostItem
      v-for="post in posts"
      :key="post.id"
      :post="post"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});

// 由于结构共享，未变化的 post 保持相同引用
// computed 不会重新计算
const posts = computed(() => data.value?.items || []);
</script>
```

### 2. 优化 computed 和 watch

```typescript
import { computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});

// computed 只在数据真正变化时重新计算
const postTitles = computed(() => {
  console.log('Computing titles...');
  return data.value?.items.map(post => post.title) || [];
});

// watch 只在数据真正变化时触发
watch(
  () => data.value?.items,
  (newItems, oldItems) => {
    // 由于结构共享，如果 items 未变化，newItems === oldItems
    if (newItems === oldItems) {
      console.log('Items reference unchanged, skipping update');
      return;
    }
    console.log('Items changed, updating...');
  }
);
```

### 3. 与 select 选项配合

```typescript
import { useQuery } from '@tanstack/vue-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  select: (data) => data.items.map(post => ({
    id: post.id,
    title: post.title,
  })),
});

// select 的结果也会应用结构共享
// 如果转换后的数据相同，返回旧的引用
```

## 验证结构共享

### 测试代码

```typescript
import { describe, it, expect } from 'vitest';
import { QueryClient, useQuery } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';

describe('Structural Sharing', () => {
  it('should preserve references for unchanged data', async () => {
    const queryClient = new QueryClient();
    
    let callCount = 0;
    const mockFn = () => {
      callCount++;
      return Promise.resolve({
        items: [
          { id: '1', title: 'Post 1' },
          { id: '2', title: 'Post 2' },
        ],
        total: callCount, // 只有这个字段变化
      });
    };

    const wrapper = mount({
      setup() {
        const query = useQuery({
          queryKey: ['posts'],
          queryFn: mockFn,
        });
        return { query };
      },
      template: '<div></div>',
    }, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    // 等待第一次查询完成
    await new Promise(resolve => setTimeout(resolve, 100));
    const firstData = wrapper.vm.query.data.value;
    const firstItems = firstData.items;

    // 触发重新获取
    await wrapper.vm.query.refetch();
    await new Promise(resolve => setTimeout(resolve, 100));
    const secondData = wrapper.vm.query.data.value;
    const secondItems = secondData.items;

    // 验证结构共享
    expect(firstItems).toBe(secondItems); // 引用相同
    expect(firstItems[0]).toBe(secondItems[0]); // 子项引用也相同
    expect(firstData.total).not.toBe(secondData.total); // 变化的字段不同
  });
});
```

### 浏览器开发工具验证

```typescript
import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});

// 监听数据变化，打印引用信息
watch(
  () => data.value,
  (newData, oldData) => {
    if (newData && oldData) {
      console.log('Data reference changed:', newData !== oldData);
      console.log('Items reference changed:', newData.items !== oldData.items);
      
      // 检查每个 item 的引用
      newData.items.forEach((item, index) => {
        const oldItem = oldData.items[index];
        if (oldItem) {
          console.log(`Item ${index} reference changed:`, item !== oldItem);
        }
      });
    }
  }
);
```

## 禁用结构共享

在某些特殊情况下，你可能需要禁用结构共享：

```typescript
import { useQuery } from '@tanstack/vue-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  structuralSharing: false, // 禁用结构共享
});
```

### 何时禁用？

1. **数据包含不可序列化的对象**（如 Date、Map、Set）
2. **数据非常大**，结构共享的比较成本高于收益
3. **需要确保每次都是新引用**（极少见）

## 自定义结构共享函数

你可以提供自定义的结构共享函数：

```typescript
import { useQuery } from '@tanstack/vue-query';
import { replaceEqualDeep } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  structuralSharing: (oldData, newData) => {
    // 自定义比较逻辑
    if (JSON.stringify(oldData) === JSON.stringify(newData)) {
      return oldData; // 返回旧引用
    }
    return newData; // 返回新引用
  },
});
```

## 最佳实践

### 1. 保持数据结构一致

```typescript
// ✅ 好：数据结构一致
const fetchPosts = async () => {
  return {
    items: [...],
    total: 10,
    page: 1,
  };
};

// ❌ 差：数据结构不一致
const fetchPosts = async () => {
  if (someCondition) {
    return { items: [...], total: 10 };
  } else {
    return { data: [...], count: 10 }; // 结构不同
  }
};
```

### 2. 避免在 queryFn 中创建新对象

```typescript
// ❌ 差：每次都创建新的 Date 对象
const fetchPosts = async () => {
  const response = await api.get('/posts');
  return {
    ...response.data,
    fetchedAt: new Date(), // 每次都不同
  };
};

// ✅ 好：使用时间戳
const fetchPosts = async () => {
  const response = await api.get('/posts');
  return {
    ...response.data,
    fetchedAt: Date.now(), // 可以比较
  };
};
```

### 3. 配合 select 使用

```typescript
import { useQuery } from '@tanstack/vue-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  select: (data) => {
    // select 的结果也会应用结构共享
    return data.items.map(post => ({
      id: post.id,
      title: post.title,
    }));
  },
});
```

### 4. 使用 computed 优化

```typescript
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});

// computed 会利用结构共享的引用相等性
const postIds = computed(() => {
  return data.value?.items.map(post => post.id) || [];
});
```

## 性能影响

### 结构共享的成本

结构共享需要进行深度比较，这有一定的性能成本：

- **小数据**：成本可忽略，收益明显
- **中等数据**：成本和收益平衡
- **大数据**：成本可能超过收益，考虑禁用

### 性能测试

```typescript
import { useQuery } from '@tanstack/vue-query';

// 测试结构共享的性能
const testStructuralSharing = async () => {
  const startTime = performance.now();
  
  // 执行查询
  const { data } = useQuery({
    queryKey: ['large-data'],
    queryFn: fetchLargeData,
    structuralSharing: true,
  });
  
  const endTime = performance.now();
  console.log(`Structural sharing time: ${endTime - startTime}ms`);
};
```

## 总结

结构共享是 TanStack Query 的一个强大特性：

✅ **默认启用**，无需配置  
✅ **自动优化**，减少重新渲染  
✅ **配合 Vue 响应式系统**，提升性能  
✅ **与 select 选项配合**，效果更佳  

在大多数情况下，你不需要关心结构共享的细节，它会自动工作。只有在遇到性能问题或特殊需求时，才需要考虑自定义或禁用。

## 相关资源

- [TanStack Query 文档 - Structural Sharing](https://tanstack.com/query/latest/docs/react/guides/render-optimizations#structural-sharing)
- [Vue 响应式系统](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [性能优化指南](./performance-optimization.md)
