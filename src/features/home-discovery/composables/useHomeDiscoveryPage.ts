import { readonly, ref } from "vue";

import { homeDiscoveryMock } from "../config/homeDiscoveryMock";

export function useHomeDiscoveryPage() {
  const activeFeedTab = ref(homeDiscoveryMock.feedTabs[0] ?? "");
  const searchQuery = ref(homeDiscoveryMock.searchInitialQuery);

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
