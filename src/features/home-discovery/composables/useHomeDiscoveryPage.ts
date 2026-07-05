import { readonly, ref } from "vue";

import { homeDiscoveryMock } from "../config/homeDiscoveryMock";

export function useHomeDiscoveryPage() {
  const activeContentCategory = ref(
    homeDiscoveryMock.contentCategories[0] ?? "",
  );
  // 搜索提示是占位文案，不进入状态，避免初始态被误判为已有查询。
  const searchQuery = ref("");

  function selectContentCategory(category: string): void {
    // 分类只能来自服务端/配置给出的候选，避免组件发出脏值后进入不可恢复筛选态。
    if (!homeDiscoveryMock.contentCategories.includes(category)) {
      return;
    }

    activeContentCategory.value = category;
  }

  function updateSearchQuery(nextQuery: string): void {
    searchQuery.value = nextQuery;
  }

  return {
    discovery: homeDiscoveryMock,
    activeContentCategory: readonly(activeContentCategory),
    searchQuery: readonly(searchQuery),
    selectContentCategory,
    updateSearchQuery,
  };
}
