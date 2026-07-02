import { describe, expect, it } from "vitest";

import {
  isAllowedExternalEmbedProvider,
  isUploadBackedPostBodyBlock,
  type PostBodyBlock,
} from "@/entities/post-body";

describe("post body policy", () => {
  it("allows only whitelisted external embed providers", () => {
    expect(isAllowedExternalEmbedProvider("image")).toBe(true);
    expect(isAllowedExternalEmbedProvider("video")).toBe(false);
    expect(isAllowedExternalEmbedProvider("")).toBe(false);
  });

  it("treats system media blocks as upload-backed only when fileId is present", () => {
    expect(
      isUploadBackedPostBodyBlock({
        type: "image",
        fileId: "file-1",
        url: "https://cdn.example.com/image.png",
      }),
    ).toBe(true);
    expect(
      isUploadBackedPostBodyBlock({
        type: "attachment_gallery",
        items: [
          {
            fileId: "file-1",
          },
        ],
      }),
    ).toBe(true);
    expect(
      isUploadBackedPostBodyBlock({
        type: "image",
        fileId: "",
      }),
    ).toBe(false);
    expect(
      isUploadBackedPostBodyBlock({
        type: "attachment_gallery",
        items: [
          {
            fileId: "",
          },
        ],
      }),
    ).toBe(false);
  });

  it("does not treat external embeds as upload-backed system media", () => {
    const externalImage = {
      type: "external_embed",
      provider: "image",
      url: "https://example.com/image.png",
    } satisfies PostBodyBlock;

    expect(isUploadBackedPostBodyBlock(externalImage)).toBe(false);
  });
});
