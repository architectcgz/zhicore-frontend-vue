import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { appShellRoute } from "@/router/routes/appShellRoute";

describe("content routes", () => {
  it("renders the content detail page for post links", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute],
    });

    const resolved = router.resolve("/posts/demo");

    expect(
      resolved.matched.some((route) => route.name === "ContentDetail"),
    ).toBe(true);
  });

  it("keeps article reading public", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute],
    });

    const resolved = router.resolve("/posts/demo");
    const contentRoute = resolved.matched.find(
      (route) => route.name === "ContentDetail",
    );

    expect(contentRoute?.meta.requiresAuth).toBeUndefined();
  });
});
