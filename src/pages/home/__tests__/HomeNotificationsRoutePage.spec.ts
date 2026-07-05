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

  it("filters notifications from the left category navigation", async () => {
    const wrapper = mount(HomeNotificationsRoutePage);

    await wrapper.get('button[aria-label="系统通知"]').trigger("click");

    expect(wrapper.findAll(".notifications-route__item")).toHaveLength(1);
    expect(wrapper.text()).toContain("欢迎加入知构");
    expect(wrapper.text()).not.toContain("新的互动");
  });

  it("paginates notification results", async () => {
    const wrapper = mount(HomeNotificationsRoutePage);

    expect(wrapper.findAll(".notifications-route__item")).toHaveLength(3);
    expect(wrapper.text()).toContain("第 1 / 2 页");

    await wrapper.get('button[aria-label="下一页通知"]').trigger("click");

    expect(wrapper.text()).toContain("第 2 / 2 页");
    expect(wrapper.findAll(".notifications-route__item")).toHaveLength(2);
    expect(wrapper.text()).toContain("专题收录提醒");
  });
});
