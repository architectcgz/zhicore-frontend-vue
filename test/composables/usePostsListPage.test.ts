import { effectScope, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePostsListPage } from '@/composables/usePostsListPage';

const usePostsQueryMock = vi.fn((params: { value?: unknown }) => ({
  data: ref({ items: [], total: 0, page: 1, size: 10, hasMore: false }),
  isLoading: ref(false),
  isFetching: ref(false),
  error: ref(null),
  params,
}));

vi.mock('@/queries/posts/usePostsQuery', () => ({
  usePostsQuery: (params: { value?: unknown }) => usePostsQueryMock(params),
}));

const useInfinitePostsQueryMock = vi.fn(() => ({
  data: ref({ pages: [] }),
  isLoading: ref(false),
  isFetching: ref(false),
  isFetchingNextPage: ref(false),
  hasNextPage: ref(false),
  error: ref(null),
  fetchNextPage: vi.fn(),
}));

vi.mock('@/queries/posts/useInfinitePostsQuery', () => ({
  useInfinitePostsQuery: () => useInfinitePostsQueryMock(),
}));

vi.mock('@/queries/tags/useHotTagsQuery', () => ({
  useHotTagsQuery: () => ({
    data: ref([]),
    isLoading: ref(false),
  }),
}));

vi.mock('@/queries/ranking/useHotCreatorsQuery', () => ({
  useHotCreatorsQuery: () => ({
    data: ref({ items: [] }),
    isLoading: ref(false),
  }),
}));

vi.mock('@/queries/posts/useLikePostMutation', () => ({
  useLikePostMutation: () => ({
    mutateAsync: vi.fn(),
  }),
}));

vi.mock('@/queries/posts/useFavoritePostMutation', () => ({
  useFavoritePostMutation: () => ({
    mutateAsync: vi.fn(),
  }),
}));

describe('usePostsListPage', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    cleanup.splice(0).forEach((stop) => stop());
  });

  it('resets desktop page to 1 when filters change', async () => {
    const scope = effectScope();
    const state = scope.run(() => usePostsListPage())!;
    cleanup.push(() => scope.stop());

    state.page.value = 3;
    state.updateFilters({
      sort: 'popular',
      tagIds: ['tag-1'],
      timeRange: 'week',
    });

    await nextTick();

    expect(state.page.value).toBe(1);
    expect(state.sort.value).toBe('popular');
    expect(state.tagIds.value).toEqual(['tag-1']);
    expect(state.timeRange.value).toBe('week');
  });

  it('uses calendar week and month boundaries for date filters', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T15:30:00.000Z'));

    const scope = effectScope();
    const state = scope.run(() => usePostsListPage())!;
    cleanup.push(() => scope.stop());

    state.updateFilters({
      sort: 'latest',
      tagIds: [],
      timeRange: 'week',
    });

    await nextTick();

    const desktopParams = usePostsQueryMock.mock.calls[0]?.[0] as
      | { value?: { dateFrom?: string } }
      | undefined;
    const weekStart = new Date(desktopParams?.value?.dateFrom ?? '');
    expect(weekStart.getFullYear()).toBe(2026);
    expect(weekStart.getMonth()).toBe(2);
    expect(weekStart.getDate()).toBe(23);
    expect(weekStart.getHours()).toBe(0);

    state.updateFilters({
      sort: 'latest',
      tagIds: [],
      timeRange: 'month',
    });

    await nextTick();

    const monthStart = new Date(desktopParams?.value?.dateFrom ?? '');
    expect(monthStart.getFullYear()).toBe(2026);
    expect(monthStart.getMonth()).toBe(2);
    expect(monthStart.getDate()).toBe(1);
    expect(monthStart.getHours()).toBe(0);
  });
});
