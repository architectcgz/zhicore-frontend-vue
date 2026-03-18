# 查询特定缓存配置指南

本文档说明如何为特殊查询提供自定义缓存选项，以及何时需要这样做。

## 何时使用自定义缓存配置

虽然我们在 `query-config.ts` 中定义了标准的缓存配置，但某些特殊场景可能需要自定义配置：

### 1. 实时性要求极高的数据

**场景**: 股票价格、在线用户数、实时聊天消息

**配置**: 极短的 staleTime（甚至 0）+ refetchInterval

```typescript
export function useLiveUserCountQuery() {
  return useQuery({
    queryKey: ['liveUserCount'],
    queryFn: () => api.getLiveUserCount(),
    staleTime: 0, // 数据立即过期
    refetchInterval: 5000, // 每 5 秒自动刷新
    refetchIntervalInBackground: true, // 后台也刷新
  });
}
```

### 2. 静态或很少变化的数据

**场景**: 系统配置、国家列表、分类列表

**配置**: 极长的 staleTime + gcTime

```typescript
export function useSystemConfigQuery() {
  return useQuery({
    queryKey: ['systemConfig'],
    queryFn: () => api.getSystemConfig(),
    staleTime: Infinity, // 永不过期
    gcTime: 24 * 60 * 60 * 1000, // 24 小时
  });
}
```

### 3. 大数据量查询

**场景**: 大型报表、数据导出预览

**配置**: 较长的 staleTime + 较短的 gcTime（节省内存）

```typescript
export function useLargeReportQuery(reportId: string) {
  return useQuery({
    queryKey: ['largeReport', reportId],
    queryFn: () => api.getLargeReport(reportId),
    staleTime: 10 * 60 * 1000, // 10 分钟
    gcTime: 5 * 60 * 1000, // 5 分钟（比 staleTime 短，节省内存）
  });
}
```

### 4. 用户特定的敏感数据

**场景**: 用户的私密信息、草稿

**配置**: 较短的 staleTime + 禁用后台刷新

```typescript
export function useUserPrivateDataQuery() {
  return useQuery({
    queryKey: ['userPrivateData'],
    queryFn: () => api.getUserPrivateData(),
    staleTime: 2 * 60 * 1000, // 2 分钟
    refetchOnWindowFocus: false, // 不在窗口焦点时刷新
    refetchOnReconnect: false, // 不在网络重连时刷新
  });
}
```

### 5. 条件查询

**场景**: 依赖其他数据的查询

**配置**: 使用 enabled 选项控制查询执行

```typescript
export function useUserPostsQuery(userId: Ref<string | null>) {
  return useQuery({
    queryKey: computed(() => ['userPosts', userId.value]),
    queryFn: () => api.getUserPosts(userId.value!),
    enabled: computed(() => !!userId.value), // 只有当 userId 存在时才执行
    ...CACHE_TIMES.POST_LIST,
  });
}
```

## 使用 createCacheConfig 辅助函数

对于需要自定义时间但不需要其他特殊配置的查询，使用 `createCacheConfig` 函数：

```typescript
import { createCacheConfig } from '../query-config';

export function useCustomQuery() {
  return useQuery({
    queryKey: ['customData'],
    queryFn: () => api.getCustomData(),
    ...createCacheConfig(3, 15), // staleTime: 3分钟, gcTime: 15分钟
  });
}
```

## 覆盖默认配置

如果需要覆盖标准配置中的某个选项，可以在展开后覆盖：

```typescript
export function useSpecialPostQuery(postId: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postApi.getPostById(postId),
    ...CACHE_TIMES.POST_CONTENT, // 使用标准配置
    refetchOnWindowFocus: false, // 但禁用窗口焦点刷新
  });
}
```

## 自定义配置决策树

```
需要自定义缓存配置？
│
├─ 是否需要实时数据？
│  ├─ 是 → staleTime: 0 + refetchInterval
│  └─ 否 → 继续
│
├─ 数据是否很少变化？
│  ├─ 是 → staleTime: Infinity 或很长时间
│  └─ 否 → 继续
│
├─ 数据量是否很大？
│  ├─ 是 → 较短的 gcTime
│  └─ 否 → 继续
│
├─ 是否是敏感数据？
│  ├─ 是 → 禁用后台刷新
│  └─ 否 → 继续
│
└─ 使用标准配置
```

## 实际应用示例

### 示例 1: 草稿自动保存查询

草稿需要频繁更新，但不需要后台刷新：

```typescript
export function useDraftQuery(draftId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['draft', draftId.value]),
    queryFn: () => draftApi.getDraft(draftId.value),
    enabled: computed(() => !!draftId.value),
    staleTime: 30 * 1000, // 30 秒（草稿可能频繁变化）
    gcTime: 5 * 60 * 1000, // 5 分钟
    refetchOnWindowFocus: false, // 不自动刷新（避免覆盖用户编辑）
    refetchOnReconnect: false,
  });
}
```

### 示例 2: 搜索建议查询

搜索建议需要快速响应，但可以容忍稍旧的数据：

```typescript
export function useSearchSuggestionsQuery(query: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['searchSuggestions', query.value]),
    queryFn: () => searchApi.getSuggestions(query.value, 10),
    enabled: computed(() => query.value.length >= 2), // 至少 2 个字符
    staleTime: 5 * 60 * 1000, // 5 分钟（建议不需要太实时）
    gcTime: 10 * 60 * 1000, // 10 分钟
    // 使用 select 只提取需要的数据
    select: (data) => data.slice(0, 10), // 只取前 10 条
  });
}
```

### 示例 3: 管理员实时监控查询

管理员需要实时监控系统状态：

```typescript
export function useAdminSystemStatusQuery() {
  return useQuery({
    queryKey: ['adminSystemStatus'],
    queryFn: () => adminApi.getSystemStatus(),
    staleTime: 0, // 立即过期
    refetchInterval: 10 * 1000, // 每 10 秒刷新
    refetchIntervalInBackground: true, // 后台也刷新
    // 只在管理员页面激活时刷新
    enabled: computed(() => route.path.startsWith('/admin')),
  });
}
```

### 示例 4: 分页数据预取

为了提升用户体验，预取下一页数据：

```typescript
export function usePostsWithPrefetch(page: Ref<number>) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: computed(() => queryKeys.posts.list({ page: page.value })),
    queryFn: () => postApi.getPosts({ page: page.value }),
    ...CACHE_TIMES.POST_LIST,
  });
  
  // 预取下一页
  watch(
    () => page.value,
    (currentPage) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.posts.list({ page: currentPage + 1 }),
        queryFn: () => postApi.getPosts({ page: currentPage + 1 }),
        staleTime: CACHE_TIMES.POST_LIST.staleTime,
      });
    }
  );
  
  return query;
}
```

### 示例 5: 依赖查询链

当一个查询依赖另一个查询的结果：

```typescript
// 第一个查询：获取用户信息
export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => userApi.getUser(userId),
    ...CACHE_TIMES.USER_INFO,
  });
}

// 第二个查询：依赖用户信息
export function useUserPostsQuery(userId: string) {
  const { data: user } = useUserQuery(userId);
  
  return useQuery({
    queryKey: computed(() => ['userPosts', userId]),
    queryFn: () => postApi.getUserPosts(userId),
    // 只有当用户数据加载完成且用户存在时才执行
    enabled: computed(() => !!user.value),
    ...CACHE_TIMES.POST_LIST,
  });
}
```

## 配置选项参考

### 常用缓存选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `staleTime` | number | 0 | 数据新鲜度时间（毫秒） |
| `gcTime` | number | 5分钟 | 垃圾回收时间（毫秒） |
| `refetchOnWindowFocus` | boolean | true | 窗口获得焦点时重新获取 |
| `refetchOnReconnect` | boolean | true | 网络重连时重新获取 |
| `refetchInterval` | number \| false | false | 自动刷新间隔（毫秒） |
| `refetchIntervalInBackground` | boolean | false | 后台也自动刷新 |
| `enabled` | boolean | true | 是否启用查询 |
| `retry` | number \| boolean | 3 | 重试次数 |
| `retryDelay` | number \| function | 指数退避 | 重试延迟 |
| `select` | function | - | 数据转换函数 |
| `placeholderData` | any | - | 占位数据 |

### 性能优化选项

```typescript
// 使用 select 减少重新渲染
export function usePostTitleQuery(postId: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postApi.getPostById(postId),
    select: (post) => post.title, // 只返回标题
    ...CACHE_TIMES.POST_CONTENT,
  });
}

// 使用 placeholderData 提供即时加载状态
export function usePostsWithPlaceholder(page: number) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.posts.list({ page }),
    queryFn: () => postApi.getPosts({ page }),
    placeholderData: () => {
      // 使用上一页的数据作为占位
      return queryClient.getQueryData(
        queryKeys.posts.list({ page: page - 1 })
      );
    },
    ...CACHE_TIMES.POST_LIST,
  });
}
```

## 配置验证清单

在实现自定义缓存配置时，检查以下问题：

- [ ] 是否真的需要自定义配置？（标准配置是否足够？）
- [ ] staleTime 和 gcTime 的关系是否合理？（gcTime >= staleTime）
- [ ] 是否考虑了内存使用？（大数据量查询使用较短的 gcTime）
- [ ] 是否考虑了用户体验？（实时性 vs 性能）
- [ ] 是否考虑了网络流量？（避免过于频繁的刷新）
- [ ] 是否正确使用了 enabled 选项？（避免不必要的请求）
- [ ] 是否文档化了配置决策？（为什么使用这些值？）

## 配置决策文档模板

在实现自定义配置时，建议添加注释说明决策原因：

```typescript
/**
 * 获取实时在线用户数
 * 
 * 缓存配置决策：
 * - staleTime: 0 - 需要实时数据
 * - refetchInterval: 5000 - 每 5 秒刷新一次
 * - refetchIntervalInBackground: true - 后台也需要更新
 * 
 * 原因：管理员需要实时监控在线用户数，5 秒的刷新间隔
 * 在实时性和服务器负载之间取得平衡。
 */
export function useLiveOnlineUsersQuery() {
  return useQuery({
    queryKey: ['liveOnlineUsers'],
    queryFn: () => adminApi.getOnlineUsers(),
    staleTime: 0,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}
```

## 相关文档

- [缓存配置](./query-config.ts) - 标准缓存配置
- [缓存失效策略](./CACHE_INVALIDATION.md) - 缓存失效规则
- [TanStack Query 文档](https://tanstack.com/query/latest/docs/vue/guides/important-defaults)
