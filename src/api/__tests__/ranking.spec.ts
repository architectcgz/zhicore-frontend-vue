import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import {
  listDailyPostScores,
  listHotPostScores,
  listHotPosts,
  type DailyRankingPageReq,
  type RankingPageReq,
} from "../ranking";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

describe("ranking api", () => {
  it("lists public hot post ids with Ranking pagination", async () => {
    const response = {
      items: ["post-1"],
      page: 0,
      size: 20,
      hasMore: false,
      generatedAt: "2026-07-02T00:00:00Z",
      source: "REDIS",
      degraded: false,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: RankingPageReq = { page: 0, size: 20 };

    await expect(listHotPosts(input)).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/ranking/posts/hot", {
      params: input,
    });
  });

  it("lists public hot post score items", async () => {
    const response = {
      items: [
        {
          entityId: "post-1",
          rank: 1,
          score: 99.5,
          updatedAt: "2026-07-02T00:00:00Z",
        },
      ],
      page: 0,
      size: 20,
      hasMore: false,
      generatedAt: "2026-07-02T00:00:00Z",
      source: "REDIS",
      degraded: false,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(listHotPostScores()).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/ranking/posts/hot/scores", {
      params: undefined,
    });
  });

  it("lists public daily post score items with period params", async () => {
    const response = {
      items: [{ entityId: "post-1", rank: 1, score: 80 }],
      page: 0,
      size: 20,
      hasMore: false,
      generatedAt: "2026-07-02T00:00:00Z",
      source: "POSTGRES",
      degraded: false,
      periodType: "DAY",
      periodKey: "2026-07-02",
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: DailyRankingPageReq = {
      page: 0,
      size: 20,
      date: "2026-07-02",
    };

    await expect(listDailyPostScores(input)).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/ranking/posts/daily/scores", {
      params: input,
    });
  });
});
