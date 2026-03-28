import { describe, expect, it } from 'vitest';
import { queryKeys } from '@/queries/query-keys';

describe('posts list page query keys', () => {
  it('separates paged and infinite post list keys', () => {
    expect(
      queryKeys.posts.list({ page: 1, size: 10, sort: 'latest' }),
    ).not.toEqual(
      queryKeys.posts.infiniteList({ size: 10, sort: 'latest' }),
    );
  });

  it('includes params in hot tags query key', () => {
    expect(
      queryKeys.tags.hot({ limit: 8, period: 'week' }),
    ).not.toEqual(
      queryKeys.tags.hot({ limit: 20, period: 'month' }),
    );
  });
});
