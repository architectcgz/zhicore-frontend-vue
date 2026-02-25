# 图片上传与懒加载使用指南

## 图片上传组件 (ImageUpload)

### 基本用法

```vue
<template>
  <ImageUpload
    @success="handleUploadSuccess"
    @error="handleUploadError"
  />
</template>

<script setup lang="ts">
import ImageUpload from '@/components/common/ImageUpload.vue';
import type { ImageUploadResult } from '@/composables/useImageUpload';

const handleUploadSuccess = (result: ImageUploadResult) => {
  console.log('上传成功:', result);
  // result.url - 原图 URL
  // result.thumbUrl - 缩略图 URL
  // result.mediumUrl - 中等尺寸 URL
  // result.largeUrl - 大尺寸 URL
};

const handleUploadError = (error: Error) => {
  console.error('上传失败:', error);
};
</script>
```

### 多文件上传

```vue
<template>
  <ImageUpload
    multiple
    :max-size="10"
    @success="handleMultipleUpload"
  />
</template>

<script setup lang="ts">
const handleMultipleUpload = (results: ImageUploadResult[]) => {
  console.log('上传了', results.length, '张图片');
};
</script>
```

### 自定义配置

```vue
<template>
  <ImageUpload
    :max-size="5"
    accept="image/jpeg,image/png"
    :auto-compress="true"
    :enable-paste="true"
  />
</template>
```

### 获取上传结果

```vue
<template>
  <ImageUpload ref="uploadRef" />
  <button @click="getResults">获取上传结果</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const uploadRef = ref();

const getResults = () => {
  const results = uploadRef.value?.getUploadResults();
  console.log('已上传的图片:', results);
};
</script>
```

## 图片懒加载

### 方式 1: 使用 LazyImage 组件

```vue
<template>
  <LazyImage
    :src="imageUrl"
    alt="图片描述"
    :width="800"
    :height="600"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import LazyImage from '@/components/common/LazyImage.vue';

const imageUrl = 'https://example.com/image.jpg';

const handleLoad = () => {
  console.log('图片加载成功');
};

const handleError = () => {
  console.error('图片加载失败');
};
</script>
```

### 方式 2: 使用 v-lazy 指令

```vue
<template>
  <!-- 简单用法 -->
  <img v-lazy="imageUrl" alt="图片描述" />

  <!-- 带配置 -->
  <img
    v-lazy="{
      src: imageUrl,
      placeholder: placeholderUrl,
      errorImage: errorImageUrl,
      rootMargin: '100px',
      threshold: 0.1
    }"
    alt="图片描述"
  />
</template>

<script setup lang="ts">
const imageUrl = 'https://example.com/image.jpg';
const placeholderUrl = '/placeholder.png';
const errorImageUrl = '/error.png';
</script>
```

### 方式 3: 使用 useLazyImage Composable

```vue
<template>
  <div ref="containerRef">
    <img data-src="https://example.com/image1.jpg" alt="图片1" />
    <img data-src="https://example.com/image2.jpg" alt="图片2" />
    <img data-src="https://example.com/image3.jpg" alt="图片3" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLazyImage } from '@/composables/useLazyImage';

const containerRef = ref<HTMLElement>();
const { setupLazyLoading } = useLazyImage({
  rootMargin: '50px',
  threshold: 0.01,
});

onMounted(() => {
  if (containerRef.value) {
    setupLazyLoading(containerRef.value);
  }
});
</script>
```

### 方式 4: 使用 useAutoLazyImage (自动化)

```vue
<template>
  <div ref="containerRef">
    <img data-src="https://example.com/image1.jpg" alt="图片1" />
    <img data-src="https://example.com/image2.jpg" alt="图片2" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAutoLazyImage } from '@/composables/useLazyImage';

const containerRef = ref<HTMLElement>();

// 自动在挂载时设置懒加载，卸载时清理
useAutoLazyImage(containerRef, {
  rootMargin: '100px',
  threshold: 0.05,
});
</script>
```

## 在文章编辑器中使用

```vue
<template>
  <div class="editor">
    <ImageUpload
      ref="uploadRef"
      @success="handleImageUpload"
    />
    <textarea v-model="content" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUpload from '@/components/common/ImageUpload.vue';
import type { ImageUploadResult } from '@/composables/useImageUpload';

const content = ref('');

const handleImageUpload = (result: ImageUploadResult) => {
  // 插入 Markdown 图片语法
  const markdown = `![${result.filename}](${result.url})`;
  content.value += markdown;
};
</script>
```

## 在文章列表中使用懒加载

```vue
<template>
  <div class="post-list">
    <div v-for="post in posts" :key="post.id" class="post-card">
      <LazyImage
        :src="post.coverImage"
        :alt="post.title"
        class="post-cover"
      />
      <h3>{{ post.title }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LazyImage from '@/components/common/LazyImage.vue';

const posts = ref([
  { id: 1, title: '文章1', coverImage: 'https://example.com/1.jpg' },
  { id: 2, title: '文章2', coverImage: 'https://example.com/2.jpg' },
]);
</script>
```

## 配置选项

### ImageUpload 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| multiple | boolean | false | 是否允许多选 |
| disabled | boolean | false | 是否禁用 |
| maxSize | number | 5 | 最大文件大小（MB） |
| accept | string | 'image/jpeg,image/png,image/gif,image/webp' | 允许的文件类型 |
| autoCompress | boolean | true | 是否自动压缩 |
| enablePaste | boolean | true | 是否启用粘贴上传 |

### LazyImage 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | string | - | 图片源地址（必填） |
| srcset | string | - | 响应式图片源集 |
| alt | string | '' | 图片替代文本 |
| placeholder | string | - | 占位图 URL |
| errorImage | string | - | 错误图 URL |
| width | string \| number | - | 图片宽度 |
| height | string \| number | - | 图片高度 |
| eager | boolean | false | 是否立即加载 |
| rootMargin | string | '50px' | 根元素边距 |
| threshold | number | 0.01 | 可见性阈值 |

## 样式定制

### 懒加载状态样式

```css
/* 加载中 */
.lazy-loading {
  opacity: 0.6;
  background-color: #f0f0f0;
}

/* 加载完成 */
.lazy-loaded {
  opacity: 1;
  animation: fadeIn 0.3s ease-in-out;
}

/* 加载失败 */
.lazy-error {
  opacity: 0.5;
  filter: grayscale(100%);
}
```

## 性能优化建议

1. **使用合适的图片格式**
   - JPEG: 适合照片
   - PNG: 适合图标、透明图
   - WebP: 现代浏览器的最佳选择

2. **设置合适的 rootMargin**
   - 提前加载: `rootMargin: '100px'`
   - 延迟加载: `rootMargin: '0px'`

3. **使用响应式图片**
   ```vue
   <LazyImage
     :src="image.large"
     :srcset="`${image.small} 400w, ${image.medium} 800w, ${image.large} 1600w`"
   />
   ```

4. **启用图片压缩**
   - 大于 500KB 的图片会自动压缩
   - 可以通过 `autoCompress` 属性控制

5. **使用 CDN**
   - 配置 `VITE_CDN_URL` 环境变量
   - 图片会自动使用 CDN 地址
