# ARIA 属性使用示例

本文档展示如何在组件中正确使用 ARIA 属性以提高可访问性。

## 1. 图片 Alt 文本

### 用户头像
```vue
<template>
  <img
    :src="user.avatar"
    :alt="generateImageAlt({ type: 'avatar', username: user.username })"
    class="user-avatar"
  >
</template>

<script setup lang="ts">
import { generateImageAlt } from '@/utils/ariaHelpers';
</script>
```

### 文章封面
```vue
<template>
  <img
    :src="post.coverImage"
    :alt="generateImageAlt({ type: 'cover', title: post.title })"
    class="post-cover"
  >
</template>
```

### 装饰性图片
```vue
<template>
  <!-- 装饰性图片使用空 alt -->
  <img
    src="/decorative-pattern.png"
    alt=""
    role="presentation"
  >
</template>
```

## 2. 按钮 Aria-Label

### 点赞按钮
```vue
<template>
  <button
    :aria-label="generateButtonLabel({ 
      action: 'like', 
      target: post.title,
      state: isLiked 
    })"
    @click="handleLike"
  >
    <i :class="isLiked ? 'el-icon-star-on' : 'el-icon-star-off'" />
    <span class="sr-only">{{ isLiked ? '取消点赞' : '点赞' }}</span>
  </button>
</template>

<script setup lang="ts">
import { generateButtonLabel } from '@/utils/ariaHelpers';
</script>
```

### 关闭按钮
```vue
<template>
  <button
    :aria-label="generateButtonLabel({ action: 'close' })"
    @click="handleClose"
  >
    <i class="el-icon-close" />
  </button>
</template>
```

## 3. 表单字段

### 输入框
```vue
<template>
  <div class="form-field">
    <label for="username-input">用户名</label>
    <input
      id="username-input"
      v-model="username"
      type="text"
      :aria-label="generateFormLabel({ 
        field: 'username', 
        required: true,
        placeholder: '请输入用户名'
      })"
      :aria-required="true"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? 'username-error' : undefined"
    >
    <span
      v-if="hasError"
      id="username-error"
      role="alert"
      class="error-message"
    >
      用户名不能为空
    </span>
  </div>
</template>

<script setup lang="ts">
import { generateFormLabel } from '@/utils/ariaHelpers';
</script>
```

### 搜索框
```vue
<template>
  <div role="search">
    <label for="search-input" class="sr-only">搜索</label>
    <input
      id="search-input"
      v-model="searchQuery"
      type="search"
      :aria-label="generateFormLabel({ field: 'search' })"
      placeholder="搜索文章、用户..."
      @keydown.enter="handleSearch"
    >
  </div>
</template>
```

## 4. 链接

### 文章链接
```vue
<template>
  <a
    :href="`/posts/${post.id}`"
    :aria-label="generateLinkLabel({ type: 'post', title: post.title })"
  >
    {{ post.title }}
  </a>
</template>

<script setup lang="ts">
import { generateLinkLabel } from '@/utils/ariaHelpers';
</script>
```

### 外部链接
```vue
<template>
  <a
    :href="externalUrl"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="generateLinkLabel({ type: 'external', url: externalUrl })"
  >
    {{ linkText }}
    <i class="el-icon-top-right" aria-hidden="true" />
    <span class="sr-only">（在新窗口打开）</span>
  </a>
</template>
```

## 5. 动态内容

### 加载状态
```vue
<template>
  <div
    v-if="loading"
    role="status"
    :aria-label="generateStatusLabel({ type: 'loading' })"
  >
    <LoadingSpinner />
    <span class="sr-only">加载中，请稍候...</span>
  </div>
</template>

<script setup lang="ts">
import { generateStatusLabel } from '@/utils/ariaHelpers';
</script>
```

### 空状态
```vue
<template>
  <div
    v-if="items.length === 0"
    role="status"
    :aria-label="generateStatusLabel({ type: 'empty', message: '暂无文章' })"
  >
    <EmptyState message="暂无文章" />
  </div>
</template>
```

### 实时更新
```vue
<template>
  <div>
    <AriaLive
      :message="liveMessage"
      :politeness="livePoliteness"
    />
    
    <button @click="handleUpdate">
      更新内容
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AriaLive from '@/components/common/AriaLive.vue';

const liveMessage = ref('');
const livePoliteness = ref<'polite' | 'assertive'>('polite');

const handleUpdate = () => {
  liveMessage.value = '内容已更新';
  livePoliteness.value = 'polite';
};
</script>
```

## 6. 模态框

### 对话框
```vue
<template>
  <div
    v-if="isOpen"
    role="dialog"
    :aria-modal="true"
    :aria-labelledby="labelId"
    :aria-describedby="descId"
    class="modal"
  >
    <h2 :id="labelId">确认删除</h2>
    <p :id="descId">确定要删除这篇文章吗？此操作不可撤销。</p>
    
    <div class="modal-actions">
      <button @click="handleCancel">取消</button>
      <button @click="handleConfirm">确认</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { generateId } from '@/utils/ariaHelpers';

const isOpen = ref(false);
const labelId = generateId('modal-label');
const descId = generateId('modal-desc');
</script>
```

## 7. 下拉菜单

### 用户菜单
```vue
<template>
  <div class="dropdown">
    <button
      :aria-label="generateMenuLabel({ type: 'user', username: user.username })"
      :aria-expanded="isOpen.toString()"
      :aria-controls="menuId"
      @click="toggleMenu"
    >
      <img :src="user.avatar" :alt="user.username" />
    </button>
    
    <ul
      v-if="isOpen"
      :id="menuId"
      role="menu"
      :aria-labelledby="buttonId"
    >
      <li role="menuitem">
        <a href="/profile">个人主页</a>
      </li>
      <li role="menuitem">
        <a href="/settings">设置</a>
      </li>
      <li role="menuitem">
        <button @click="handleLogout">退出登录</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { generateId, generateMenuLabel } from '@/utils/ariaHelpers';

const isOpen = ref(false);
const menuId = generateId('menu');
const buttonId = generateId('menu-button');
</script>
```

## 8. 标签页

### 内容标签页
```vue
<template>
  <div class="tabs">
    <div role="tablist" :aria-label="'内容分类'">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="(activeTab === index).toString()"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="activeTab === index ? 0 : -1"
        @click="setActiveTab(index)"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div
      v-for="(tab, index) in tabs"
      :key="tab.id"
      :id="`panel-${tab.id}`"
      role="tabpanel"
      :aria-labelledby="`tab-${tab.id}`"
      :hidden="activeTab !== index"
    >
      {{ tab.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref(0);
const tabs = ref([
  { id: 'posts', name: '文章', content: '...' },
  { id: 'favorites', name: '收藏', content: '...' },
]);
</script>
```

## 9. 进度条

### 上传进度
```vue
<template>
  <div
    role="progressbar"
    :aria-valuenow="progress"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuetext="`已上传 ${progress}%`"
  >
    <div class="progress-bar" :style="{ width: `${progress}%` }" />
    <span class="sr-only">上传进度：{{ progress }}%</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const progress = ref(0);
</script>
```

## 10. 通知

### 警告通知
```vue
<template>
  <div
    role="alert"
    aria-live="assertive"
    class="notification notification--error"
  >
    <i class="el-icon-warning" aria-hidden="true" />
    <span>{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const errorMessage = ref('操作失败，请重试');
</script>
```

### 成功通知
```vue
<template>
  <div
    role="status"
    aria-live="polite"
    class="notification notification--success"
  >
    <i class="el-icon-success" aria-hidden="true" />
    <span>{{ successMessage }}</span>
  </div>
</template>
```

## 11. 列表

### 文章列表
```vue
<template>
  <div role="feed" :aria-label="'文章列表'">
    <article
      v-for="(post, index) in posts"
      :key="post.id"
      :aria-posinset="index + 1"
      :aria-setsize="posts.length"
      :aria-label="generateListItemLabel({ 
        type: 'post', 
        index, 
        total: posts.length,
        title: post.title 
      })"
    >
      <h2>{{ post.title }}</h2>
      <p>{{ post.excerpt }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { generateListItemLabel } from '@/utils/ariaHelpers';
</script>
```

## 12. 可展开内容

### 折叠面板
```vue
<template>
  <div class="accordion">
    <button
      :aria-expanded="isExpanded.toString()"
      :aria-controls="contentId"
      @click="toggle"
    >
      {{ title }}
      <i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" aria-hidden="true" />
    </button>
    
    <div
      :id="contentId"
      :hidden="!isExpanded"
      role="region"
      :aria-labelledby="buttonId"
    >
      {{ content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { generateId } from '@/utils/ariaHelpers';

const isExpanded = ref(false);
const contentId = generateId('accordion-content');
const buttonId = generateId('accordion-button');
</script>
```

## 最佳实践

1. **始终为图片提供 alt 文本**
   - 内容图片：描述图片内容
   - 装饰图片：使用空 alt (`alt=""`)

2. **为图标按钮添加 aria-label**
   - 没有文本的按钮必须有 aria-label
   - 描述按钮的功能，而不是图标的外观

3. **使用语义化 HTML**
   - 优先使用原生 HTML 元素（button、a、input 等）
   - 必要时使用 ARIA role 补充

4. **管理焦点**
   - 模态框打开时，焦点移到模态框
   - 模态框关闭时，焦点返回触发元素

5. **提供状态反馈**
   - 使用 aria-live 宣布动态内容变化
   - 使用 role="status" 或 role="alert"

6. **键盘可访问**
   - 所有交互元素都可以通过键盘访问
   - 提供键盘快捷键

7. **避免冗余**
   - 不要同时使用 aria-label 和可见文本
   - 使用 aria-hidden="true" 隐藏装饰性元素

8. **测试**
   - 使用屏幕阅读器测试
   - 使用键盘导航测试
   - 使用自动化工具（axe、WAVE）检查
