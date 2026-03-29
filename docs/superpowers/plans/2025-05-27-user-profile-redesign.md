# 用户主页重设计实现计划

**日期:** 2025-05-27
**功能:** 用户主页方案 A — 杂志封面风格 + 自定义封面横幅
**设计参考:** `.superpowers/brainstorm/18705-1774699695/design-a-v2.html`

---

## 设计目标

- 沉浸式渐变横幅（支持自定义封面图上传）
- 桌面端头像左下角叠加横幅，昵称与操作按钮同行两端对齐
- bio + 数据统计横向并列
- Tab 独立一行，下划线激活样式
- 两个断点：桌面 `>768px`、移动端 `≤768px`

---

## 文件变更地图

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/types/index.ts` | 修改 | `User` 增加 `coverImage?: string \| null` |
| `src/api/user.ts` | 修改 | `UserUpdateRequest` 增加 `coverImageId?: string` |
| `src/components/user/profile/ProfileHeaderSection.vue` | 重写 | 新横幅布局 + 封面上传逻辑 + CheckInWidget 位置调整 |
| `src/components/user/profile/ProfileUserIdentity.vue` | 重写 | 桌面端头像叠加横幅，昵称行两端对齐，新增 `isCurrentUser` prop |
| `src/components/user/profile/ProfileHeaderActions.vue` | 修改 | 样式调整，适配新布局（无逻辑变更） |
| `src/components/user/profile/ProfileTabsSection.vue` | 修改 | Tab 改为下划线样式，去除 el-tabs 默认边框 |
| `src/pages/user/Profile.vue` | 修改 | 移除固定宽度限制，横幅全宽 |

> `useProfilePageContent.ts` 无需变更 — `userProfile` 已包含完整 `User` 对象，`coverImage` 字段加入 `User` 类型后自动透传。

---

## 任务列表

### Task 1 — 扩展 User 类型与 UserUpdateRequest

**文件:** `src/types/index.ts`

在 `User` interface 中增加（optional，防御后端尚未就绪）：
```ts
coverImage?: string | null;
```

**文件:** `src/api/user.ts`

在 `UserUpdateRequest` 中增加：
```ts
coverImageId?: string;
```

> **注意:** 不在 `UserApi` 中新增 `uploadCover()` 方法。封面上传统一走 `uploadApi.uploadImage()`（`src/api/upload.ts`），与头像上传保持一致的微服务路径。

> 验证：`vue-tsc --noEmit` 无报错

---

### Task 2 — 重写 ProfileUserIdentity.vue

**目标布局（桌面 >768px）：**
- 头像 104px，圆形，白色边框 4px，`margin-top: -52px`（叠加横幅底部）
- 头像右下角有编辑图标按钮（`<input type="file" accept="image/*">` hidden + label 触发），仅当前用户可见
- 昵称 `h1`（2rem/700）与操作按钮在同一 flex 行，两端对齐
- `@username` 紧跟昵称下方
- bio（如有）与 stats 横向并列：bio 占 `flex: 1`，stats 靠右

**目标布局（移动端 ≤768px）：**
- 头像居中
- 昵称、用户名居中
- bio 居中
- stats 居中横排
- 操作按钮宽度 100%，居中

**Props 变更：**
```ts
interface Props {
  user: User;
  isCurrentUser: boolean;  // 新增
}
```

**Emits 变更：**
```ts
'upload-avatar': []  // 新增，触发头像修改（逻辑由父级处理）
```

> 验证：桌面和移动端视觉与 mockup 一致；非当前用户看不到头像编辑按钮

---

### Task 3 — 重写 ProfileHeaderSection.vue（封面横幅 + 上传）

**横幅样式：**
- 高度 220px，`border-radius: 0 0 16px 16px`
- 有 `user.coverImage` 时：`background: url(coverImage) center/cover no-repeat`
- 无时：`background: var(--gradient-hero)`
- 当前用户在横幅右下角显示「更换封面」按钮（半透明，`backdrop-filter: blur(4px)`）

**封面上传流程：**
```
<input type="file" accept="image/*"> change 事件
  → coverUploading.value = true
  → const result: FileUploadResponse = await uploadApi.uploadImage(file)
  // FileUploadResponse 来自 @/api/upload，含 fileId 和 url
  → await userApi.updateUser(userId, { coverImageId: result.fileId })
  → await fetchUserProfile(userId)  // 刷新 userProfile，确保数据持久化
  → coverUploading.value = false
```

**错误处理：**
- 文件非图片类型：`ElMessage.error('请选择图片文件')` 并 return
- 上传/保存失败：`ElMessage.error('封面更新失败，请重试')`，横幅保持原样（不乐观更新）
- 上传中按钮 disabled，防止重复提交

**Props 新增：**
```ts
fetchUserProfile: (userId: string) => Promise<void>  // 从父级传入，用于刷新
```

**与父级集成：**
- `ProfileHeaderSection` 从 `useUser` composable 中拿到 `fetchUserProfile`
- 在 `Profile.vue` 中将 `fetchUserProfile` 传入 `ProfileHeaderSection`
- `CheckInWidget` 保留在 `ProfileHeaderSection` 内（已有 `userId` prop），调整至 bio/stats 下方，样式：`background: var(--color-bg-secondary)`, `border-radius: 12px`, `padding: var(--space-md)`

> 验证：
> - 上传新封面后横幅立即切换
> - 刷新页面后封面依然存在
> - 上传失败显示错误提示
> - 非当前用户看不到「更换封面」按钮

---

### Task 4 — 调整 ProfileHeaderActions.vue 样式

无逻辑变更，仅样式：
- 移除 `padding-top`，由父级布局控制
- 按钮高度统一 36px，`border-radius: 8px`
- 「编辑资料」按钮使用 `type="default"`（有 border），与 CTA 区分

> 验证：按钮视觉与 mockup 一致，点击行为不变

---

### Task 5 — 调整 ProfileTabsSection.vue Tab 样式

- `el-tabs` 不传 `type` 属性（默认下划线模式）
- 隐藏默认外边框：
```css
:deep(.el-tabs__nav-wrap::after) { display: none; }
```
- 激活下划线颜色：
```css
:deep(.el-tabs__active-bar) { background-color: var(--color-cta); }
:deep(.el-tabs__item.is-active) { color: var(--color-cta); }
```
- Tab 内容区 padding：`var(--space-lg)` 左右

> 验证：Tab 切换正常，激活样式为下划线，无多余边框

---

### Task 6 — 调整 Profile.vue 页面级布局

- `.profile-container` 去掉 `max-width` 和 `margin: 0 auto`，改为全宽
- 横幅全宽延伸至页面边缘（`ProfileHeaderSection` 无水平 padding）
- 内容区（identity、tabs）保持各自内部的 max-width 和 padding
- 将 `fetchUserProfile` 从 `useProfilePageContent` 透传给 `ProfileHeaderSection`

> 验证：横幅全宽，内容区正常居中对齐

---

### Task 7 — 端对端视觉验收

**布局验收：**
- [ ] 桌面端（>768px）：横幅全宽，头像叠加，昵称操作同行两端对齐
- [ ] 移动端（≤768px）：单栏，所有内容居中，操作按钮 100% 宽度

**主题验收：**
- [ ] 亮色主题：封面渐变可见，正文文字对比度 ≥ 4.5:1
- [ ] 暗色主题：使用暗色 `--gradient-hero`，文字可读

**封面上传验收：**
- [ ] 选择图片 → 上传中 loading，按钮 disabled
- [ ] 上传成功 → 横幅立即切换新封面
- [ ] 刷新页面 → 封面依然存在
- [ ] 选择非图片文件 → 显示格式错误提示，横幅不变
- [ ] 上传失败（断网等）→ 显示错误提示，横幅回退
- [ ] 重复点击「更换封面」按钮 → 上传中禁用，不触发重复请求

**权限验收：**
- [ ] 非当前用户：无「更换封面」和「编辑头像」按钮
- [ ] 当前用户：CheckInWidget 可见，其他用户不可见

---

## 提交策略

每个 Task 完成后单独 commit，message 格式：
```
feat(profile): <task description>
```
