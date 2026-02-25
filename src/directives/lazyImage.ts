/**
 * 图片懒加载指令
 * 使用方式：v-lazy="imageUrl" 或 v-lazy="{ src: imageUrl, placeholder: placeholderUrl }"
 */

import type { App, Directive, DirectiveBinding } from 'vue';

/**
 * 懒加载配置
 */
interface LazyImageOptions {
  src: string;
  placeholder?: string;
  errorImage?: string;
  rootMargin?: string;
  threshold?: number;
}

/**
 * 默认占位图
 */
const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E';

/**
 * 默认错误图
 */
const DEFAULT_ERROR_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3E加载失败%3C/text%3E%3C/svg%3E';

/**
 * Intersection Observer 实例缓存
 */
const observerCache = new WeakMap<HTMLImageElement, IntersectionObserver>();

/**
 * 创建 Intersection Observer
 */
function createObserver(
  img: HTMLImageElement,
  options: LazyImageOptions
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage(img, options);
          observer.unobserve(img);
          observerCache.delete(img);
        }
      });
    },
    {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
    }
  );

  return observer;
}

/**
 * 加载图片
 */
function loadImage(img: HTMLImageElement, options: LazyImageOptions) {
  const { src, errorImage } = options;

  // 添加加载类名
  img.classList.add('lazy-loading');

  // 创建临时图片对象预加载
  const tempImage = new Image();

  tempImage.onload = () => {
    img.src = src;
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
  };

  tempImage.onerror = () => {
    img.src = errorImage || DEFAULT_ERROR_IMAGE;
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-error');
  };

  tempImage.src = src;
}

/**
 * 解析指令绑定值
 */
function parseBinding(binding: DirectiveBinding): LazyImageOptions {
  if (typeof binding.value === 'string') {
    return { src: binding.value };
  }
  return binding.value;
}

/**
 * 懒加载指令
 */
export const lazyImage: Directive<HTMLImageElement, string | LazyImageOptions> = {
  mounted(el, binding) {
    const options = parseBinding(binding);

    // 设置占位图
    el.src = options.placeholder || DEFAULT_PLACEHOLDER;

    // 创建并启动观察器
    const observer = createObserver(el, options);
    observer.observe(el);
    observerCache.set(el, observer);
  },

  updated(el, binding) {
    const options = parseBinding(binding);
    const oldOptions = parseBinding({ ...binding, value: binding.oldValue });

    // 如果 src 改变，重新加载
    if (options.src !== oldOptions.src) {
      // 停止旧的观察器
      const oldObserver = observerCache.get(el);
      if (oldObserver) {
        oldObserver.unobserve(el);
        observerCache.delete(el);
      }

      // 重置状态
      el.classList.remove('lazy-loading', 'lazy-loaded', 'lazy-error');
      el.src = options.placeholder || DEFAULT_PLACEHOLDER;

      // 创建新的观察器
      const observer = createObserver(el, options);
      observer.observe(el);
      observerCache.set(el, observer);
    }
  },

  unmounted(el) {
    // 清理观察器
    const observer = observerCache.get(el);
    if (observer) {
      observer.unobserve(el);
      observerCache.delete(el);
    }
  },
};

/**
 * 注册指令
 * @param app - Vue 应用实例
 */
export function registerLazyImageDirective(app: App) {
  app.directive('lazy', lazyImage);
}
