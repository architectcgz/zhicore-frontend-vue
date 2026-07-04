import { describe, expect, it } from "vitest";

import { contentDetailResponseMock } from "../config/contentDetailResponseMock";
import { mapContentDetailResponse } from "../lib/contentDetailResponseMapper";

describe("mapContentDetailResponse", () => {
  it("maps existing backend DTOs into the UI detail contract", () => {
    const detail = mapContentDetailResponse(contentDetailResponseMock);

    expect(detail.tocItems).toEqual([
      { label: "请求事实层", href: "#heading-1" },
      { label: "主资源优先", href: "#heading-2" },
      { label: "互动状态降级", href: "#heading-3" },
      { label: "写路径确认", href: "#heading-4" },
    ]);
    expect(detail.activeTocLabel).toBe("请求事实层");
    expect(detail.bodyBlocks[0]).toEqual({
      id: "heading-1",
      kind: "heading",
      text: "请求事实层",
    });
    expect(detail.bodyBlocks[1]).toEqual({
      kind: "paragraph",
      text: "文章详情页遵循主资源优先原则。标题、正文、作者和发布时间必须先可读；点赞、收藏、presence 和 viewer 状态属于附加信息。",
    });
    expect(detail.bodyBlocks[5]).toEqual({
      kind: "quote",
      text: "设计重点：阅读路径不能被附加资源失败阻断；写路径必须等待服务确认后再更新事实状态。",
    });
    expect(detail.authorMeta).toBe("陈志峰 · 发布于 2026-07-04 · 已读 2,431 次");
    expect(detail.readingActions.bookmarkCountLabel).toBe("--");
    expect(detail.comments[0]?.author).toBe("Lin");
    expect(detail.comments[0]?.role).toBe("前端工程化");
    expect(detail.comments[0]?.likes).toBe(12);
    expect(detail.comments[0]?.replies[0]?.author).toBe("陈志峰");
  });
});
