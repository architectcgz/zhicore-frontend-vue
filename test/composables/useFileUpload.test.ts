import { describe, expect, it, vi } from 'vitest';
import { useFileUpload } from '@/composables/useFileUpload';

describe('useFileUpload', () => {
  it('应该跟踪单文件上传状态和结果', async () => {
    const upload = vi.fn(async (file: string, context: { onProgress: (progress: number) => void }) => {
      context.onProgress(40);
      context.onProgress(100);
      return `${file}-done`;
    });

    const uploader = useFileUpload({
      upload,
    });

    await expect(uploader.upload('cover.png')).resolves.toBe('cover.png-done');

    expect(upload).toHaveBeenCalledTimes(1);
    expect(uploader.status.value).toBe('success');
    expect(uploader.progress.value).toBe(100);
    expect(uploader.completedCount.value).toBe(1);
    expect(uploader.totalCount.value).toBe(1);
    expect(uploader.lastResult.value).toBe('cover.png-done');
    expect(uploader.results.value).toEqual(['cover.png-done']);
    expect(uploader.isUploading.value).toBe(false);
  });

  it('应该按批量上传聚合整体进度', async () => {
    const progressSnapshots: number[] = [];

    const uploader = useFileUpload({
      upload: async (file: string, context) => {
        context.onProgress(50);
        progressSnapshots.push(uploader.progress.value);
        context.onProgress(100);
        progressSnapshots.push(uploader.progress.value);
        return file.toUpperCase();
      },
    });

    await expect(uploader.uploadMany(['a.png', 'b.png'])).resolves.toEqual(['A.PNG', 'B.PNG']);

    expect(progressSnapshots).toEqual([25, 50, 75, 100]);
    expect(uploader.completedCount.value).toBe(2);
    expect(uploader.totalCount.value).toBe(2);
    expect(uploader.progress.value).toBe(100);
  });

  it('应该支持取消上传', async () => {
    const uploader = useFileUpload({
      upload: (_file: string, context) =>
        new Promise<string>((_resolve, reject) => {
          context.signal.addEventListener('abort', () => {
            const error = new Error('canceled');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    });

    const uploadPromise = uploader.upload('avatar.png');

    expect(uploader.canCancel.value).toBe(true);
    uploader.cancel();

    await expect(uploadPromise).rejects.toThrow('上传已取消');
    expect(uploader.status.value).toBe('canceled');
    expect(uploader.error.value).toBeNull();
    expect(uploader.isUploading.value).toBe(false);
  });

  it('应该在上传失败时暴露错误状态', async () => {
    const uploader = useFileUpload({
      upload: async () => {
        throw new Error('上传服务异常');
      },
    });

    await expect(uploader.upload('broken.png')).rejects.toThrow('上传服务异常');

    expect(uploader.status.value).toBe('error');
    expect(uploader.error.value?.message).toBe('上传服务异常');
    expect(uploader.isUploading.value).toBe(false);
  });
});
