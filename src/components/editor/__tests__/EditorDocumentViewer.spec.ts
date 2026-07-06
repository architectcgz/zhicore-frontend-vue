import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EditorDocumentViewer from "../EditorDocumentViewer.vue";

describe("EditorDocumentViewer", () => {
  it("renders the documentation showcase shell with the editor return link", () => {
    const wrapper = mount(EditorDocumentViewer, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

    expect(wrapper.find("h1").text()).toBe("Button 组件");
    expect(wrapper.text()).toContain("工程文档");
    expect(wrapper.text()).toContain("组件规范");
    expect(wrapper.text()).toContain("Props");
    expect(wrapper.text()).toContain("发布检查");
    expect(wrapper.text()).toContain("当前版本为最新版本");

    const returnLink = wrapper.findComponent(RouterLinkStub);

    expect(returnLink.props("to")).toBe("/editor");
    expect(returnLink.text()).toContain("返回编辑器");
  });
});
