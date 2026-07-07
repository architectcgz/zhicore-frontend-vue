import { beforeEach, describe, expect, it, vi } from "vitest";

import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { getAxiosInstance } from "../request";
import { uploadImage } from "../file";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

vi.mock("@/runtime/localDemoMode", () => ({
  isLocalDemoModeEnabled: vi.fn(() => false),
}));

describe("file api", () => {
  beforeEach(() => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(false);
    vi.mocked(getAxiosInstance).mockReset();
  });

  it("uploads one image with multipart field file and returns UploadFileResp", async () => {
    const response = {
      fileId: "file_123",
      url: "https://cdn.example.com/file_123.jpg",
      fileSize: 12,
      instantUpload: false,
      uploadTime: "2026-06-22T10:00:00Z",
      accessLevel: "PUBLIC",
      originalName: "avatar.jpg",
      contentType: "image/jpeg",
    };
    const post = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const file = new File(["image"], "avatar.jpg", { type: "image/jpeg" });

    await expect(uploadImage({ file })).resolves.toEqual(response);

    expect(post).toHaveBeenCalledOnce();
    const [url, body] = post.mock.calls[0];
    expect(url).toBe("/v1/files/image");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
  });

  it("serves local demo image uploads as API-shaped DTOs without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);
    const post = vi.fn().mockResolvedValue({ data: { shouldNot: "be used" } });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const file = new File(["image"], "avatar.jpg", { type: "image/jpeg" });

    await expect(uploadImage({ file })).resolves.toEqual({
      fileId: "local-demo-avatar-avatar.jpg",
      url: "/vite.svg",
      fileSize: 5,
      fileHash: "sha256:local-demo",
      instantUpload: true,
      uploadTime: "2026-01-01T00:00:00.000Z",
      accessLevel: "PUBLIC",
      originalName: "avatar.jpg",
      contentType: "image/jpeg",
    });

    expect(post).not.toHaveBeenCalled();
  });
});
