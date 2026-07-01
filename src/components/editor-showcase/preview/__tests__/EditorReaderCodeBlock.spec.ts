import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import EditorReaderCodeBlock from "../EditorReaderCodeBlock.vue";

describe("EditorReaderCodeBlock", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copies the code content and reports success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText,
      },
    });

    const wrapper = mount(EditorReaderCodeBlock, {
      props: {
        block: {
          type: "code",
          label: "Code",
          language: "ts",
          content: "const answer = 42;\nconsole.log(answer);",
        },
      },
    });

    await wrapper.get('[aria-label="复制代码"]').trigger("click");

    expect(writeText).toHaveBeenCalledWith(
      "const answer = 42;\nconsole.log(answer);",
    );
    expect(wrapper.get("button").text()).toBe("已复制");
  });
});
