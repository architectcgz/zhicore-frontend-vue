import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { getAxiosInstance } from "./request";

export interface UserProfileResp {
  publicId: string;
  nickname: string;
  avatarFileId?: string;
  avatarUrl?: string;
  bio?: string;
  strangerMessageAllowed: boolean;
  profileVersion: number;
}

export interface UpdateProfileReq {
  nickname?: string;
  avatarFileId?: string | null;
  bio?: string;
  strangerMessageAllowed?: boolean;
}

const localDemoProfile: UserProfileResp = {
  publicId: "local-demo-user",
  nickname: "本地调试用户",
  avatarFileId: "local-demo-avatar",
  avatarUrl: "/vite.svg",
  bio: "本地 demo 资料仅用于前端调试。",
  strangerMessageAllowed: true,
  profileVersion: 1,
};

export async function getMe(): Promise<UserProfileResp> {
  if (isLocalDemoModeEnabled()) {
    return { ...localDemoProfile };
  }

  const response =
    await getAxiosInstance().get<UserProfileResp>("/v1/users/me");
  return response.data;
}

export async function getProfile(publicId: string): Promise<UserProfileResp> {
  if (isLocalDemoModeEnabled()) {
    return {
      ...localDemoProfile,
      publicId,
    };
  }

  const response = await getAxiosInstance().get<UserProfileResp>(
    `/v1/users/${publicId}`,
  );
  return response.data;
}

export async function updateProfile(
  input: UpdateProfileReq,
): Promise<UserProfileResp> {
  if (isLocalDemoModeEnabled()) {
    // 本地 demo 只模拟 API 返回形状，资料状态仍由调用方按正常保存流程接收并回填。
    return {
      ...localDemoProfile,
      nickname: input.nickname ?? localDemoProfile.nickname,
      avatarFileId:
        input.avatarFileId === undefined
          ? localDemoProfile.avatarFileId
          : (input.avatarFileId ?? undefined),
      bio: input.bio ?? localDemoProfile.bio,
      strangerMessageAllowed:
        input.strangerMessageAllowed ?? localDemoProfile.strangerMessageAllowed,
      profileVersion: localDemoProfile.profileVersion + 1,
    };
  }

  const response = await getAxiosInstance().patch<UserProfileResp>(
    "/v1/users/me/profile",
    input,
  );
  return response.data;
}
