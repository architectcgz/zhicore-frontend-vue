import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import { getMe, getProfile, updateProfile, type UpdateProfileReq } from "../user";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

describe("user api", () => {
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
});
