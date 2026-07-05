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

  it("navigates explore and resources links to the search fallback route", async () => {
    const router = createTestRouter();

    await router.push("/explore");
    await router.isReady();
    expect(router.currentRoute.value.name).toBe("Search");
    expect(router.currentRoute.value.query.source).toBe("explore");

    await router.push("/resources");
    expect(router.currentRoute.value.name).toBe("Search");
    expect(router.currentRoute.value.query.source).toBe("resources");
  });
});
