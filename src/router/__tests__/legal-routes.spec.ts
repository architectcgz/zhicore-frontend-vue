import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { appShellRoute } from "@/router/routes/appShellRoute";

describe("legal routes", () => {
  it("exposes privacy policy and terms pages as public app shell routes", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute],
    });

    const privacyRoute = router
      .resolve("/legal/privacy")
      .matched.find((route) => route.name === "PrivacyPolicy");
    const termsRoute = router
      .resolve("/legal/terms")
      .matched.find((route) => route.name === "TermsOfService");

    expect(privacyRoute).toBeDefined();
    expect(termsRoute).toBeDefined();
    expect(privacyRoute?.meta.requiresAuth).toBeUndefined();
    expect(termsRoute?.meta.requiresAuth).toBeUndefined();
  });
});
