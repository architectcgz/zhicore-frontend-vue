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

  it("requires login before opening private message and notification pages", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute],
    });

    const notificationsRoute = router
      .resolve("/notifications")
      .matched.find((route) => route.name === "Notifications");
    const messagesRoute = router
      .resolve("/messages")
      .matched.find((route) => route.name === "Messages");
    const messageDetailRoute = router
      .resolve("/messages/conv-lin")
      .matched.find((route) => route.name === "MessageDetail");

    expect(notificationsRoute?.meta.requiresAuth).toBe(true);
    expect(messagesRoute?.meta.requiresAuth).toBe(true);
    expect(messageDetailRoute?.meta.requiresAuth).toBe(true);
    expect(messageDetailRoute?.meta.appShellFlush).toBe(true);
  });
});
