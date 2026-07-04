import type { ApiPageReq } from "@/types/api";

import { getAxiosInstance } from "./request";

export interface RankingPageReq extends ApiPageReq {}

export type RankingSource = "REDIS" | "POSTGRES" | "MONGO_ARCHIVE";

export interface RankingPageResp<T> {
  items: T[];
  page: number;
  size: number;
  hasMore: boolean;
  generatedAt: string;
  source: RankingSource;
  degraded: boolean;
}

export interface RankingScoreItem {
  entityId: string;
  rank: number;
  score: number;
  updatedAt?: string;
}

export interface DailyRankingPageReq extends RankingPageReq {
  date?: string;
}

export interface PeriodRankingPageResp<T> extends RankingPageResp<T> {
  periodType: "DAY" | "WEEK" | "MONTH";
  periodKey: string;
}

export async function listHotPosts(input?: RankingPageReq): Promise<RankingPageResp<string>> {
  const response = await getAxiosInstance().get<RankingPageResp<string>>(
    "/v1/ranking/posts/hot",
    { params: input },
  );
  return response.data;
}

export async function listHotPostScores(
  input?: RankingPageReq,
): Promise<RankingPageResp<RankingScoreItem>> {
  const response = await getAxiosInstance().get<RankingPageResp<RankingScoreItem>>(
    "/v1/ranking/posts/hot/scores",
    { params: input },
  );
  return response.data;
}

export async function listDailyPostScores(
  input?: DailyRankingPageReq,
): Promise<PeriodRankingPageResp<RankingScoreItem>> {
  const response = await getAxiosInstance().get<PeriodRankingPageResp<RankingScoreItem>>(
    "/v1/ranking/posts/daily/scores",
    { params: input },
  );
  return response.data;
}
