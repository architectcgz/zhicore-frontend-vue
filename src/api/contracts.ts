import type { PaginatedResponse } from '@/types';

export interface BackendPageResult<T> {
  current?: number;
  page?: number;
  size?: number;
  total?: number;
  pages?: number;
  records?: T[];
  items?: T[];
  list?: T[];
  hasNext?: boolean;
  hasMore?: boolean;
  cursor?: string | null;
}

export interface BackendHybridPageResult<T> extends BackendPageResult<T> {}

export function getBackendPageItems<T>(pageResult: BackendPageResult<T>): T[] {
  return pageResult.records ?? pageResult.items ?? pageResult.list ?? [];
}

export function normalizePageResponse<TSource, TTarget>(
  pageResult: BackendPageResult<TSource>,
  mapper: (item: TSource) => TTarget
): PaginatedResponse<TTarget> {
  const items = getBackendPageItems(pageResult).map(mapper);
  const page = pageResult.current ?? pageResult.page ?? 0;
  const size = pageResult.size ?? items.length;
  const total = pageResult.total ?? items.length;
  const hasMore = pageResult.hasNext ?? pageResult.hasMore ?? (
    typeof pageResult.pages === 'number' ? page + 1 < pageResult.pages : items.length >= size
  );

  return {
    items,
    total,
    page,
    size,
    hasMore,
    cursor: pageResult.cursor ?? null,
  };
}
