# Posts List Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Completed on 2026-03-28

**Goal:** 为 `/posts` 增加可访问的文章广场首页，支持排序、标签/时间筛选、PC 分页、移动端无限滚动和 PC 侧边栏。

**Architecture:** 采用新的路由页 `src/pages/post/PostList.vue` 作为组合层，拆出筛选栏、卡片和侧边栏三个 focused 组件，并增加一个轻量 composable 统一管理断点、筛选状态和两种查询模式。数据层优先复用现有 posts/tags/ranking hooks，但会做最小必要校正：补充列表查询参数、区分分页/无限滚动 query key，并修复列表卡片拿不到标签的归一化缺口。

**Tech Stack:** Vue 3 SFC + `<script setup lang="ts">`, Vue Router 4, TanStack Vue Query, Element Plus, Vitest

---

### Task 1: 建立页面入口与路由落点

**Files:**
- Modify: `src/router/routes.ts`
- Modify: `src/layouts/DefaultLayout.vue`
- Create: `src/pages/post/PostList.vue`
- Test: `test/pages/post/PostListPage.test.ts`

- [ ] **Step 1: 写失败测试，覆盖 `/posts` 路由能挂载列表页**

```ts
it('renders the posts list page at /posts', async () => {
  await router.push('/posts');
  await router.isReady();

  const wrapper = mount(App, { global: { plugins: [router] } });
  expect(wrapper.text()).toContain('文章广场');
});
```

- [ ] **Step 2: 运行单测确认当前失败**

Run: `npm test -- test/pages/post/PostListPage.test.ts`
Expected: FAIL，因为 `/posts` 目前没有 index 页面组件。

- [ ] **Step 3: 给 `/posts` 添加 index 子路由，并让布局识别 `PostList`**

```ts
{
  path: '',
  name: 'PostList',
  component: () => import('@/pages/post/PostList.vue'),
  meta: {
    title: '文章广场',
    layout: 'default',
    showInMenu: true,
    showSidebar: false,
    icon: 'list',
    order: 2,
  },
}
```

- [ ] **Step 4: 创建最小页面壳并让测试通过**

```vue
<script setup lang="ts">
</script>

<template>
  <section class="post-list-page">
    <h1>文章广场</h1>
  </section>
</template>
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test -- test/pages/post/PostListPage.test.ts`
Expected: PASS

### Task 2: 校正列表查询参数与缓存边界

**Files:**
- Modify: `src/api/post.ts`
- Modify: `src/queries/query-keys.ts`
- Modify: `src/queries/posts/usePostsQuery.ts`
- Modify: `src/queries/posts/useInfinitePostsQuery.ts`
- Modify: `src/queries/tags/useHotTagsQuery.ts`
- Test: `src/queries/posts/posts-list-page-query.test.ts`

- [ ] **Step 1: 写失败测试，覆盖 PC/移动查询 key 不冲突、tag/time 参数可透传**

```ts
it('separates paged and infinite post list query keys', () => {
  expect(queryKeys.posts.list({ page: 1, sort: 'latest' })).not.toEqual(
    queryKeys.posts.infiniteList({ sort: 'latest' })
  );
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/queries/posts/posts-list-page-query.test.ts`
Expected: FAIL，因为当前没有 `infiniteList` key，且参数类型不包含多标签/时间范围。

- [ ] **Step 3: 扩展 `PostQueryParams` 并补 query key 工厂**

```ts
export interface PostQueryParams {
  page?: number;
  cursor?: string;
  size?: number;
  sort?: 'latest' | 'popular' | 'hot';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  tagIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}
```

- [ ] **Step 4: 让 `usePostsQuery` 与 `useInfinitePostsQuery` 使用不同 key**

```ts
list: (filters: PostQueryParams) => [...queryKeys.posts.lists(), filters] as const,
infiniteList: (filters: Omit<PostQueryParams, 'page'>) =>
  [...queryKeys.posts.lists(), 'infinite', filters] as const,
```

- [ ] **Step 5: 修正 `useHotTagsQuery` 的 key 带上参数**

```ts
queryKey: computed(() => queryKeys.tags.hot(params?.value))
```

- [ ] **Step 6: 运行测试确认通过**

Run: `npm test -- src/queries/posts/posts-list-page-query.test.ts`
Expected: PASS

### Task 3: 补齐列表页所需的 post 归一化字段

**Files:**
- Modify: `src/api/post.ts`
- Test: `test/api/post.normalize.test.ts`

- [ ] **Step 1: 写失败测试，覆盖标签和分类映射**

```ts
it('maps tags and category from backend summary when present', () => {
  const post = normalizePost(mockSummaryWithTags);
  expect(post.tags).toHaveLength(2);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- test/api/post.normalize.test.ts`
Expected: FAIL，因为当前 `normalizePost()` 固定返回 `tags: []`。

- [ ] **Step 3: 扩展 backend summary 类型并做最小映射**

```ts
tags?: Array<{ id?: string; name?: string; slug?: string }>;
categoryId?: string;
categoryName?: string;
categorySlug?: string;
```

- [ ] **Step 4: 更新 `normalizePost()` 让列表卡片能显示 tag/category**

```ts
tags: (source.tags ?? []).map(normalizeTagSummary),
category: source.categoryId
  ? normalizeCategorySummary(source)
  : undefined,
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test -- test/api/post.normalize.test.ts`
Expected: PASS

### Task 4: 实现页面状态编排 composable

**Files:**
- Create: `src/composables/usePostsListPage.ts`
- Modify: `src/pages/post/PostList.vue`
- Test: `test/composables/usePostsListPage.test.ts`

- [ ] **Step 1: 写失败测试，覆盖排序切换、断点切换、标签/时间筛选重置分页**

```ts
it('resets pc page to 1 when filters change', async () => {
  const { page, updateFilters } = usePostsListPage();
  page.value = 3;
  updateFilters({ timeRange: 'week' });
  expect(page.value).toBe(1);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- test/composables/usePostsListPage.test.ts`
Expected: FAIL，因为 composable 尚不存在。

- [ ] **Step 3: 创建 composable，集中管理以下状态**

```ts
const sort = ref<'latest' | 'popular' | 'hot'>('latest');
const tagIds = ref<string[]>([]);
const timeRange = ref<'all' | 'today' | 'week' | 'month'>('all');
const page = ref(1);
const isMobile = ref(false);
```

- [ ] **Step 4: 组合出 PC 与移动端两套查询参数**

```ts
const baseParams = computed(() => ({
  sort: sort.value,
  status: 'PUBLISHED' as const,
  tagIds: tagIds.value.length ? tagIds.value : undefined,
  ...resolveDateRange(timeRange.value),
}));
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test -- test/composables/usePostsListPage.test.ts`
Expected: PASS

### Task 5: 实现筛选栏、侧边栏和卡片组件

**Files:**
- Create: `src/components/post/PostListFilter.vue`
- Create: `src/components/post/PostListSidebar.vue`
- Create: `src/components/post/PostListCard.vue`
- Test: `test/components/post/PostListFilter.test.ts`
- Test: `test/components/post/PostListSidebar.test.ts`
- Test: `test/components/post/PostListCard.test.ts`

- [ ] **Step 1: 先写组件测试，固定交互合同**

```ts
expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
  sort: 'popular',
  tagIds: ['tag-1'],
  timeRange: 'week',
});
```

- [ ] **Step 2: 实现 `PostListFilter.vue`，只做 props/emits 和表单 UI**

```ts
defineProps<{ sort: Sort; tagIds: string[]; timeRange: TimeRange; availableTags: Tag[] }>();
defineEmits<{ change: [payload: FilterState] }>();
```

- [ ] **Step 3: 实现 `PostListSidebar.vue`，复用热门标签/创作者 hooks**

```vue
<aside v-if="!isMobile" class="post-list-sidebar">
  <section>热门标签</section>
  <section>热门创作者</section>
</aside>
```

- [ ] **Step 4: 实现 `PostListCard.vue`，覆盖有图/无图两种布局和操作事件**

```vue
<article :class="post.coverImage ? 'post-list-card--with-cover' : 'post-list-card--text-only'">
```

- [ ] **Step 5: 运行组件测试确认通过**

Run: `npm test -- test/components/post/PostListFilter.test.ts test/components/post/PostListSidebar.test.ts test/components/post/PostListCard.test.ts`
Expected: PASS

### Task 6: 组装完整页面并处理点赞/收藏、分页和无限滚动

**Files:**
- Modify: `src/pages/post/PostList.vue`
- Possibly Modify: `src/components/post/PostListCard.vue`
- Test: `test/pages/post/PostListPage.test.ts`

- [ ] **Step 1: 写失败测试，覆盖 PC 分页、移动端触底、空态和筛选刷新**

```ts
it('shows pagination on desktop and infinite loading sentinel on mobile', async () => {
  expect(wrapper.findComponent({ name: 'ElPagination' }).exists()).toBe(true);
});
```

- [ ] **Step 2: 组合页面结构，保持路由页只负责 orchestration**

```vue
<PostListFilter ... @change="handleFilterChange" />
<PostListCard v-for="post in displayPosts" :key="post.id" :post="post" />
<PostListSidebar :selected-tag-ids="tagIds" @tag-click="handleSidebarTagClick" />
```

- [ ] **Step 3: PC 走 `usePostsQuery`，移动端走 `useInfinitePostsQuery`**

```ts
const desktopQuery = usePostsQuery(desktopParams);
const mobileQuery = useInfinitePostsQuery(mobileParams);
const displayPosts = computed(() =>
  isMobile.value
    ? mobileQuery.data.value?.pages.flatMap((page) => page.items) ?? []
    : desktopQuery.data.value?.items ?? []
);
```

- [ ] **Step 4: 页面内维护本地 interaction patch，避免直接改 props**

```ts
const postOverrides = ref<Record<string, Partial<Post>>>({});
```

- [ ] **Step 5: 接入 `IntersectionObserver` 触底和 `ElPagination` 翻页**

```ts
if (entry.isIntersecting && mobileQuery.hasNextPage.value) {
  mobileQuery.fetchNextPage();
}
```

- [ ] **Step 6: 运行页面测试确认通过**

Run: `npm test -- test/pages/post/PostListPage.test.ts`
Expected: PASS

### Task 7: 最小充分验证与文档同步

**Files:**
- Modify: `docs/superpowers/plans/2026-03-28-posts-list-page.md`
- Possibly Modify: `docs/superpowers/specs/2025-01-28-posts-list-page-design.md`

- [ ] **Step 1: 运行任务相关最小验证集合**

Run: `npm test -- test/pages/post/PostListPage.test.ts test/components/post/PostListFilter.test.ts test/components/post/PostListSidebar.test.ts test/components/post/PostListCard.test.ts test/composables/usePostsListPage.test.ts test/api/post.normalize.test.ts src/queries/posts/posts-list-page-query.test.ts`
Expected: PASS

- [ ] **Step 2: 运行类型/构建校验**

Run: `npm run build:check`
Expected: PASS

- [ ] **Step 3: 同步文档结论**

```md
- 实际首版按后端现有能力透传 `tagIds/dateFrom/dateTo`
- 如果后端忽略这些参数，页面仍可访问，但相关筛选需要额外后端支持
```

- [ ] **Step 4: Commit**

```bash
git add src/router/routes.ts src/api/post.ts src/queries/query-keys.ts src/queries/posts/usePostsQuery.ts src/queries/posts/useInfinitePostsQuery.ts src/queries/tags/useHotTagsQuery.ts src/pages/post/PostList.vue src/components/post/PostListFilter.vue src/components/post/PostListSidebar.vue src/components/post/PostListCard.vue src/composables/usePostsListPage.ts test/pages/post/PostListPage.test.ts test/components/post/PostListFilter.test.ts test/components/post/PostListSidebar.test.ts test/components/post/PostListCard.test.ts test/composables/usePostsListPage.test.ts test/api/post.normalize.test.ts src/queries/posts/posts-list-page-query.test.ts docs/superpowers/specs/2025-01-28-posts-list-page-design.md docs/superpowers/plans/2026-03-28-posts-list-page.md
git commit -m "feat: add posts list landing page"
```
