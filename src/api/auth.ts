import type { AuthUser, UserRole } from "@/entities/user/model/user";

import { getAxiosInstance } from "./request";

export interface AuthPrincipal {
  accountId: string;
  userId: string;
  email: string;
  roles: string[];
  accountStatus: string;
  sessionId?: string;
  sessionVersion: number;
  principalVersion: number;
}

export interface AuthPrincipalResp {
  principal: AuthPrincipal;
}

export interface LoginReq {
  email: string;
  password: string;
}

export interface LoginResp extends AuthPrincipalResp {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  csrfToken: string;
}

export interface CsrfResp {
  csrfToken: string;
}

export interface RefreshResp extends LoginResp {}

export interface RefreshProcessingResp {
  operationId: string;
  status: "PROCESSING";
  retryAfterSeconds: number;
  refreshAccepted: false;
}

export interface LogoutResp {
  loggedOut: boolean;
  serverRevoked: boolean;
}

export interface LogoutProcessingResp {
  operationId: string;
  status: "PROCESSING";
  retryAfterSeconds: number;
  loggedOut: true;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  csrfToken: string;
}

export type RefreshSessionResult =
  | {
      state: "authenticated";
      session: AuthSession;
    }
  | ({
      state: "processing";
    } & RefreshProcessingResp);

export type LogoutResult =
  | ({
      state: "completed";
    } & LogoutResp)
  | ({
      state: "processing";
    } & LogoutProcessingResp);

export interface RegisterReq {
  email: string;
  nickname: string;
  password: string;
  emailVerificationToken: string;
}

export interface RegisterResp {
  registered: boolean;
  authenticated: boolean;
  accessToken?: string;
  tokenType?: "Bearer";
  expiresIn?: number;
  csrfToken?: string;
  principal?: AuthPrincipal;
  loginDeferredReason: string | null;
}

export async function getProfile(): Promise<AuthUser> {
  const response =
    await getAxiosInstance().get<AuthPrincipalResp>("/v1/auth/me");
  return authUserFromPrincipal(response.data.principal);
}

export async function login(input: LoginReq): Promise<AuthSession> {
  const response = await getAxiosInstance().post<LoginResp>(
    "/v1/auth/login",
    input,
  );
  return authSessionFromLoginResp(response.data);
}

export async function getCsrfToken(): Promise<CsrfResp> {
  const response = await getAxiosInstance().get<CsrfResp>("/v1/auth/csrf");
  return response.data;
}

export async function refreshSession(): Promise<RefreshSessionResult> {
  const response = await getAxiosInstance().post<
    RefreshResp | RefreshProcessingResp
  >("/v1/auth/refresh");
  if (response.status === 202 || isRefreshProcessingResp(response.data)) {
    const processing = response.data as RefreshProcessingResp;
    return {
      state: "processing",
      ...processing,
    };
  }

  return {
    state: "authenticated",
    session: authSessionFromLoginResp(response.data),
  };
}

export async function logout(): Promise<LogoutResult> {
  const response = await getAxiosInstance().post<
    LogoutResp | LogoutProcessingResp
  >("/v1/auth/logout");
  if (response.status === 202 || isLogoutProcessingResp(response.data)) {
    const processing = response.data as LogoutProcessingResp;
    return {
      state: "processing",
      ...processing,
    };
  }

  return {
    state: "completed",
    ...response.data,
  };
}

export async function register(input: RegisterReq): Promise<RegisterResp> {
  const response = await getAxiosInstance().post<RegisterResp>(
    "/v1/auth/register",
    input,
  );
  return response.data;
}

function authUserFromPrincipal(principal: AuthPrincipal): AuthUser {
  return {
    id: principal.userId,
    username: principal.email,
    role: roleFromPrincipal(principal.roles),
    displayName: principal.email,
  };
}

function authSessionFromLoginResp(response: LoginResp): AuthSession {
  return {
    user: authUserFromPrincipal(response.principal),
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    csrfToken: response.csrfToken,
  };
}

function isRefreshProcessingResp(
  response: RefreshResp | RefreshProcessingResp,
): response is RefreshProcessingResp {
  return (
    "status" in response &&
    response.status === "PROCESSING" &&
    "refreshAccepted" in response
  );
}

function isLogoutProcessingResp(
  response: LogoutResp | LogoutProcessingResp,
): response is LogoutProcessingResp {
  return (
    "status" in response &&
    response.status === "PROCESSING" &&
    "operationId" in response
  );
}

function roleFromPrincipal(roles: string[]): UserRole {
  if (roles.includes("ROLE_ADMIN")) {
    return "admin";
  }
  if (roles.includes("ROLE_AUTHOR")) {
    return "author";
  }
  return "user";
}
