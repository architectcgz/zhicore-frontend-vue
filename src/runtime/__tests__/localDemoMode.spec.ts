import { describe, expect, it } from "vitest";

import { isLocalDemoModeEnabled } from "../localDemoMode";

describe("isLocalDemoModeEnabled", () => {
  it("enables local demo data by default in development", () => {
    expect(isLocalDemoModeEnabled({ DEV: true })).toBe(true);
  });

  it("allows local demo data to be disabled explicitly", () => {
    expect(
      isLocalDemoModeEnabled({
        DEV: true,
        VITE_ZHICORE_LOCAL_MOCK: "false",
      }),
    ).toBe(false);
  });

  it("keeps local demo data out of production mode", () => {
    expect(isLocalDemoModeEnabled({ DEV: false })).toBe(false);
  });
});
