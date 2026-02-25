# Pinia Stores 文档

## 概述

本项目使用 **Pinia** 进行客户端状态管理，使用 **TanStack Query** 进行服务端数据管理。这种职责分离确保了清晰的架构和最佳实践。

## 职责划分

### Pinia Stores 职责

Pinia Stores **仅负责客户端状态管理**，包括：

- ✅ **认证状态**：Token、用户信息、登录状态
- ✅ **UI 状态**：主题、面板开关、当前选中项
- ✅ **本地偏好**：语言设置、显示选项
- ✅ **临时状态**：表单草稿、上传进度

### TanStack Query 职责

TanStack Query **负责所有服务端数据管理**，包括：

- ✅ **数据获取**：文章、评论、用户、通知、消息
- ✅ **数据缓存**：自动缓存、失效策略、后台更新
- ✅ **数据变更**：创建、更新、删除操作
- ✅ **乐观更新**：即时 UI 反馈、自动回滚
- ✅ **加载状态**：loading、error、success 状态
- ✅ **分页/无限滚动**：自动管理分页状态

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue Components                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostList.vue │  │ Comments.vue │  │ Header.vue   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │                  │                  │
    ┌─────▼──────┐     ┌────▼─────┐      ┌────▼─────┐
    │  TanStack  │     │ TanStack │      │  Pinia   │
    │   Query    │     │  Query   │      │  Stores  │
    │            │     │          │      │          │
    │ usePostsQ  │     │useComments│     │ useAuth  │
    │ useLikeM   │     │useCreateM │     │ useTheme │
    └─────┬──────┘     └────┬─────┘      └────┬─────┘
          │                  │                  │
          │ (Server Data)    │                  │ (Client State)
          │                  │                  │
    ┌─────▼──────────────────▼─────┐      ┌────▼─────┐
    │      Backend API             │      │LocalStorage│
    │  - Posts                     │      │  - Tokens │
    │  - Comments                  │      │  - Theme  │
    │  - Users                     │      │  - Prefs  │
    └──────────────────────────────┘      └──────────┘
```

## Store 列表

### 1. Auth Store (`auth.ts`)

**职责**：管理用户认证状态

**状态**：
- `user`: 当前用户信息
- `accessToken`: 访问令牌
- `refreshToken`: 刷新令牌
- `isAuthenticated`: 是否已认证
- `isLoading`: 加载状态

**主要方法**：
- `login()`: 用户登录
- `logout()`: 用户登出
- `register()`: 用户注册
- `refreshAccessToken()`: 刷新令牌
- `initAuth()`: 初始化认证状态

**使用示例**：
```typescript
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();

// 检查认证状态
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user);
}

// 登录
await authStore.login({ username, password });

// 登出
await authStore.logout();
```

### 2. Theme Store (`theme.ts`)

**职责**：管理应用主题状态

**状态**：
- `theme`: 用户选择的主题 (light/dark/auto)
- `systemTheme`: 系统主题
- `appliedTheme`: 实际应用的主题
- `isDark`: 是否为暗色主题

**主要方法**：
- `setTheme()`: 设置主题
- `toggleTheme()`: 切换主题
- `initTheme()`: 初始化主题

**使用示例**：
```typescript
import { useThemeStore } from '@/stores';

const themeStore = useThemeStore();

// 切换主题
themeStore.toggleTheme();

// 设置特定主题
themeStore.setTheme('dark');

// 检查当前主题
if (themeStore.isDark) {
  console.log('Dark mode is active');
}
```

### 3. Message Store (`message.ts`)

**职责**：管理消息相关的客户端状态

**状态**：
- `currentConversationId`: 当前选中的会话 ID

**主要方法**：
- `setCurrentConversation()`: 设置当前会话
- `clearCurrentConversation()`: 清空当前会话

**使用示例**：
```typescript
import { useMessageStore } from '@/stores';

const messageStore = useMessageStore();

// 设置当前会话
messageStore.setCurrentConversation('conversation-123');

// 清空选中
messageStore.clearCurrentConversation();
```

**注意**：消息列表、会话列表、未读数量等服务端数据现在由 TanStack Query 管理：
```typescript
// 使用 TanStack Query 获取消息数据
import { useConversationsQuery, useMessagesQuery } from '@/queries/messages';

const { data: conversations } = useConversationsQuery();
const { data: messages } = useMessagesQuery(conversationId);
```

### 4. Notification Store (`notification.ts`)

**职责**：管理通知相关的客户端状态

**状态**：
- `isPanelOpen`: 通知面板是否打开
- `lastViewedTime`: 最后查看通知的时间

**主要方法**：
- `openPanel()`: 打开通知面板
- `closePanel()`: 关闭通知面板
- `togglePanel()`: 切换通知面板

**使用示例**：
```typescript
import { useNotificationStore } from '@/stores';

const notificationStore = useNotificationStore();

// 打开通知面板
notificationStore.openPanel();

// 切换面板
notificationStore.togglePanel();
```

**注意**：通知列表、未读数量等服务端数据现在由 TanStack Query 管理：
```typescript
// 使用 TanStack Query 获取通知数据
import { useNotificationsQuery, useUnreadCountQuery } from '@/queries/notifications';

const { data: notifications } = useNotificationsQuery();
const { data: unreadCount } = useUnreadCountQuery();
```

## 何时使用 Pinia vs TanStack Query

### 使用 Pinia 的场景

✅ **客户端状态**
```typescript
// ✅ 正确：使用 Pinia 管理主题
const themeStore = useThemeStore();
themeStore.setTheme('dark');
```

✅ **认证状态**
```typescript
// ✅ 正确：使用 Pinia 管理认证
const authStore = useAuthStore();
await authStore.login(credentials);
```

✅ **UI 状态**
```typescript
// ✅ 正确：使用 Pinia 管理 UI 状态
const notificationStore = useNotificationStore();
notificationStore.openPanel();
```

### 使用 TanStack Query 的场景

✅ **服务端数据获取**
```typescript
// ✅ 正确：使用 TanStack Query 获取文章
import { usePostsQuery } from '@/queries/posts';

const { data: posts, isLoading } = usePostsQuery({ page: 1 });
```

✅ **数据变更**
```typescript
// ✅ 正确：使用 TanStack Query 创建文章
import { useCreatePostMutation } from '@/queries/posts';

const { mutate: createPost } = useCreatePostMutation();
createPost(postData);
```

✅ **实时数据同步**
```typescript
// ✅ 正确：使用 TanStack Query 自动刷新
import { useUnreadCountQuery } from '@/queries/notifications';

const { data: unreadCount } = useUnreadCountQuery({
  refetchInterval: 30000, // 每 30 秒刷新
});
```

### 错误示例

❌ **不要在 Pinia 中缓存服务端数据**
```typescript
// ❌ 错误：不要在 Pinia 中缓存文章列表
const postStore = usePostStore();
await postStore.fetchPosts(); // 不要这样做！

// ✅ 正确：使用 TanStack Query
const { data: posts } = usePostsQuery();
```

❌ **不要在 TanStack Query 中管理 UI 状态**
```typescript
// ❌ 错误：不要用 Query 管理 UI 状态
const { data: isPanelOpen } = useQuery(['panelOpen']); // 不要这样做！

// ✅ 正确：使用 Pinia
const notificationStore = useNotificationStore();
const isPanelOpen = notificationStore.isPanelOpen;
```

## 迁移指南

### 从旧的 Pinia Store 迁移

如果你的代码使用了旧的 Pinia Store 来获取服务端数据，请按以下步骤迁移：

#### 1. 识别服务端数据

```typescript
// 旧代码：使用 Pinia Store
const notificationStore = useNotificationStore();
await notificationStore.fetchNotifications();
const notifications = notificationStore.notifications;
```

#### 2. 迁移到 TanStack Query

```typescript
// 新代码：使用 TanStack Query
import { useNotificationsQuery } from '@/queries/notifications';

const { data: notifications, isLoading } = useNotificationsQuery();
```

#### 3. 更新变更操作

```typescript
// 旧代码：使用 Pinia Store
await notificationStore.markAsRead(notificationId);

// 新代码：使用 TanStack Query Mutation
import { useMarkAsReadMutation } from '@/queries/notifications';

const { mutate: markAsRead } = useMarkAsReadMutation();
markAsRead(notificationId);
```

## 最佳实践

### 1. 保持 Store 简单

Pinia Stores 应该只包含客户端状态，保持简单和轻量：

```typescript
// ✅ 好的 Store：简单的客户端状态
export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(false);
  
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }
  
  return { sidebarOpen, toggleSidebar };
});
```

### 2. 使用 Composition API 风格

推荐使用 Composition API 风格定义 Store，更灵活和类型安全：

```typescript
// ✅ 推荐：Composition API 风格
export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('auto');
  
  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
  }
  
  return { theme, setTheme };
});
```

### 3. 持久化客户端状态

对于需要持久化的客户端状态，使用 localStorage：

```typescript
export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(loadFromStorage());
  
  watch(theme, (newTheme) => {
    saveToStorage(newTheme);
  });
  
  return { theme };
});
```

### 4. 避免重复逻辑

不要在 Store 中重复 TanStack Query 的功能：

```typescript
// ❌ 错误：重复缓存逻辑
export const usePostStore = defineStore('post', () => {
  const posts = ref([]);
  const cache = new Map();
  
  async function fetchPost(id: string) {
    if (cache.has(id)) return cache.get(id);
    // ... 不要这样做！
  }
});

// ✅ 正确：让 TanStack Query 处理缓存
import { usePostQuery } from '@/queries/posts';
const { data: post } = usePostQuery(postId);
```

## 常见问题

### Q: 为什么要分离 Pinia 和 TanStack Query？

**A**: 职责分离带来以下好处：
- **清晰的架构**：每个工具专注于自己擅长的领域
- **更好的性能**：TanStack Query 提供自动缓存和优化
- **更少的代码**：不需要手动管理加载状态、错误处理、缓存失效
- **更好的开发体验**：DevTools 支持、类型安全、自动重试

### Q: 认证状态为什么放在 Pinia 而不是 TanStack Query？

**A**: 认证状态是特殊的客户端状态：
- Token 需要在每个请求中使用（请求拦截器）
- 需要持久化到 localStorage
- 需要跨标签页同步
- 不需要缓存失效和自动刷新（有专门的刷新逻辑）

### Q: 如何在组件中同时使用 Pinia 和 TanStack Query？

**A**: 可以同时使用，它们互不冲突：

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores';
import { usePostsQuery } from '@/queries/posts';

// 使用 Pinia 获取认证状态
const authStore = useAuthStore();

// 使用 TanStack Query 获取文章列表
const { data: posts, isLoading } = usePostsQuery({
  enabled: authStore.isAuthenticated, // 只在已认证时查询
});
</script>
```

### Q: 上传进度应该放在哪里？

**A**: 上传进度是临时的客户端状态，应该放在组件的本地状态或专门的 Pinia Store：

```typescript
// 选项 1：组件本地状态（推荐）
const uploadProgress = ref(0);

// 选项 2：Pinia Store（如果需要跨组件共享）
export const useUploadStore = defineStore('upload', () => {
  const progress = ref(0);
  return { progress };
});
```

## 相关文档

- [TanStack Query 文档](https://tanstack.com/query/latest/docs/vue/overview)
- [Pinia 文档](https://pinia.vuejs.org/)
- [迁移指南](../../.kiro/specs/tanstack-query-migration/design.md)
- [Query Hooks 文档](../queries/README.md)

## 维护

- **最后更新**：2026-02-10
- **维护者**：前端团队
- **更新频率**：随着架构演进持续更新
