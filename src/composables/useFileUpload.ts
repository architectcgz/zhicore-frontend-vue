/**
 * 通用文件上传 Composable
 * 统一管理上传状态、进度、取消和批量上传编排。
 */

import {
  computed,
  readonly,
  shallowRef,
  toValue,
  type MaybeRefOrGetter,
} from 'vue';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'canceled';

export interface FileUploadContext {
  onProgress: (progress: number) => void;
  signal: AbortSignal;
}

export interface UseFileUploadOptions<TInput, TResult> {
  upload: (input: TInput, context: FileUploadContext) => Promise<TResult>;
  mapError?: (error: unknown) => Error;
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(progress)));
}

function createCanceledError(): Error {
  return new Error('上传已取消');
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const abortErrorNames = new Set(['AbortError', 'CanceledError']);
  return abortErrorNames.has(error.name) || (error as Error & { code?: string }).code === 'ERR_CANCELED';
}

function defaultMapError(error: unknown): Error {
  if (isAbortError(error)) {
    return createCanceledError();
  }

  return error instanceof Error ? error : new Error('上传失败');
}

export function useFileUpload<TInput, TResult>(
  options: MaybeRefOrGetter<UseFileUploadOptions<TInput, TResult>>
) {
  const status = shallowRef<UploadStatus>('idle');
  const progress = shallowRef(0);
  const totalCount = shallowRef(0);
  const completedCount = shallowRef(0);
  const currentIndex = shallowRef(0);
  const error = shallowRef<Error | null>(null);
  const lastResult = shallowRef<TResult | null>(null);
  const results = shallowRef<TResult[]>([]);
  const activeController = shallowRef<AbortController | null>(null);

  const isUploading = computed(() => status.value === 'uploading');
  const canCancel = computed(() => isUploading.value && activeController.value !== null);

  function resetState() {
    status.value = 'idle';
    progress.value = 0;
    totalCount.value = 0;
    completedCount.value = 0;
    currentIndex.value = 0;
    error.value = null;
    lastResult.value = null;
    results.value = [];
    activeController.value = null;
  }

  function resolveOptions(): UseFileUploadOptions<TInput, TResult> {
    return toValue(options);
  }

  function createProgressHandler(index: number, total: number) {
    return (itemProgress: number) => {
      const normalizedProgress = clampProgress(itemProgress);
      progress.value = Math.round(((index * 100) + normalizedProgress) / total);
    };
  }

  async function runUploads(inputs: TInput[]): Promise<TResult[]> {
    const resolvedOptions = resolveOptions();
    const controller = new AbortController();

    status.value = 'uploading';
    progress.value = 0;
    totalCount.value = inputs.length;
    completedCount.value = 0;
    currentIndex.value = inputs.length > 0 ? 1 : 0;
    error.value = null;
    lastResult.value = null;
    results.value = [];
    activeController.value = controller;

    const uploadedResults: TResult[] = [];

    try {
      for (let index = 0; index < inputs.length; index += 1) {
        currentIndex.value = index + 1;

        const result = await resolvedOptions.upload(inputs[index], {
          signal: controller.signal,
          onProgress: createProgressHandler(index, inputs.length),
        });

        uploadedResults.push(result);
        results.value = [...uploadedResults];
        lastResult.value = result;
        completedCount.value = index + 1;
        progress.value = Math.round(((index + 1) * 100) / inputs.length);
      }

      status.value = 'success';
      progress.value = inputs.length === 0 ? 0 : 100;
      return uploadedResults;
    } catch (rawError) {
      const mappedError = (resolvedOptions.mapError ?? defaultMapError)(rawError);

      if (isAbortError(rawError) || controller.signal.aborted) {
        status.value = 'canceled';
        error.value = null;
        throw mappedError;
      }

      status.value = 'error';
      error.value = mappedError;
      throw mappedError;
    } finally {
      activeController.value = null;
      if (status.value !== 'uploading') {
        currentIndex.value = 0;
      }
    }
  }

  async function upload(input: TInput): Promise<TResult> {
    const [result] = await runUploads([input]);
    return result;
  }

  async function uploadMany(inputs: TInput[]): Promise<TResult[]> {
    if (inputs.length === 0) {
      resetState();
      return [];
    }

    return runUploads(inputs);
  }

  function cancel() {
    activeController.value?.abort();
  }

  function reset() {
    cancel();
    resetState();
  }

  return {
    status: readonly(status),
    progress: readonly(progress),
    totalCount: readonly(totalCount),
    completedCount: readonly(completedCount),
    currentIndex: readonly(currentIndex),
    error: readonly(error),
    lastResult: readonly(lastResult),
    results: readonly(results),
    isUploading,
    canCancel,
    upload,
    uploadMany,
    cancel,
    reset,
  };
}
