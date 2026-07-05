import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import HomeMessagesRoutePage from "../HomeMessagesRoutePage.vue";

describe("HomeMessagesRoutePage", () => {
  it("renders local demo conversations through the message feature owner", () => {
    const wrapper = mount(HomeMessagesRoutePage);

    expect(wrapper.text()).toContain("私信");
    expect(wrapper.text()).not.toContain("本地演示");
    expect(
      wrapper.findAll(".messages-route__conversation").length,
    ).toBeGreaterThan(0);
    expect(wrapper.findAll(".messages-route__message").length).toBeGreaterThan(
      0,
    );
    expect(wrapper.find("input").exists()).toBe(true);
  });
});
