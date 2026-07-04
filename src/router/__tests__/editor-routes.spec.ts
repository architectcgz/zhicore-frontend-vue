import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "@/App.vue";
import { routes } from "@/router";

describe("editor route", () => {
  it("renders the existing editor workspace at /editor", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });
    const pinia = createPinia();

    await router.push("/editor");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    });

    expect(wrapper.find(".editor-workspace").exists()).toBe(true);
  });
});
