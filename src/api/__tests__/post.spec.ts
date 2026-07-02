import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import { saveDraftBody, type SaveDraftBodyReq } from "../post";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

describe("post api", () => {
  it("saves draft body through the Content envelope endpoint", async () => {
    const response = {
      postId: "post-1",
      postVersion: 8,
      draftBodyId: "body-2",
      draftBodyHash: "sha256:next",
      savedAt: "2026-07-02T00:00:00Z",
      wordCount: 12,
    };
    const put = vi.fn().mockResolvedValue({
      data: {
        code: 200,
        message: "操作成功",
        data: response,
        timestamp: 1782112892184,
      },
    });
    vi.mocked(getAxiosInstance).mockReturnValue({
      put,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: SaveDraftBodyReq = {
      schemaVersion: 1,
      blocks: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "正文" }],
        },
      ],
      basePostVersion: 7,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:base",
    };

    await expect(saveDraftBody("post-1", input)).resolves.toEqual(response);
    expect(put).toHaveBeenCalledWith("/v1/posts/post-1/draft/body", input);
  });
});
