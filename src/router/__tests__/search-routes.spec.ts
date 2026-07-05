import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { routes } from "@/router";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}

describe("search routes", () => {
  it("registers the search route under the app shell", async () => {
    const router = createTestRouter();

    await router.push("/search?q=vue");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe("Search");
    expect(router.currentRoute.value.query.q).toBe("vue");
  });

  it("keeps explore and resources out of the search fallback route", async () => {
    const router = createTestRouter();

    await router.push("/explore");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe("Explore");

    await router.push("/resources");
    expect(router.currentRoute.value.name).toBe("Resources");
  });

  it("uses a dedicated explore page instead of reusing the home page", () => {
    const router = createTestRouter();
    const exploreRecord = router
      .getRoutes()
      .find((record) => record.name === "Explore");
    const componentLoader = String(exploreRecord?.components?.default);

    expect(componentLoader).toContain("ExploreRoutePage.vue");
    expect(componentLoader).not.toContain("HomeRoutePage.vue");
  });
});
