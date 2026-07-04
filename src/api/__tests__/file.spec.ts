import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import { uploadImage } from "../file";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

describe("file api", () => {
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
});
