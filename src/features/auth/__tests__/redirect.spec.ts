import { describe, expect, it } from "vitest";

import { sanitizeAuthRedirect } from "../lib/redirect";

describe("sanitizeAuthRedirect", () => {
  it.each([
    ["/", "/"],
    ["/editor", "/editor"],
    ["/editor?draft=1#title", "/editor?draft=1#title"],
    ["https://evil.example/path", "/"],
    ["//evil.example/path", "/"],
    ["", "/"],
    [["/editor"], "/"],
  ])("maps %s to %s", (input, expected) => {
    expect(sanitizeAuthRedirect(input)).toBe(expected);
  });
});
