import { describe, expect, it } from "vitest";

import { useNotificationCenterPage } from "../composables/useNotificationCenterPage";

describe("useNotificationCenterPage", () => {
  it("returns local demo notifications and unread count when mock mode is enabled", () => {
    const page = useNotificationCenterPage({ localDemoEnabled: true });

    expect(page.isLocalDemo).toBe(true);
    expect(page.unreadCount).toBeGreaterThan(0);
    expect(page.notifications.length).toBeGreaterThan(0);
    expect(page.notifications.some((item) => item.unread)).toBe(true);
  });

  it("returns an unavailable state when mock mode is disabled", () => {
    const page = useNotificationCenterPage({ localDemoEnabled: false });

    expect(page.isLocalDemo).toBe(false);
    expect(page.unreadCount).toBeNull();
    expect(page.notifications).toHaveLength(0);
  });

  it("owns category filtering and resets pagination when the category changes", () => {
    const page = useNotificationCenterPage({ localDemoEnabled: true });

    expect(page.selectedCategory.value).toBe("all");
    expect(page.paginatedNotifications.value).toHaveLength(3);
    expect(page.totalPages.value).toBe(2);

    page.goNextPage();
    expect(page.currentPage.value).toBe(2);

    page.selectCategory("system");

    expect(page.selectedCategory.value).toBe("system");
    expect(page.currentPage.value).toBe(1);
    expect(page.paginatedNotifications.value).toHaveLength(1);
    expect(page.categoryCounts.value.system).toBe(1);
    expect(
      page.paginatedNotifications.value.every((item) => item.type === "system"),
    ).toBe(true);
  });

  it("keeps notification pagination inside valid bounds", () => {
    const page = useNotificationCenterPage({ localDemoEnabled: true });

    expect(page.canGoPrevious.value).toBe(false);
    page.goPreviousPage();
    expect(page.currentPage.value).toBe(1);

    page.goNextPage();
    expect(page.currentPage.value).toBe(2);
    expect(page.canGoNext.value).toBe(false);

    page.goNextPage();
    expect(page.currentPage.value).toBe(2);
  });
});
