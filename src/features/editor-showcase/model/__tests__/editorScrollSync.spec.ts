import { describe, expect, it } from "vitest";

import { getSyncedScrollTop } from "../editorScrollSync";

describe("editorScrollSync", () => {
  it("maps the source scroll progress to target scroll top", () => {
    expect(
      getSyncedScrollTop({
        sourceScrollTop: 300,
        sourceScrollHeight: 1000,
        sourceClientHeight: 400,
        targetScrollHeight: 1600,
        targetClientHeight: 400,
      }),
    ).toBe(600);
  });

  it("returns zero when either side cannot scroll", () => {
    expect(
      getSyncedScrollTop({
        sourceScrollTop: 300,
        sourceScrollHeight: 400,
        sourceClientHeight: 400,
        targetScrollHeight: 1600,
        targetClientHeight: 400,
      }),
    ).toBe(0);

    expect(
      getSyncedScrollTop({
        sourceScrollTop: 300,
        sourceScrollHeight: 1000,
        sourceClientHeight: 400,
        targetScrollHeight: 400,
        targetClientHeight: 400,
      }),
    ).toBe(0);
  });
});
