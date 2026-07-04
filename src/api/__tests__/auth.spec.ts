import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import { login, logout, refreshSession, type LoginReq } from "../auth";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

describe("auth api", () => {
  it("logs in through the Go Auth envelope and preserves tokens with the mapped AuthUser", async () => {
    const post = vi.fn().mockResolvedValue({
      status: 200,
      data: {
        accessToken: "access-token",
        tokenType: "Bearer",
        expiresIn: 7200,
        csrfToken: "csrf-token",
        principal: {
          accountId: "account-1",
          userId: "user-1",
          email: "demo@example.com",
          roles: ["ROLE_USER"],
          accountStatus: "ACTIVE",
          sessionVersion: 1,
          principalVersion: 2,
        },
      },
    });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: LoginReq = {
      email: "demo@example.com",
      password: "Password123",
    };

    await expect(login(input)).resolves.toEqual({
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 7200,
      csrfToken: "csrf-token",
      user: {
        id: "user-1",
        username: "demo@example.com",
        role: "user",
        displayName: "demo@example.com",
      },
    });
    expect(post).toHaveBeenCalledWith("/v1/auth/login", input);
  });

  it("maps a successful refresh response to an authenticated session", async () => {
    const post = vi.fn().mockResolvedValue({
      status: 200,
      data: {
        accessToken: "new-access-token",
        tokenType: "Bearer",
        expiresIn: 7200,
        csrfToken: "new-csrf-token",
        principal: {
          accountId: "account-1",
          userId: "user-1",
          email: "demo@example.com",
          roles: ["ROLE_AUTHOR"],
          accountStatus: "ACTIVE",
          sessionVersion: 2,
          principalVersion: 3,
        },
      },
    });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(refreshSession()).resolves.toEqual({
      state: "authenticated",
      session: {
        accessToken: "new-access-token",
        tokenType: "Bearer",
        expiresIn: 7200,
        csrfToken: "new-csrf-token",
        user: {
          id: "user-1",
          username: "demo@example.com",
          role: "author",
          displayName: "demo@example.com",
        },
      },
    });
    expect(post).toHaveBeenCalledWith("/v1/auth/refresh");
  });

  it("keeps refresh 202 processing separate from authenticated sessions", async () => {
    const post = vi.fn().mockResolvedValue({
      status: 202,
      data: {
        operationId: "security-op-1",
        status: "PROCESSING",
        retryAfterSeconds: 5,
        refreshAccepted: false,
      },
    });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(refreshSession()).resolves.toEqual({
      state: "processing",
      operationId: "security-op-1",
      status: "PROCESSING",
      retryAfterSeconds: 5,
      refreshAccepted: false,
    });
  });

  it("keeps logout 202 processing separate from completed revocation", async () => {
    const post = vi.fn().mockResolvedValue({
      status: 202,
      data: {
        operationId: "logout-op-1",
        status: "PROCESSING",
        retryAfterSeconds: 3,
        loggedOut: true,
      },
    });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(logout()).resolves.toEqual({
      state: "processing",
      operationId: "logout-op-1",
      status: "PROCESSING",
      retryAfterSeconds: 3,
      loggedOut: true,
    });
  });
});
