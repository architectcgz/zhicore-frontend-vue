import { describe, expect, it } from "vitest";

import {
  calculateActiveHeadingHref,
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

describe("calculateActiveHeadingHref", () => {
  const headings = [
    { href: "#heading-1", top: 260 },
    { href: "#heading-2", top: 640 },
    { href: "#heading-3", top: 960 },
  ];

  it("uses the first heading before the article section is reached", () => {
    expect(
      calculateActiveHeadingHref({
        headings,
        scrollY: 0,
        topOffset: 96,
      }),
    ).toBe("#heading-1");
  });

  it("uses the latest heading that has passed the reading offset", () => {
    expect(
      calculateActiveHeadingHref({
        headings,
        scrollY: 560,
        topOffset: 96,
      }),
    ).toBe("#heading-2");
  });
});
