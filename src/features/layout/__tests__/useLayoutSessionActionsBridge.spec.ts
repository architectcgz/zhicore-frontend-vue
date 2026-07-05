import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLayoutSessionActionsBridge } from "../composables/useLayoutSessionActionsBridge";

vi.mock("@/api/auth", () => ({
  logout: vi.fn(),
}));

describe("useLayoutSessionActionsBridge", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("uses local demo login state in development without a real session", () => {
    const bridge = useLayoutSessionActionsBridge(() => undefined);

    expect(bridge.isLoggedIn.value).toBe(true);
  });
});
