<template>
  <div class="image-upload">
    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{
        'is-dragging': isDragging,
        'is-disabled': disabled || uploading,
      }"
      @click="handleClick"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
    >
      <!-- 文件输入框 -->
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled || uploading"
        class="file-input"
        @change="handleFileChange"
      >

      <!-- 上传提示 -->
      <div
        v-if="!uploading"
        class="upload-hint"
      >
        <el-icon
          :size="48"
          class="upload-icon"
        >
          <Upload />
        </el-icon>
        <p class="hint-text">
          点击或拖拽图片到此区域上传
        </p>
        <p class="hint-subtext">
          支持 {{ allowedFormats.join(', ') }} 格式，最大 {{ maxSizeMB }}MB
        </p>
      </div>

      <!-- 上传进度 -->
      <div
        v-else
        class="upload-progress"
      >
        <el-progress
          type="circle"
          :percentage="progress"
          :width="80"
        />
        <p class="progress-text">
          上传中...
        </p>
      </div>
    </div>

    <!-- 图片预览列表 -->
    <div
      v-if="previewList.length > 0"
      class="preview-list"
    >
      <div
        v-for="(item, index) in previewList"
        :key="index"
        class="preview-item"
      >
        <img
          :src="item.url"
          :alt="item.filename"
          class="preview-image"
        >
        <div class="preview-mask">
          <el-icon
            class="preview-icon"
            @click="handlePreview(item)"
          >
            <ZoomIn />
          </el-icon>
          <el-icon
            class="preview-icon"
            @click="handleRemove(index)"
          >
            <Delete />
          </el-icon>
        </div>
        <div class="preview-name">
          {{ item.filename }}
        </div>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图片预览"
      width="80%"
      append-to-body
    >
      <img
        v-if="previewImageUrl"
        :src="previewImageUrl"
        alt="预览图片"
        class="preview-dialog-image"
      >
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * 图片上传组件
 * 支持点击上传、拖拽上传、粘贴上传
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Upload, ZoomIn, Delete } from '@element-plus/icons-vue';
import { useImageUpload, type ImageUploadResult } from '@/composables/useImageUpload';

/**
 * 组件属性
 */
interface Props {
  // 是否允许多选
  multiple?: boolean;
  // 是否禁用
  disabled?: boolean;
  // 最大文件大小（MB）
  maxSize?: number;
  // 允许的文件类型
  accept?: string;
  // 是否自动压缩
  autoCompress?: boolean;
  // 是否启用粘贴上传
  enablePaste?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  disabled: false,
  maxSize: 5,
  accept: 'image/jpeg,image/png,image/gif,image/webp',
  autoCompress: true,
  enablePaste: true,
});

/**
 * 组件事件
 */
const emit = defineEmits<{
  success: [result: ImageUploadResult | ImageUploadResult[]];
  error: [error: Error];
}>();

// 文件输入框引用
const fileInputRef = ref<HTMLInputElement>();

// 拖拽状态
const isDragging = ref(false);

// 预览对话框
const previewDialogVisible = ref(false);
const previewImageUrl = ref('');

// 预览列表
const previewList = ref<ImageUploadResult[]>([]);

// 使用图片上传 Hook
const { uploading, progress, uploadImage, uploadImages } = useImageUpload({
  maxSize: props.maxSize * 1024 * 1024,
  allowedTypes: props.accept.split(','),
});

// 计算属性：允许的格式
const allowedFormats = computed(() => {
  return props.accept
    .split(',')
    .map((type) => type.split('/')[1].toUpperCase());
});

// 计算属性：最大文件大小（MB）
const maxSizeMB = computed(() => props.maxSize);

/**
 * 处理点击上传
 */
const handleClick = () => {
  if (props.disabled || uploading.value) return;
  fileInputRef.value?.click();
};

/**
 * 处理文件选择
 */
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (files.length === 0) return;

  await handleFiles(files);

  // 清空输入框，允许重复选择同一文件
  target.value = '';
};

/**
 * 处理拖拽进入
 */
const handleDragOver = (_event: DragEvent) => {
  if (props.disabled || uploading.value) return;
  isDragging.value = true;
};

/**
 * 处理拖拽离开
 */
const handleDragLeave = () => {
  isDragging.value = false;
};

/**
 * 处理拖拽放下
 */
const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;

  if (props.disabled || uploading.value) return;

  const files = Array.from(event.dataTransfer?.files || []).filter((file) =>
    file.type.startsWith('image/')
  );

  if (files.length === 0) return;

  await handleFiles(files);
};

/**
 * 处理粘贴上传
 */
const handlePaste = async (event: ClipboardEvent) => {
  if (!props.enablePaste || props.disabled || uploading.value) return;

  const items = Array.from(event.clipboardData?.items || []);
  const imageItems = items.filter((item) => item.type.startsWith('image/'));

  if (imageItems.length === 0) return;

  const files = await Promise.all(
    imageItems.map((item) => item.getAsFile()).filter(Boolean) as File[]
  );

  if (files.length > 0) {
    event.preventDefault();
    await handleFiles(files);
  }
};

/**
 * 处理文件上传
 */
const handleFiles = async (files: File[]) => {
  try {
    if (props.multiple) {
      // 多文件上传
      const results = await uploadImages(files, props.autoCompress);
      previewList.value.push(...results);
      emit('success', results);
    } else {
      // 单文件上传
      const result = await uploadImage(files[0], props.autoCompress);
      previewList.value = [result];
      emit('success', result);
    }
  } catch (error) {
    emit('error', error as Error);
  }
};

/**
 * 处理预览
 */
const handlePreview = (item: ImageUploadResult) => {
  previewImageUrl.value = item.largeUrl || item.url;
  previewDialogVisible.value = true;
};

/**
 * 处理移除
 */
const handleRemove = (index: number) => {
  previewList.value.splice(index, 1);
};

/**
 * 获取上传结果
 */
const getUploadResults = (): ImageUploadResult[] => {
  return previewList.value;
};

/**
 * 清空上传列表
 */
const clearUploadList = () => {
  previewList.value = [];
};

// 暴露方法给父组件
defineExpose({
  getUploadResults,
  clearUploadList,
});

// 生命周期：挂载时添加粘贴事件监听
onMounted(() => {
  if (props.enablePaste) {
    document.addEventListener('paste', handlePaste);
  }
});

// 生命周期：卸载时移除粘贴事件监听
onUnmounted(() => {
  if (props.enablePaste) {
    document.removeEventListener('paste', handlePaste);
  }
});
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  background-color: var(--el-fill-color-lighter);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover:not(.is-disabled) {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.upload-area.is-dragging {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  transform: scale(1.02);
}

.upload-area.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.file-input {
  display: none;
}

.upload-hint {
  text-align: center;
  padding: 2rem;
}

.upload-icon {
  color: var(--el-color-primary);
  margin-bottom: 1rem;
}

.hint-text {
  font-size: 16px;
  color: var(--el-text-color-primary);
  margin: 0.5rem 0;
}

.hint-subtext {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.upload-progress {
  text-align: center;
}

.progress-text {
  margin-top: 1rem;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.preview-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-item:hover .preview-mask {
  opacity: 1;
}

.preview-icon {
  font-size: 20px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-icon:hover {
  transform: scale(1.2);
}

.preview-name {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-dialog-image {
  width: 100%;
  height: auto;
  display: block;
}
</style>
