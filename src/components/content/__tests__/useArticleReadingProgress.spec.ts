import { describe, expect, it } from "vitest";

import {
  calculateTocActiveHeadingHref,
  calculateReadingProgress,
} from "../useArticleReadingProgress";

describe("calculateReadingProgress", () => {
  it("returns zero before the article reaches the reading offset", () => {
    expect(
      calculateReadingProgress({
        articleTop: 200,
        articleHeight: 1600,
        viewportHeight: 800,
        scrollY: 0,
        topOffset: 96,
      }),
    ).toBe(0);
  });

  it("maps article scroll position to a clamped percentage", () => {
    expect(
      calculateReadingProgress({
        articleTop: 100,
        articleHeight: 1600,
        viewportHeight: 800,
        scrollY: 452,
        topOffset: 96,
      }),
    ).toBe(50);

    expect(
      calculateReadingProgress({
        articleTop: 100,
        articleHeight: 1600,
        viewportHeight: 800,
        scrollY: 9999,
        topOffset: 96,
      }),
    ).toBe(100);
  });

  it("marks short articles complete once the reader passes the reading offset", () => {
    expect(
      calculateReadingProgress({
        articleTop: 100,
        articleHeight: 420,
        viewportHeight: 900,
        scrollY: 0,
        topOffset: 96,
      }),
    ).toBe(0);

    expect(
      calculateReadingProgress({
        articleTop: 100,
        articleHeight: 420,
        viewportHeight: 900,
        scrollY: 12,
        topOffset: 96,
      }),
    ).toBe(100);
  });
});

describe("calculateTocActiveHeadingHref", () => {
  const headings = [
    { href: "#heading-1", top: 260 },
    { href: "#heading-2", top: 640 },
    { href: "#heading-3", top: 960 },
    { href: "#heading-4", top: 1280 },
  ];

  it("activates the node crossed by the visual progress line", () => {
    expect(
      calculateTocActiveHeadingHref({
        headings,
        progressScale: 0.34,
      }),
    ).toBe("#heading-2");
  });

  it("does not jump from the second node directly to the last node", () => {
    expect(
      calculateTocActiveHeadingHref({
        headings,
        progressScale: 0.72,
      }),
    ).toBe("#heading-3");
  });

  it("activates the last node only when the visual progress reaches the end", () => {
    expect(
      calculateTocActiveHeadingHref({
        headings,
        progressScale: 1,
      }),
    ).toBe("#heading-4");
  });
});
