import { describe, expect, it } from "vitest";

import { useMessageCenterPage } from "../composables/useMessageCenterPage";

describe("useMessageCenterPage", () => {
  it("returns local demo conversations and unread count when mock mode is enabled", () => {
    const page = useMessageCenterPage({ localDemoEnabled: true });

    expect(page.isLocalDemo).toBe(true);
    expect(page.unreadCount).toBeGreaterThan(0);
    expect(page.conversations.length).toBeGreaterThan(0);
    expect(page.activeConversation?.messages.length).toBeGreaterThan(0);
  });

  it("returns an unavailable state when mock mode is disabled", () => {
    const page = useMessageCenterPage({ localDemoEnabled: false });

    expect(page.isLocalDemo).toBe(false);
    expect(page.unreadCount).toBeNull();
    expect(page.conversations).toHaveLength(0);
    expect(page.activeConversation).toBeNull();
  });
});
