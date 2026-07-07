import { beforeEach, describe, expect, it, vi } from "vitest";

import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { getAxiosInstance } from "../request";
import {
  getMe,
  getProfile,
  updateProfile,
  type UpdateProfileReq,
} from "../user";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

vi.mock("@/runtime/localDemoMode", () => ({
  isLocalDemoModeEnabled: vi.fn(() => false),
}));

describe("user api", () => {
  beforeEach(() => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(false);
    vi.mocked(getAxiosInstance).mockReset();
  });

  it("gets current user profile from the User provider", async () => {
    const response = {
      publicId: "u_1",
      nickname: "azhi",
      avatarFileId: "file_1",
      avatarUrl: "https://cdn.example.com/avatar.jpg",
      bio: "hello",
      strangerMessageAllowed: true,
      profileVersion: 3,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(getMe()).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/users/me");
  });

  it("gets a public profile by publicId and updates my profile", async () => {
    const profile = {
      publicId: "u_2",
      nickname: "reader",
      strangerMessageAllowed: false,
      profileVersion: 1,
    };
    const get = vi.fn().mockResolvedValue({ data: profile });
    const patch = vi.fn().mockResolvedValue({ data: profile });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
      patch,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: UpdateProfileReq = {
      nickname: "reader",
      bio: "updated",
      strangerMessageAllowed: false,
    };

    await expect(getProfile("u_2")).resolves.toEqual(profile);
    await expect(updateProfile(input)).resolves.toEqual(profile);
    expect(get).toHaveBeenCalledWith("/v1/users/u_2");
    expect(patch).toHaveBeenCalledWith("/v1/users/me/profile", input);
  });

  it("serves local demo profile reads and updates as API-shaped DTOs without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);
    const get = vi.fn().mockResolvedValue({ data: { shouldNot: "be used" } });
    const patch = vi.fn().mockResolvedValue({
      data: { shouldNot: "be used" },
    });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
      patch,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(getMe()).resolves.toEqual({
      publicId: "local-demo-user",
      nickname: "本地调试用户",
      avatarFileId: "local-demo-avatar",
      avatarUrl: "/vite.svg",
      bio: "本地 demo 资料仅用于前端调试。",
      strangerMessageAllowed: true,
      profileVersion: 1,
    });
    await expect(
      updateProfile({
        nickname: "新的昵称",
        bio: "新的简介",
        avatarFileId: "uploaded-avatar",
        strangerMessageAllowed: false,
      }),
    ).resolves.toEqual({
      publicId: "local-demo-user",
      nickname: "新的昵称",
      avatarFileId: "uploaded-avatar",
      avatarUrl: "/vite.svg",
      bio: "新的简介",
      strangerMessageAllowed: false,
      profileVersion: 2,
    });

    expect(get).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });
});
