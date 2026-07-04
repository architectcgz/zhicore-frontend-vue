import { readonly, ref } from "vue";

import { homeDiscoveryMock } from "../config/homeDiscoveryMock";

export function useHomeDiscoveryPage() {
  const activeFeedTab = ref(homeDiscoveryMock.feedTabs[0] ?? "");
  // 搜索提示是占位文案，不进入状态，避免初始态被误判为已有查询。
  const searchQuery = ref("");

  function selectFeedTab(tab: string): void {
    if (!homeDiscoveryMock.feedTabs.includes(tab)) {
      return;
    }

    activeFeedTab.value = tab;
  }

  function updateSearchQuery(nextQuery: string): void {
    searchQuery.value = nextQuery;
  }

  return {
    discovery: homeDiscoveryMock,
    activeFeedTab: readonly(activeFeedTab),
    searchQuery: readonly(searchQuery),
    selectFeedTab,
    updateSearchQuery,
  };
}
