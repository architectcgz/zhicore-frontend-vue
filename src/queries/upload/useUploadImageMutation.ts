/**
 * 图片上传 Mutation Hook
 * 上传图片文件，支持进度跟踪和批量上传
 * 
 * 注意：上传进度不使用 TanStack Query 管理，使用本地状态
 */

import { useMutation } from '@tanstack/vue-query';
import { uploadApi, AccessLevel } from '@/api/upload';

/**
 * 上传单个图片
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: uploadImage, isPending } = useUploadImageMutation();
 * 
 * const progress = ref(0);
 * uploadImage({
 *   file: imageFile,
 *   onProgress: (p) => { progress.value = p; }
 * });
 * ```
 */
export function useUploadImageMutation() {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      uploadApi.uploadImage(file, onProgress),
    // 不需要缓存失效，因为上传的图片会在创建/更新文章时使用
  });
}

/**
 * 上传图片（指定访问级别）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: uploadImage, isPending } = useUploadImageWithAccessMutation();
 * 
 * const progress = ref(0);
 * uploadImage({
 *   file: imageFile,
 *   accessLevel: AccessLevel.PRIVATE,
 *   onProgress: (p) => { progress.value = p; }
 * });
 * ```
 */
export function useUploadImageWithAccessMutation() {
  return useMutation({
    mutationFn: ({ 
      file, 
      accessLevel, 
      onProgress 
    }: { 
      file: File; 
      accessLevel: AccessLevel;
      onProgress?: (progress: number) => void;
    }) => uploadApi.uploadImageWithAccess(file, accessLevel, onProgress),
  });
}

/**
 * 批量上传图片
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: uploadImages, isPending } = useUploadImagesBatchMutation();
 * 
 * const progress = ref(0);
 * uploadImages({
 *   files: [file1, file2, file3],
 *   accessLevel: AccessLevel.PUBLIC,
 *   onProgress: (p) => { progress.value = p; }
 * });
 * ```
 */
export function useUploadImagesBatchMutation() {
  return useMutation({
    mutationFn: ({ 
      files, 
      accessLevel, 
      onProgress 
    }: { 
      files: File[]; 
      accessLevel?: AccessLevel;
      onProgress?: (progress: number) => void;
    }) => uploadApi.uploadImagesBatch(files, accessLevel, onProgress),
  });
}
