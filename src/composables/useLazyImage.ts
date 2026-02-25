/**
 * 图片懒加载 Composable
 * 使用 Intersection Observer API 实现图片懒加载
 */

import { onMounted, onUnmounted, ref, Ref } from 'vue';

/**
 * 懒加载配置
 */
interface LazyImageConfig {
  // 根元素边距（提前加载距离）
  rootMargin?: string;
  // 可见性阈值
  threshold?: number | number[];
  // 占位图 URL
  placeholder?: string;
  // 错误图 URL
  errorImage?: string;
  // 加载类名
  loadingClass?: string;
  // 加载完成类名
  loadedClass?: string;
  // 错误类名
  errorClass?: string;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: LazyImageConfig = {
  rootMargin: '50px',
  threshold: 0.01,
  placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3E加载中...%3C/text%3E%3C/svg%3E',
  errorImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3E加载失败%3C/text%3E%3C/svg%3E',
  loadingClass: 'lazy-loading',
  loadedClass: 'lazy-loaded',
  errorClass: 'lazy-error',
};

/**
 * 图片懒加载 Hook
 * @param config 懒加载配置
 */
export function useLazyImage(config?: LazyImageConfig) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const observer = ref<IntersectionObserver | null>(null);
  const observedElements = ref<Set<HTMLImageElement>>(new Set());

  /**
   * 加载图片
   * @param img 图片元素
   */
  const loadImage = (img: HTMLImageElement) => {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src) return;

    // 添加加载类名
    if (mergedConfig.loadingClass) {
      img.classList.add(mergedConfig.loadingClass);
    }

    // 创建新图片对象预加载
    const tempImage = new Image();

    tempImage.onload = () => {
      // 加载成功，设置图片源
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }

      // 移除 data 属性
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');

      // 更新类名
      if (mergedConfig.loadingClass) {
        img.classList.remove(mergedConfig.loadingClass);
      }
      if (mergedConfig.loadedClass) {
        img.classList.add(mergedConfig.loadedClass);
      }

      // 停止观察
      if (observer.value) {
        observer.value.unobserve(img);
      }
      observedElements.value.delete(img);
    };

    tempImage.onerror = () => {
      // 加载失败，设置错误图片
      if (mergedConfig.errorImage) {
        img.src = mergedConfig.errorImage;
      }

      // 更新类名
      if (mergedConfig.loadingClass) {
        img.classList.remove(mergedConfig.loadingClass);
      }
      if (mergedConfig.errorClass) {
        img.classList.add(mergedConfig.errorClass);
      }

      // 停止观察
      if (observer.value) {
        observer.value.unobserve(img);
      }
      observedElements.value.delete(img);
    };

    // 开始加载
    tempImage.src = src;
    if (srcset) {
      tempImage.srcset = srcset;
    }
  };

  /**
   * 初始化 Intersection Observer
   */
  const initObserver = () => {
    if (observer.value) return;

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            loadImage(img);
          }
        });
      },
      {
        rootMargin: mergedConfig.rootMargin,
        threshold: mergedConfig.threshold,
      }
    );
  };

  /**
   * 观察图片元素
   * @param img 图片元素或图片元素数组
   */
  const observe = (img: HTMLImageElement | HTMLImageElement[]) => {
    if (!observer.value) {
      initObserver();
    }

    const images = Array.isArray(img) ? img : [img];

    images.forEach((image) => {
      // 设置占位图
      if (!image.src && mergedConfig.placeholder) {
        image.src = mergedConfig.placeholder;
      }

      // 开始观察
      if (observer.value && image.dataset.src) {
        observer.value.observe(image);
        observedElements.value.add(image);
      }
    });
  };

  /**
   * 停止观察图片元素
   * @param img 图片元素或图片元素数组
   */
  const unobserve = (img: HTMLImageElement | HTMLImageElement[]) => {
    if (!observer.value) return;

    const images = Array.isArray(img) ? img : [img];

    images.forEach((image) => {
      observer.value!.unobserve(image);
      observedElements.value.delete(image);
    });
  };

  /**
   * 设置懒加载图片
   * 自动查找容器内所有带 data-src 属性的图片
   * @param container 容器元素（默认为 document.body）
   */
  const setupLazyLoading = (container: HTMLElement = document.body) => {
    const images = container.querySelectorAll<HTMLImageElement>(
      'img[data-src]'
    );

    if (images.length > 0) {
      observe(Array.from(images));
    }
  };

  /**
   * 强制加载所有图片
   */
  const loadAll = () => {
    observedElements.value.forEach((img) => {
      loadImage(img);
    });
  };

  /**
   * 销毁观察器
   */
  const destroy = () => {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
    observedElements.value.clear();
  };

  // 组件卸载时自动销毁
  onUnmounted(() => {
    destroy();
  });

  return {
    observe,
    unobserve,
    setupLazyLoading,
    loadAll,
    destroy,
  };
}

/**
 * 自动懒加载 Hook
 * 自动在挂载时设置懒加载，卸载时清理
 * @param containerRef 容器元素引用
 * @param config 懒加载配置
 */
export function useAutoLazyImage(
  containerRef: Ref<HTMLElement | undefined>,
  config?: LazyImageConfig
) {
  const { setupLazyLoading, destroy } = useLazyImage(config);

  onMounted(() => {
    if (containerRef.value) {
      setupLazyLoading(containerRef.value);
    }
  });

  onUnmounted(() => {
    destroy();
  });

  return {
    setupLazyLoading,
  };
}
