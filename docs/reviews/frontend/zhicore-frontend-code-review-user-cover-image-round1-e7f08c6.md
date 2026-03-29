# zhicore-frontend 代码 Review（user-cover-image 第 1 轮）：User 类型与 UserUpdateRequest 扩展 coverImage 字段

## Review 信息

| 字段 | 说明 |
|------|------|
| 变更主题 | user-cover-image |
| 轮次 | 第 1 轮（首次审查） |
| 审查范围 | ee341e7..e7f08c6，2 个文件，148 行新增 / 146 行删除（实质新增 2 行，其余为纯空白格式重排） |
| 变更概述 | 在 `User` 接口新增可选字段 `coverImage`（封面图片 URL），在 `UserUpdateRequest` 新增 `coverImageId`（封面图片文件 ID），为用户主页封面图功能奠定类型基础 |
| 审查基准 | 无专项架构文档，依据项目现有类型约定与全局规范 |
| 审查日期 | 2025-07-18 |
| 上轮问题数 | 不适用 |

## 问题清单

### 🔴 高优先级

无

### 🟡 中优先级

#### [M1] `coverImage` 字段定位模糊：`User` 类型与 `Post` 类型命名相同但语义不同

- **文件**：`src/types/index.ts` 第 168 行、第 185 行
- **问题描述**：`User.coverImage` 表示用户主页封面图 URL，而 `Post.coverImage` 表示文章封面图 URL，两者字段名相同但所属实体完全不同。目前 `Post` 已有大量消费方（PostCard、PostDetailArticleSection、TagDetail、NotFound、Drafts 等），后续若涉及用户封面图的消费方代码将面临歧义，开发者容易误将 `user.coverImage` 当作文章封面图处理逻辑复用。
- **影响范围/风险**：可读性和维护性风险。在需要区分两类封面图的组件中（如个人主页），开发者可能混淆两套渲染逻辑，导致样式或降级处理错误。
- **修正建议**：为 `User.coverImage` 补充更明确的 JSDoc 注释，区分其与 `Post.coverImage` 的语义边界，并在消费方组件中保持变量命名一致性（如 `userCoverImage` vs `postCoverImage`）。字段本身无需改名（与后端 API 字段对齐优先），但注释需明确：
  ```typescript
  export interface User {
    // ...
    /** 用户主页封面图 URL（非文章封面图），由后端文件服务返回 */
    coverImage?: string | null;
    // ...
  }
  ```

#### [M2] `UserUpdateRequest.coverImageId` 与 `User.coverImage` 语义链路缺少注释说明

- **文件**：`src/api/user.ts` 第 21 行；`src/types/index.ts` 第 168 行
- **问题描述**：更新时传 `coverImageId`（文件 ID），响应时返回 `coverImage`（URL），这是「上传 fileId → 服务端解析为 URL」的模式。`avatarId` → `avatar` 已有相同模式，但两者均未通过注释明确这一转换关系。后续开发者新增字段时可能不清楚规律，导致字段命名不一致（例如误将请求字段命名为 `coverImageUrl`）。
- **影响范围/风险**：低，目前仅影响代码可读性，但随着字段增多会累积理解成本。
- **修正建议**：在 `UserUpdateRequest` 顶部或相关字段处补充注释，说明「ID 字段用于请求，URL 字段由响应返回」的约定：
  ```typescript
  /**
   * 更新用户信息请求体。
   * 约定：上传类资源提交文件 ID（xxxId），服务端解析后在响应 User 中返回 URL（xxx）。
   */
  export interface UserUpdateRequest {
    nickname?: string;
    bio?: string;
    avatarId?: string;       // 头像文件 ID → 对应响应字段 User.avatar（URL）
    coverImageId?: string;   // 封面图文件 ID → 对应响应字段 User.coverImage（URL）
    email?: string;
  }
  ```

### 🟢 低优先级

#### [L1] `types/index.ts` 大量纯空白格式变更混入功能 commit

- **文件**：`src/types/index.ts` 全文
- **问题描述**：本次 diff 中 146 行删除 / 146 行新增均为空行和缩进的格式调整（如接口各字段前后的空行对齐），与实际功能变更（新增 `coverImage` 字段）混杂在同一 commit 中。这使得 `git blame` 和 code review 的信噪比降低，未来追溯某字段首次引入时间会受干扰。
- **影响范围/风险**：低，仅影响 git 历史可读性。
- **修正建议**：格式化变更与功能变更分离提交。建议后续遵循：
  1. 格式化/重排：独立 `style` commit（如 `style(types): normalize whitespace in index.ts`）
  2. 功能变更：独立 `feat` commit（如本次的字段新增）

## 统计摘要

| 级别 | 数量 |
|------|------|
| 🔴 高 | 0 |
| 🟡 中 | 2 |
| 🟢 低 | 1 |
| 合计 | 3 |

## 总体评价

变更本身简洁、克制，字段命名遵循项目既有约定（`avatarId` / `avatar` 模式），可选字段设计合理，不影响现有消费方。主要改进方向是补充 JSDoc 注释，明确 `User.coverImage` 与 `Post.coverImage` 的语义边界，以及「fileId 请求 / URL 响应」的字段转换约定，降低后续开发者的理解成本。格式变更混入功能 commit 是轻微流程问题，建议后续分离。
