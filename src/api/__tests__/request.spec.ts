import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it } from "vitest";

import {
  clearAuthRequestTokens,
  getAxiosInstance,
  normalizeApiError,
  setAuthRequestTokens,
  unwrapApiEnvelope,
} from "../request";
import type { ApiErrorEnvelope } from "@/types/api";

describe("request transport", () => {
  afterEach(() => {
    clearAuthRequestTokens();
  });

  it("unwraps successful Go API envelopes to the data payload", async () => {
    await expect(
      unwrapApiEnvelope({
        code: 200,
        message: "操作成功",
        data: { id: "p1" },
        timestamp: 1782112892184,
      }),
    ).resolves.toEqual({ id: "p1" });
  });

  it("normalizes Go API error envelopes with public code, trace and details", () => {
    const error = {
      message: "Request failed with status code 422",
      config: { url: "/v1/posts" },
      response: {
        status: 422,
        data: {
          code: 10422,
          message: "字段校验失败",
          traceId: "trace-1",
          details: [
            {
              field: "title",
              message: "标题不能为空",
              reason: "required",
            },
          ],
          timestamp: 1782112892184,
        },
      },
    } as AxiosError<ApiErrorEnvelope>;

    const apiError = normalizeApiError(error);

    expect(apiError).toMatchObject({
      name: "ApiError",
      message: "字段校验失败",
      status: 422,
      requestUrl: "/v1/posts",
      code: 10422,
      traceId: "trace-1",
      details: [
        {
          field: "title",
          message: "标题不能为空",
          reason: "required",
        },
      ],
    });
  });

  it("injects Bearer access token and CSRF token into outgoing mutating requests", async () => {
    let seenConfig: InternalAxiosRequestConfig | undefined;
    const axiosInstance = getAxiosInstance();
    const originalAdapter = axiosInstance.defaults.adapter;
    axiosInstance.defaults.adapter = async (config) => {
      seenConfig = config;
      return {
        status: 200,
        statusText: "OK",
        headers: {},
        config,
        data: {
          code: 200,
          message: "操作成功",
          data: { ok: true },
          timestamp: 1782112892184,
        },
      };
    };

    try {
      setAuthRequestTokens({
        accessToken: "access-token",
        csrfToken: "csrf-token",
      });

      await axiosInstance.post("/v1/auth/logout");
    } finally {
      axiosInstance.defaults.adapter = originalAdapter;
    }

    expect(seenConfig?.headers.get("Authorization")).toBe(
      "Bearer access-token",
    );
    expect(seenConfig?.headers.get("X-CSRF-Token")).toBe("csrf-token");
  });

  it("keeps refresh cookie recovery free of stale Bearer tokens while sending CSRF", async () => {
    let seenConfig: InternalAxiosRequestConfig | undefined;
    const axiosInstance = getAxiosInstance();
    const originalAdapter = axiosInstance.defaults.adapter;
    axiosInstance.defaults.adapter = async (config) => {
      seenConfig = config;
      return {
        status: 202,
        statusText: "Accepted",
        headers: {},
        config,
        data: {
          code: 202,
          message: "处理中",
          data: {
            operationId: "security-op-1",
            status: "PROCESSING",
            retryAfterSeconds: 5,
            refreshAccepted: false,
          },
          timestamp: 1782112892184,
        },
      };
    };

    try {
      setAuthRequestTokens({
        accessToken: "expired-access-token",
        csrfToken: "csrf-token",
      });

      await axiosInstance.post("/v1/auth/refresh");
    } finally {
      axiosInstance.defaults.adapter = originalAdapter;
    }

    expect(seenConfig?.headers.has("Authorization")).toBe(false);
    expect(seenConfig?.headers.get("X-CSRF-Token")).toBe("csrf-token");
  });

  it("normalizes nested data.details and data.fields into ApiError details", () => {
    const error = {
      message: "Request failed with status code 422",
      config: { url: "/v1/posts" },
      response: {
        status: 422,
        data: {
          code: 4013,
          message: "字段校验失败",
          traceId: "trace-2",
          data: {
            details: [
              {
                path: "blocks[3].children[1].latex",
                code: "MATH_LATEX_TOO_LONG",
                messageKey: "content.body.math_latex_too_long",
              },
            ],
            fields: [
              {
                field: "accessLevel",
                reason: "required",
              },
            ],
          },
          timestamp: 1782112892184,
        },
      },
    } as AxiosError<ApiErrorEnvelope>;

    const apiError = normalizeApiError(error);

    expect(apiError.details).toEqual([
      {
        path: "blocks[3].children[1].latex",
        code: "MATH_LATEX_TOO_LONG",
        messageKey: "content.body.math_latex_too_long",
      },
      {
        field: "accessLevel",
        reason: "required",
      },
    ]);
  });
});
