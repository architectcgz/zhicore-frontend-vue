import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import HomeNotificationsRoutePage from "../HomeNotificationsRoutePage.vue";

describe("HomeNotificationsRoutePage", () => {
  it("renders local demo notifications through the notification feature owner", () => {
    const wrapper = mount(HomeNotificationsRoutePage);

    expect(wrapper.text()).toContain("通知中心");
    expect(wrapper.text()).not.toContain("本地演示");
    expect(
      wrapper.findAll(".notifications-route__item").length,
    ).toBeGreaterThan(0);
    expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
  });
});
