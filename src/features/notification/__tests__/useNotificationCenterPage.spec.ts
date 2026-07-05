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
});
