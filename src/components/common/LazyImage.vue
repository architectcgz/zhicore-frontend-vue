<template>
  <img
    ref="imgRef"
    :src="currentSrc"
    :alt="alt"
    :class="imageClass"
    :style="imageStyle"
    @error="handleError"
    @load="handleLoad"
  >
</template>

<script setup lang="ts">
/**
 * 懒加载图片组件
 * 自动处理图片懒加载、占位图和错误处理
 */

import { ref, computed, onMounted, watch } from 'vue';
import { useLazyImage } from '@/composables/useLazyImage';

/**
 * 组件属性
 */
interface Props {
  // 图片源地址
  src: string;
  // 响应式图片源集
  srcset?: string;
  // 图片替代文本
  alt?: string;
  // 占位图 URL
  placeholder?: string;
  // 错误图 URL
  errorImage?: string;
  // 图片宽度
  width?: string | number;
  // 图片高度
  height?: string | number;
  // 是否立即加载（不使用懒加载）
  eager?: boolean;
  // 根元素边距
  rootMargin?: string;
  // 可见性阈值
  threshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  eager: false,
  rootMargin: '50px',
  threshold: 0.01,
});

/**
 * 组件事件
 */
const emit = defineEmits<{
  load: [event: Event];
  error: [event: Event];
}>();

// 图片元素引用
const imgRef = ref<HTMLImageElement>();

// 加载状态
const isLoading = ref(true);
const isError = ref(false);
const isLoaded = ref(false);

// 当前图片源
const currentSrc = ref(
  props.placeholder ||
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E'
);

// 懒加载 Hook
const { observe } = useLazyImage({
  rootMargin: props.rootMargin,
  threshold: props.threshold,
  placeholder: props.placeholder,
  errorImage: props.errorImage,
});

// 计算属性：图片类名
const imageClass = computed(() => ({
  'lazy-image': true,
  'lazy-loading': isLoading.value,
  'lazy-loaded': isLoaded.value,
  'lazy-error': isError.value,
}));

// 计算属性：图片样式
const imageStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  return style;
});

/**
 * 处理图片加载成功
 */
const handleLoad = (event: Event) => {
  isLoading.value = false;
  isLoaded.value = true;
  isError.value = false;
  emit('load', event);
};

/**
 * 处理图片加载失败
 */
const handleError = (event: Event) => {
  isLoading.value = false;
  isError.value = true;
  isLoaded.value = false;

  // 设置错误图片
  if (props.errorImage && imgRef.value) {
    imgRef.value.src = props.errorImage;
  }

  emit('error', event);
};

/**
 * 初始化懒加载
 */
const initLazyLoad = () => {
  if (!imgRef.value) return;

  if (props.eager) {
    // 立即加载
    currentSrc.value = props.src;
    if (props.srcset) {
      imgRef.value.srcset = props.srcset;
    }
  } else {
    // 懒加载
    imgRef.value.dataset.src = props.src;
    if (props.srcset) {
      imgRef.value.dataset.srcset = props.srcset;
    }
    observe(imgRef.value);
  }
};

// 监听 src 变化
watch(
  () => props.src,
  () => {
    if (imgRef.value) {
      isLoading.value = true;
      isLoaded.value = false;
      isError.value = false;
      initLazyLoad();
    }
  }
);

// 组件挂载时初始化
onMounted(() => {
  initLazyLoad();
});
</script>

<style scoped>
.lazy-image {
  display: block;
  width: 100%;
  height: auto;
  transition: opacity 0.3s ease-in-out;
}

.lazy-loading {
  opacity: 0.6;
  background-color: #f0f0f0;
}

.lazy-loaded {
  opacity: 1;
  animation: fadeIn 0.3s ease-in-out;
}

.lazy-error {
  opacity: 0.5;
  filter: grayscale(100%);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
