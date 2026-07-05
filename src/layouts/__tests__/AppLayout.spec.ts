import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";

async function mountAppLayout() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/editor", component: { template: "<div />" } },
      { path: "/explore", component: { template: "<div />" } },
      { path: "/structure", component: { template: "<div />" } },
      { path: "/resources", component: { template: "<div />" } },
      { path: "/about", component: { template: "<div />" } },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(AppLayout, {
    props: {
      isLoggedIn: true,
      logout: () => undefined,
    },
    global: {
      plugins: [router],
    },
  });
}

describe("AppLayout", () => {
  it("mounts successfully with the new design", async () => {
    const wrapper = await mountAppLayout();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".app-layout__nav").text()).toContain("发现");
    expect(wrapper.find(".app-layout__post-btn").text()).toContain("写作");
  });
});
