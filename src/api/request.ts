import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

import type {
  ApiEnvelope,
  ApiErrorDetail,
  ApiErrorEnvelope,
} from "@/types/api";

export class ApiError extends Error {
  status?: number;
  requestUrl?: string;
  code?: number;
  traceId?: string;
  details?: ApiErrorDetail[];

  constructor(
    message: string,
    options: {
      status?: number;
      requestUrl?: string;
      code?: number;
      traceId?: string;
      details?: ApiErrorDetail[];
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.requestUrl = options.requestUrl;
    this.code = options.code;
    this.traceId = options.traceId;
    this.details = options.details;
  }
}

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export interface AuthRequestTokens {
  accessToken?: string | null;
  csrfToken?: string | null;
}

let authRequestTokens: AuthRequestTokens = {};
const bearerlessAuthPaths = [
  "/v1/auth/login",
  "/v1/auth/register",
  "/v1/auth/csrf",
  "/v1/auth/refresh",
];

export function setAuthRequestTokens(tokens: AuthRequestTokens): void {
  authRequestTokens = {
    accessToken: tokens.accessToken || undefined,
    csrfToken: tokens.csrfToken || undefined,
  };
}

export function clearAuthRequestTokens(): void {
  authRequestTokens = {};
}

export async function unwrapApiEnvelope<T>(
  envelope: ApiEnvelope<T>,
): Promise<T> {
  return envelope.data;
}

function isUnsafeMethod(method?: string): boolean {
  return !["get", "head", "options"].includes((method || "get").toLowerCase());
}

function requestPathFromUrl(url?: string): string {
  if (!url) {
    return "";
  }

  try {
    return new URL(url, "http://local").pathname;
  } catch {
    return url.split("?")[0] || "";
  }
}

function shouldAttachAuthorization(url?: string): boolean {
  const requestPath = requestPathFromUrl(url);
  return !bearerlessAuthPaths.some(
    (path) => requestPath === path || requestPath.endsWith(`/api${path}`),
  );
}

function attachAuthHeaders(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const headers = AxiosHeaders.from(config.headers);

  // Access/CSRF tokens are kept in memory and mirrored here only for HTTP transport.
  if (authRequestTokens.accessToken && shouldAttachAuthorization(config.url)) {
    headers.set("Authorization", `Bearer ${authRequestTokens.accessToken}`);
  } else if (!shouldAttachAuthorization(config.url)) {
    headers.delete("Authorization");
  }
  if (authRequestTokens.csrfToken && isUnsafeMethod(config.method)) {
    headers.set("X-CSRF-Token", authRequestTokens.csrfToken);
  }

  config.headers = headers;
  return config;
}

function collectApiErrorDetails(
  body?: ApiErrorEnvelope,
): ApiErrorDetail[] | undefined {
  const nestedData =
    body?.data && typeof body.data === "object" ? body.data : undefined;
  const details = [
    ...(body?.details || []),
    ...(nestedData?.details || []),
    ...(nestedData?.fields || []),
  ];

  return details.length > 0 ? details : undefined;
}

export function normalizeApiError(
  error: AxiosError<ApiErrorEnvelope>,
): ApiError {
  const status = error.response?.status;
  const requestUrl = error.config?.url;
  const body = error.response?.data;
  const message = body?.message || error.message || "请求失败";

  return new ApiError(message, {
    status,
    requestUrl,
    code: body?.code,
    traceId: body?.traceId,
    details: collectApiErrorDetails(body),
  });
}

axiosInstance.interceptors.request.use(attachAuthHeaders);

axiosInstance.interceptors.response.use(
  async (response) => ({
    ...response,
    data: await unwrapApiEnvelope(response.data),
  }),
  (error: AxiosError<ApiErrorEnvelope>) =>
    Promise.reject(normalizeApiError(error)),
);

export function getAxiosInstance() {
  return axiosInstance;
}
