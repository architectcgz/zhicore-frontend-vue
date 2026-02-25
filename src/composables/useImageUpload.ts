/**
 * 图片上传 Composable
 * 提供图片上传、验证、压缩等功能
 * 使用 zhicore-upload 微服务进行文件上传
 */

import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadApi } from '@/api/upload';

/**
 * 图片验证配置
 */
interface ImageValidationConfig {
  maxSize: number; // 最大文件大小（字节）
  maxWidth?: number; // 最大宽度（像素）
  maxHeight?: number; // 最大高度（像素）
  allowedTypes: string[]; // 允许的 MIME 类型
}

/**
 * 图片上传结果
 */
export interface ImageUploadResult {
  fileId: string; // 文件ID（用于传递给后端）
  url: string;
  thumbUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  filename: string;
  size: number;
}

/**
 * 默认验证配置
 */
const DEFAULT_VALIDATION_CONFIG: ImageValidationConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 4096,
  maxHeight: 4096,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

/**
 * 图片上传 Hook
 */
export function useImageUpload(config?: Partial<ImageValidationConfig>) {
  const validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  const uploading = ref(false);
  const progress = ref(0);

  /**
   * 验证图片文件
   * @param file 图片文件
   * @throws Error 验证失败时抛出错误
   */
  const validateImage = async (file: File): Promise<void> => {
    // 验证文件类型
    if (!validationConfig.allowedTypes.includes(file.type)) {
      throw new Error(
        `不支持的图片格式。支持的格式：${validationConfig.allowedTypes
          .map((type) => type.split('/')[1])
          .join(', ')}`
      );
    }

    // 验证文件大小
    if (file.size > validationConfig.maxSize) {
      const maxSizeMB = (validationConfig.maxSize / (1024 * 1024)).toFixed(1);
      throw new Error(`图片大小不能超过 ${maxSizeMB}MB`);
    }

    // 验证图片尺寸
    if (validationConfig.maxWidth || validationConfig.maxHeight) {
      const dimensions = await getImageDimensions(file);

      if (
        validationConfig.maxWidth &&
        dimensions.width > validationConfig.maxWidth
      ) {
        throw new Error(
          `图片宽度不能超过 ${validationConfig.maxWidth}px`
        );
      }

      if (
        validationConfig.maxHeight &&
        dimensions.height > validationConfig.maxHeight
      ) {
        throw new Error(
          `图片高度不能超过 ${validationConfig.maxHeight}px`
        );
      }
    }
  };

  /**
   * 获取图片尺寸
   * @param file 图片文件
   * @returns 图片尺寸
   */
  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error('无法读取图片尺寸'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('无法读取图片文件'));
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * 压缩图片
   * @param file 原始图片文件
   * @param maxSize 最大尺寸（像素）
   * @param quality 压缩质量（0-1）
   * @returns 压缩后的文件
   */
  const compressImage = async (
    file: File,
    maxSize: number = 1600,
    quality: number = 0.9
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('无法创建 Canvas 上下文'));
            return;
          }

          // 计算新尺寸
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('图片压缩失败'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => {
          reject(new Error('无法加载图片'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('无法读取图片文件'));
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * 上传图片
   * @param file 图片文件
   * @param shouldCompress 是否压缩图片
   * @returns 上传结果
   */
  const uploadImage = async (
    file: File,
    shouldCompress: boolean = true
  ): Promise<ImageUploadResult> => {
    try {
      uploading.value = true;
      progress.value = 0;

      // 验证图片
      await validateImage(file);

      // 压缩图片（可选）
      let fileToUpload = file;
      if (shouldCompress && file.size > 500 * 1024) {
        // 大于 500KB 才压缩
        fileToUpload = await compressImage(file);
      }

      // 上传图片到 zhicore-upload 服务
      const response = await uploadApi.uploadImage(fileToUpload, (p) => {
        progress.value = p;
      });

      ElMessage.success('图片上传成功');

      return {
        fileId: response.fileId, // 返回 fileId 用于传递给后端
        url: response.url,
        filename: file.name,
        size: response.fileSize,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '图片上传失败';
      ElMessage.error(message);
      throw error;
    } finally {
      uploading.value = false;
      progress.value = 0;
    }
  };

  /**
   * 批量上传图片
   * @param files 图片文件数组
   * @param shouldCompress 是否压缩图片
   * @returns 上传结果数组
   */
  const uploadImages = async (
    files: File[],
    shouldCompress: boolean = true
  ): Promise<ImageUploadResult[]> => {
    const results: ImageUploadResult[] = [];

    for (const file of files) {
      try {
        const result = await uploadImage(file, shouldCompress);
        results.push(result);
      } catch (error) {
        console.error(`上传图片 ${file.name} 失败:`, error);
      }
    }

    return results;
  };

  return {
    uploading,
    progress,
    validateImage,
    compressImage,
    uploadImage,
    uploadImages,
  };
}
