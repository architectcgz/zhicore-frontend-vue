import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";

async function mountAppLayout() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div />" },
      },
      {
        path: "/editor",
        component: { template: "<div />" },
      },
      {
        path: "/posts/demo",
        component: { template: "<div />" },
      },
      {
        path: "/ranking",
        component: { template: "<div />" },
      },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(AppLayout, {
    props: {
      logout: () => undefined,
    },
    global: {
      plugins: [router],
    },
  });
}

describe("AppLayout", () => {
  it("keeps writing in the main navigation without duplicating a write article action", async () => {
    const wrapper = await mountAppLayout();

    expect(wrapper.find(".app-layout__nav").text()).toContain("写作");
    expect(wrapper.find(".app-layout__actions").text()).not.toContain("写文章");
  });
});
