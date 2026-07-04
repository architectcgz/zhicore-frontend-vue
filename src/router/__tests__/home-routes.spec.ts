import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { appShellRoute } from "@/router/routes/appShellRoute";

describe("home routes", () => {
  it("renders the home page when users open /home directly", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute],
    });

    const resolved = router.resolve("/home");

    expect(resolved.matched.some((route) => route.name === "Home")).toBe(true);
  });

  it("keeps the discovery page public", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute],
    });

    const resolved = router.resolve("/home");
    const homeRoute = resolved.matched.find((route) => route.name === "Home");

    expect(homeRoute?.meta.requiresAuth).toBeUndefined();
  });
});
