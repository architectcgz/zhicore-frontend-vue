import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { setupRouterGuards } from "@/router/guards";

vi.mock("@/api/auth", () => ({
  getCsrfToken: vi.fn().mockRejectedValue(new Error("No test session")),
  getProfile: vi.fn(),
  refreshSession: vi.fn(),
}));

describe("router guards", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("allows protected pages in local demo mode without restoring a real session", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/auth/login",
          name: "Login",
          component: { template: "<div />" },
        },
        {
          path: "/messages",
          name: "Messages",
          component: { template: "<div />" },
          meta: { requiresAuth: true },
        },
      ],
    });
    setupRouterGuards(router);

    await router.push("/messages");

    expect(router.currentRoute.value.name).toBe("Messages");
  });
});
