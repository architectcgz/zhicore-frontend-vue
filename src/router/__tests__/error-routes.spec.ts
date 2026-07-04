import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { appShellRoute } from "@/router/routes/appShellRoute";
import { errorRoutes } from "@/router/routes/errorRoutes";

describe("error routes", () => {
  it("renders the explicit status page for /error/:status", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute, ...errorRoutes],
    });

    const resolved = router.resolve("/error/401");

    expect(resolved.matched.some((route) => route.name === "ErrorStatus")).toBe(
      true,
    );
    expect(resolved.params.status).toBe("401");
  });

  it("renders shorthand status urls without falling through to 404", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute, ...errorRoutes],
    });

    const resolved = router.resolve("/401");

    expect(
      resolved.matched.some((route) => route.name === "ErrorStatusShorthand"),
    ).toBe(true);
    expect(resolved.params.status).toBe("401");
  });

  it("routes unknown paths to the 404 status page", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute, ...errorRoutes],
    });

    const resolved = router.resolve("/missing/topic");

    expect(resolved.matched.some((route) => route.name === "NotFound")).toBe(
      true,
    );
    expect(resolved.params.status).toBeUndefined();
  });
});
