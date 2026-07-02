import type { PostBodyBlock } from "./types";

export const allowedExternalEmbedProviders = ["image"] as const;

export type ExternalEmbedProvider =
  (typeof allowedExternalEmbedProviders)[number];

export function isAllowedExternalEmbedProvider(
  provider: string,
): provider is ExternalEmbedProvider {
  return allowedExternalEmbedProviders.includes(
    provider as ExternalEmbedProvider,
  );
}

function hasUploadFileId(fileId: string | undefined): boolean {
  return Boolean(fileId?.trim());
}

export function isUploadBackedPostBodyBlock(block: PostBodyBlock): boolean {
  if (block.type === "image") {
    return hasUploadFileId(block.fileId);
  }

  if (block.type === "attachment_gallery") {
    // System media is a Content fact only when every item can be traced back to
    // an Upload fileId; display URLs and external embeds are derived surfaces.
    return (
      block.items.length > 0 &&
      block.items.every((item) => hasUploadFileId(item.fileId))
    );
  }

  return false;
}
