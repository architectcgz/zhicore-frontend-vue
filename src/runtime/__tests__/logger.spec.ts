import { describe, expect, it, vi } from "vitest";

import { createAppLogger } from "../logger";

describe("createAppLogger", () => {
  it("adds the application namespace prefix", () => {
    expect(createAppLogger(["editor", "compiler"]).namespace).toBe(
      "zhicore:editor:compiler",
    );
    expect(createAppLogger("zhicore:runtime").namespace).toBe(
      "zhicore:runtime",
    );
  });

  it("keeps debug payload creation lazy while the namespace is disabled", () => {
    const logger = createAppLogger(["runtime", "error"]);
    const createArgs = vi.fn((): [formatter: unknown, ...args: unknown[]] => [
      "runtime error",
    ]);

    logger.debug(createArgs);

    expect(createArgs).not.toHaveBeenCalled();
  });

  it("rejects empty namespaces", () => {
    expect(() => createAppLogger(" ")).toThrow(
      "Logger namespace cannot be empty.",
    );
  });
});
