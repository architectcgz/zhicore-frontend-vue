import { getAxiosInstance } from "./request";

export type FileAccessLevel = "PUBLIC" | "PRIVATE";

export interface UploadFileResp {
  fileId: string;
  url: string;
  fileSize: number;
  fileHash?: string;
  instantUpload: boolean;
  uploadTime?: string;
  accessLevel: FileAccessLevel;
  originalName: string;
  contentType: string;
}

export interface UploadImageReq {
  file: File;
}

export interface UploadAudioReq {
  file: File;
}

export interface UploadImagesBatchReq {
  files: File[];
  accessLevel?: FileAccessLevel;
}

export async function uploadImage(
  input: UploadImageReq,
): Promise<UploadFileResp> {
  const response = await getAxiosInstance().post<UploadFileResp>(
    "/v1/files/image",
    formDataWithFile("file", input.file),
  );

  return response.data;
}

export async function uploadAudio(
  input: UploadAudioReq,
): Promise<UploadFileResp> {
  const response = await getAxiosInstance().post<UploadFileResp>(
    "/v1/files/audio",
    formDataWithFile("file", input.file),
  );

  return response.data;
}

export async function uploadImagesBatch(
  input: UploadImagesBatchReq,
): Promise<UploadFileResp[]> {
  const formData = new FormData();
  for (const file of input.files) {
    formData.append("files", file);
  }
  if (input.accessLevel) {
    formData.append("accessLevel", input.accessLevel);
  }

  const response = await getAxiosInstance().post<UploadFileResp[]>(
    "/v1/files/images/batch",
    formData,
  );
  return response.data;
}

export async function getFileUrl(fileId: string): Promise<string> {
  const response = await getAxiosInstance().get<string>(
    `/v1/files/${fileId}/url`,
  );
  return response.data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await getAxiosInstance().delete(`/v1/files/${fileId}`);
}

function formDataWithFile(fieldName: string, file: File): FormData {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}
