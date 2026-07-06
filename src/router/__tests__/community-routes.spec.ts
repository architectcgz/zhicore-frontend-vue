import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { routes } from "@/router";
import { communityRoutes } from "@/router/routes/communityRoutes";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}

describe("community routes", () => {
  it("registers community as a dedicated app shell route", async () => {
    const router = createTestRouter();

    await router.push("/community");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe("Community");
    const componentLoader = String(communityRoutes[0]?.component);

    expect(componentLoader).toContain("CommunityRoutePage.vue");
    expect(componentLoader).not.toContain("StructureRoutePage.vue");
  });
});
