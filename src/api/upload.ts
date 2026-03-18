/**
 * 文件上传相关 API 接口
 * 调用 zhicore-upload 微服务进行文件上传
 */

import axios, { type AxiosProgressEvent } from 'axios';
import { ElMessage } from 'element-plus';

/**
 * 文件上传响应接口
 */
export interface FileUploadResponse {
  fileId: string;
  url: string;
  fileSize: number;
  fileHash?: string;
  instantUpload?: boolean;
  uploadTime: string;
}

/**
 * 访问级别枚举
 */
export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

/**
 * 上传配置
 * 注意：此接口保留用于未来扩展
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UploadConfig {
  onProgress?: (progress: number) => void;
  accessLevel?: AccessLevel;
}

export interface UploadRequestOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

function normalizeUploadOptions(
  options?: UploadRequestOptions | ((progress: number) => void)
): UploadRequestOptions {
  if (typeof options === 'function') {
    return { onProgress: options };
  }

  return options ?? {};
}

/**
 * 文件上传 API 服务类
 */
export class UploadApi {
  private baseURL: string;

  constructor() {
    // zhicore-upload 服务地址
    this.baseURL = import.meta.env.VITE_UPLOAD_API_URL || '/api/v1/upload';
  }

  /**
   * 上传图片（公开访问）
   * @param file 图片文件
   * @param onProgress 上传进度回调
   * @returns 上传结果
   */
  async uploadImage(
    file: File,
    options?: UploadRequestOptions | ((progress: number) => void)
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const resolvedOptions = normalizeUploadOptions(options);

    try {
      const response = await axios.post<{ code: number; data: FileUploadResponse; message: string }>(
        `${this.baseURL}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: resolvedOptions.signal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (resolvedOptions.onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              resolvedOptions.onProgress(progress);
            }
          },
        }
      );

      if (response.data.code === 200 && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || '上传失败';
        ElMessage.error(message);
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * 上传图片（指定访问级别）
   * @param file 图片文件
   * @param accessLevel 访问级别
   * @param onProgress 上传进度回调
   * @returns 上传结果
   */
  async uploadImageWithAccess(
    file: File,
    accessLevel: AccessLevel,
    options?: UploadRequestOptions | ((progress: number) => void)
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accessLevel', accessLevel);
    const resolvedOptions = normalizeUploadOptions(options);

    try {
      const response = await axios.post<{ code: number; data: FileUploadResponse; message: string }>(
        `${this.baseURL}/image/with-access`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: resolvedOptions.signal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (resolvedOptions.onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              resolvedOptions.onProgress(progress);
            }
          },
        }
      );

      if (response.data.code === 200 && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || '上传失败';
        ElMessage.error(message);
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * 批量上传图片
   * @param files 图片文件数组
   * @param accessLevel 访问级别
   * @param onProgress 上传进度回调
   * @returns 上传结果数组
   */
  async uploadImagesBatch(
    files: File[],
    accessLevel: AccessLevel = AccessLevel.PUBLIC,
    options?: UploadRequestOptions | ((progress: number) => void)
  ): Promise<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('accessLevel', accessLevel);
    const resolvedOptions = normalizeUploadOptions(options);

    try {
      const response = await axios.post<{ code: number; data: FileUploadResponse[]; message: string }>(
        `${this.baseURL}/images/batch`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: resolvedOptions.signal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (resolvedOptions.onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              resolvedOptions.onProgress(progress);
            }
          },
        }
      );

      if (response.data.code === 200 && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '批量上传失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || '批量上传失败';
        ElMessage.error(message);
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await axios.delete<{ code: number; message: string }>(
        `${this.baseURL}/file/${fileId}`
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.message || '删除失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || '删除失败';
        ElMessage.error(message);
        throw new Error(message);
      }
      throw error;
    }
  }
}

// 创建 API 实例
export const uploadApi = new UploadApi();
