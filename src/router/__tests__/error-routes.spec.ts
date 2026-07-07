import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "@/App.vue";
import { routes } from "@/router";
import { appShellRoute } from "@/router/routes/appShellRoute";

describe("error routes", () => {
  it("renders the explicit status page for /error/:status", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [appShellRoute],
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
      routes: [appShellRoute],
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
      routes: [appShellRoute],
    });

    const resolved = router.resolve("/missing/topic");

    expect(resolved.matched.some((route) => route.name === "NotFound")).toBe(
      true,
    );
    expect(resolved.params.status).toBeUndefined();
  });

  it("renders status pages inside the shared app layout header", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    await router.push("/error/401");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    });
    await flushPromises();

    expect(wrapper.find(".app-layout__header").exists()).toBe(true);
    expect(wrapper.find(".status-page__header").exists()).toBe(false);
    expect(wrapper.find(".status-page").text()).toContain("未授权访问");
  });
});
