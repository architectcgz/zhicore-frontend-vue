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

export async function getMe(): Promise<UserProfileResp> {
  const response =
    await getAxiosInstance().get<UserProfileResp>("/v1/users/me");
  return response.data;
}

export async function getProfile(publicId: string): Promise<UserProfileResp> {
  const response = await getAxiosInstance().get<UserProfileResp>(
    `/v1/users/${publicId}`,
  );
  return response.data;
}

export async function updateProfile(
  input: UpdateProfileReq,
): Promise<UserProfileResp> {
  const response = await getAxiosInstance().patch<UserProfileResp>(
    "/v1/users/me/profile",
    input,
  );
  return response.data;
}
