import { mount } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import LoginRoutePage from "../LoginRoutePage.vue";

async function mountLoginRoutePage(path = "/auth/login") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/auth/login", name: "Login", component: LoginRoutePage },
      { path: "/auth/register", name: "Register", component: LoginRoutePage },
    ],
  });
  await router.push(path);
  await router.isReady();

  return mount(LoginRoutePage, {
    global: {
      plugins: [createPinia(), router],
    },
  });
}

describe("LoginRoutePage", () => {
  it("renders the auth workspace and switches to register mode", async () => {
    const wrapper = await mountLoginRoutePage();

    expect(wrapper.get("h1").text()).toBe("欢迎回来");

    await wrapper.get(".auth-card__switch button").trigger("click");
    await flushPromises();

    expect(wrapper.get("h1").text()).toBe("创建账号");
  });
});
