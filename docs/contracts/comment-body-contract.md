# 评论正文契约

状态：前端草案，待 `zhicore-go` Comment 服务 HTTP contract / migration 固化后同步收敛。

## 核心结论

- 评论正文复用文章正文的结构化 blocks 思路，但能力集更窄。
- 前端编辑运行时可以使用 Tiptap JSON；提交后端前必须映射为 `CommentBodyWriteInput`。
- 后端长期事实源是 `schemaVersion + blocks`，不是 raw HTML，也不是 Tiptap JSON。
- PostgreSQL 推荐使用 `jsonb` 保存 `body_blocks`，并单独保存 `plain_text`、`content_hash` 等派生字段。
- 评论第一阶段只开放段落、引用、列表、代码块和行内 `@mention`，避免把完整文章编辑器复杂度带入评论系统。

## 第一阶段范围

必须包含：

- 创建顶层评论。
- 创建回复评论。
- 分页读取顶层评论。
- 分页读取某条顶层评论下的回复。
- 渲染结构化正文。
- `@mention` 用户搜索、保存、校验和通知派生。
- 评论删除后的占位展示。
- 创建评论幂等。

暂不包含：

- 评论编辑。
- 图片、附件、语音评论。
- 评论草稿服务端保存。
- 复杂审核工作流；第一阶段只保留可见性状态字段。

## 与文章正文契约的关系

评论契约参考 [editor-content-contract.md](editor-content-contract.md)，但不直接等同于 `PostBodyWriteInput`。

相同点：

- 都使用 `schemaVersion + blocks` 作为 API 写入模型。
- 都禁止保存 HTML 和任意 CSS / class / style / event attribute。
- link 只允许安全 `http` / `https`。
- Tiptap JSON 只属于前端编辑器运行时和本地草稿恢复层。

不同点：

- 评论不支持 `heading`、`table`、`collapsible`、`math`、`image`、`external_embed`、`attachment_gallery`。
- 评论不参与文章草稿 `basePostVersion / draftBodyId / publish` 流程。
- 评论可以有自己的编辑 / 删除审计和可见性状态。

## 分层模型

| 层                      | 归属             | 用途                                      | 是否提交后端 |
| ----------------------- | ---------------- | ----------------------------------------- | ------------ |
| `CommentEditorDocument` | 前端评论编辑器   | Tiptap doc / JSON、选区、本地未提交草稿。 | 否，需转换   |
| `CommentBodyWriteInput` | Comment API      | 创建或编辑评论的正文写入模型。            | 是           |
| `CommentBody`           | Comment API      | 后端 canonicalize 后返回的评论正文事实。  | 响应返回     |
| `CommentReaderBody`     | 前端 reader 组件 | 从 `CommentBody.blocks` 派生的展示模型。  | 否           |

## 写入模型

```ts
type CommentBodySchemaVersion = 1;

interface CommentBodyWriteInput {
  schemaVersion: CommentBodySchemaVersion;
  blocks: CommentBodyBlock[];
}
```

第一阶段允许的 block：

```ts
type CommentBodyBlock =
  | CommentParagraphBlock
  | CommentQuoteBlock
  | CommentListBlock
  | CommentCodeBlock;

interface CommentParagraphBlock {
  type: "paragraph";
  children: CommentInlineNode[];
}

interface CommentQuoteBlock {
  type: "quote";
  blocks: CommentBodyBlock[];
}

interface CommentListBlock {
  type: "list";
  ordered: boolean;
  items: CommentListItem[];
}

interface CommentListItem {
  blocks: CommentBodyBlock[];
}

interface CommentCodeBlock {
  type: "code_block";
  language?: string;
  code: string;
}
```

约束：

- `paragraph.children` 可以为空，用于表达作者输入的空段落；后端可以限制连续空段落数量，但必须返回明确校验错误。
- `quote.blocks` 和 `list.items[].blocks` 允许 block children，便于保存“引用里有代码块”或“列表项里有多段文本”。
- 评论 block 容器最大嵌套深度为 2，超过时前端 mapper 和后端都必须拒绝，不能静默 flatten。
- `list.ordered` 表达有序 / 无序列表；第一阶段不支持 task list，因此没有 `task` 和 `checked`。
- `code_block.language` 只是高亮 hint；后端只做格式、长度和白名单校验，不执行代码。

## 行内节点和 marks

```ts
type CommentInlineNode = CommentTextInlineNode | CommentMentionInlineNode;

interface CommentTextInlineNode {
  type: "text";
  text: string;
  marks?: CommentInlineMark[];
}

interface CommentMentionInlineNode {
  type: "mention";
  userPublicId: string;
  displayName: string;
}

type CommentInlineMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "inline_code" }
  | { type: "link"; href: string };
```

约束：

- `mention` 是行内节点，不是 mark；它绑定平台用户身份，不能只保存裸 `@xxx` 字符串。
- `mention.userPublicId` 使用公开用户标识，不使用内部自增 ID 或隐私字段。
- `mention.displayName` 是展示快照；渲染和通知时以后端解析到的用户事实为准。
- `mention` 不允许叠加 `marks`，避免链接、代码样式和用户身份节点混在一起。
- 第一阶段不开放 `underline` 和 `strike`，评论工具栏保持轻量；如产品需要可在不破坏 schema 的情况下加入 mark 白名单。
- `link.href` 只允许安全 `http` / `https`。
- 禁止 `javascript:`、`data:`、`file:` 等 scheme。
- 前端渲染外链使用 `target="_blank"` 时必须同时设置 `rel="noopener noreferrer"`。
- 行内 marks 可以叠加，例如同一段文本同时是 `bold + link`。

## Tiptap 映射

评论编辑器可以复用现有 `EditorCompactBodyComposer` / Tiptap runtime，但需要新增评论专用 mapper，例如：

```ts
function mapTiptapJsonToCommentBodyWriteInput(
  documentJson: EditorTiptapDocumentJson,
): CommentBodyWriteInput;
```

允许映射：

| Tiptap node / mark | Comment contract          |
| ------------------ | ------------------------- |
| `paragraph`        | `paragraph`               |
| `blockquote`       | `quote`                   |
| `bulletList`       | `list { ordered: false }` |
| `orderedList`      | `list { ordered: true }`  |
| `codeBlock`        | `code_block`              |
| `bold`             | `bold`                    |
| `italic`           | `italic`                  |
| `code`             | `inline_code`             |
| `link`             | `link`                    |
| `mention`          | `mention`                 |

拒绝映射：

- `heading`
- `taskList`
- `table`
- `math_block`
- `image`
- `external_embed`
- `attachment_gallery`
- 任意未知 node / mark

评论编辑器 toolbar 第一阶段建议只开放：

```ts
[
  "bold",
  "italic",
  "link",
  "mention",
  "quote",
  "unorderedList",
  "orderedList",
  "code",
];
```

如果 UI 暂时只展示无序列表，也可以先只开放 `unorderedList`，但 API contract 仍允许 `ordered: true`，便于后续补工具栏。

## HTTP Contract

### 创建前置条件

创建评论前，Comment 服务必须校验：

- 请求用户已登录且账号状态允许发言。
- `postId` 存在，且文章处于允许评论的状态。
- `parentCommentId` 如存在，必须属于同一篇文章。
- 被回复评论的可见性允许继续回复。
- `idempotencyKey` 如存在，必须满足长度和字符集限制；建议最大 128 字符。

这些校验属于后端事实边界；前端只能做提前提示，不能替代后端校验。

### 创建评论

建议替换当前纯文本 `content` 字段：

```ts
interface CreateCommentReq {
  parentCommentId?: string;
  body: CommentBodyWriteInput;
  idempotencyKey?: string;
}
```

响应：

```ts
interface CreateCommentResp {
  postId: string;
  commentId: string;
  rootCommentId?: string;
  parentCommentId?: string;
  createdAt: string;
}
```

### 评论列表

```ts
interface CommentBody {
  schemaVersion: number;
  format: "blocks";
  blocks: CommentBodyBlock[];
  plainText: string;
  contentHash: `sha256:${string}`;
  sizeBytes: number;
  createdAt: string;
  updatedAt?: string;
}

interface CommentItem {
  commentId: string;
  rootCommentId?: string;
  parentCommentId?: string;
  author: CommentAuthorSummary;
  body: CommentBody;
  stats: {
    likeCount: number;
    replyCount: number;
  };
  viewer?: {
    liked: boolean;
  };
  status: "NORMAL" | "HIDDEN" | "DELETED";
  createdAt: string;
  updatedAt?: string;
}
```

作者摘要：

```ts
interface CommentAuthorSummary {
  publicId?: string;
  displayName?: string;
  avatarFileId?: string;
  avatarUrl?: string;
  unavailable?: boolean;
}
```

状态语义：

- `NORMAL`：正常展示正文和互动。
- `HIDDEN`：被审核或权限策略隐藏；普通读者不展示原正文。
- `DELETED`：被作者或管理端删除；普通读者只展示固定占位文案。

过渡期兼容策略：

- 前端可以暂时接受旧响应 `content?: string`，但新写路径应优先提交 `body`。
- 旧写入字段 `imageFileIds`、`voiceFileId`、`voiceDuration` 不属于评论富文本第一阶段；新接口应拒绝或忽略这些字段，并返回明确迁移说明。
- 后端若需要兼容旧数据，可在读取层把旧 `content` canonicalize 为单段 `paragraph`。
- 新接口稳定后，前端 `ArticleComment.body: string` 应升级为结构化 reader model 或直接持有 `CommentBody`。

### 分页读取

评论排序沿用当前前端 API：

```ts
type CommentSort = "RECOMMENDED" | "HOT" | "TIME";

interface ListCommentsPageReq {
  page?: number;
  size?: number;
  sort?: CommentSort;
}

interface TopLevelCommentPageResp {
  items: CommentItem[];
  page: number;
  size: number;
  totalComments: number;
  totalTopLevelComments: number;
  pages: number;
}

interface ListCommentRepliesReq {
  page?: number;
  size?: number;
}

interface CommentReplyPageResp {
  rootCommentId: string;
  items: CommentItem[];
  page: number;
  size: number;
  totalReplies: number;
  pages: number;
}
```

约束：

- 顶层评论 `rootCommentId` 和 `parentCommentId` 为空。
- 回复评论必须有 `rootCommentId` 和 `parentCommentId`。
- `rootCommentId` 指向所属顶层评论；`parentCommentId` 指向本次回复直接回复的评论。
- 第一阶段 UI 可以把所有回复平铺在顶层评论下，但后端仍保存 `parentCommentId`，以支持“回复某条回复”的通知和上下文。
- 顶层分页不内联全部回复；可以只带 `replyCount`，回复列表通过独立接口按需读取。

## @mention 解析与通知

`@mention` 需要由前端输入体验和后端事实校验共同完成：

- 前端在输入 `@` 后可以搜索用户，并把选中的用户插入为 `mention` inline node。
- 前端提交的 `userPublicId` 必须由后端重新校验；不存在、不可见或被封禁的用户应返回明确校验错误。
- 后端生成通知时只能使用校验后的 mention 列表，不能信任客户端附带的派生通知字段。
- 同一条评论多次提到同一用户时，通知应去重。
- 回复场景中，如果被回复用户也被显式 `@mention`，通知策略由 Comment 服务统一去重，不由前端判断。

用户搜索建议接口：

```ts
interface SearchMentionUsersReq {
  keyword: string;
  limit?: number;
}

interface MentionUserSuggestion {
  publicId: string;
  displayName: string;
  avatarUrl?: string;
  unavailable?: boolean;
}

interface SearchMentionUsersResp {
  items: MentionUserSuggestion[];
}
```

约束：

- `keyword` 为空或只有空白时不请求后端。
- `limit` 第一阶段建议上限为 10。
- 不可被当前用户看见或不可通知的用户不应返回。
- 前端只能把搜索结果中的 `publicId` 写入 `mention` node，不能自行拼一个 public id。

通知规则：

- 回复评论默认通知 `parentCommentId` 对应评论作者，作者回复自己时不通知自己。
- `@mention` 通知和回复通知必须在服务端按用户去重。
- 评论创建、mention 派生和通知事件写入应处于同一业务事务或使用 outbox，避免评论已创建但通知永久丢失。

## PostgreSQL 存储建议

评论正文可以保存在 Comment 服务的 `comments` 表中：

```sql
CREATE TABLE comments (
  id uuid PRIMARY KEY,
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  root_comment_id uuid,
  parent_comment_id uuid,
  body_schema_version smallint NOT NULL,
  body_format text NOT NULL,
  body_blocks jsonb NOT NULL,
  plain_text text NOT NULL,
  content_hash text NOT NULL,
  idempotency_key text,
  size_bytes integer NOT NULL,
  status text NOT NULL,
  like_count integer NOT NULL DEFAULT 0,
  reply_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
```

索引建议：

```sql
CREATE INDEX comments_post_created_idx
  ON comments (post_id, created_at DESC);

CREATE INDEX comments_root_created_idx
  ON comments (root_comment_id, created_at ASC)
  WHERE root_comment_id IS NOT NULL;

CREATE INDEX comments_author_created_idx
  ON comments (author_id, created_at DESC);

CREATE UNIQUE INDEX comments_author_idempotency_key_idx
  ON comments (author_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
```

`@mention` 建议单独派生表，便于通知、去重和审计：

```sql
CREATE TABLE comment_mentions (
  comment_id uuid NOT NULL,
  mentioned_user_public_id text NOT NULL,
  display_name_snapshot text NOT NULL,
  created_at timestamptz NOT NULL,
  PRIMARY KEY (comment_id, mentioned_user_public_id)
);

CREATE INDEX comment_mentions_user_created_idx
  ON comment_mentions (mentioned_user_public_id, created_at DESC);
```

说明：

- `body_blocks jsonb` 保存 `CommentBodyBlock[]`。
- `plain_text` 用于通知、审核、搜索摘要和列表兜底展示。
- `content_hash` 由后端 canonicalize 后生成，用于审计、去重和编辑冲突判断。
- `idempotency_key` 只在同一作者维度去重；同一个 key 重放时返回首次创建结果，不重复插入评论和通知。
- `comment_mentions` 来自后端 canonicalize 后的 `mention` 节点，不接受客户端单独提交的 mention 列表。
- `reply_count` 和文章 `commentCount` 必须由后端在评论创建 / 删除事务中维护，前端展示值只是响应派生。
- 不建议第一阶段给 `body_blocks` 加 GIN 索引；只有出现按 block / mark 查询的真实需求再加。
- 评论编辑历史如需审计，建议单独建 `comment_revisions`，不要把历史版本塞进当前行。

## Canonicalize

后端保存前必须把 `CommentBodyWriteInput` canonicalize 为 `CommentBody`：

- 清理不支持的空白和不可见控制字符。
- 对 link URL 做安全解析和规范化。
- 对 mention 做用户校验，保留 `userPublicId` 和当时的 `displayName` 快照。
- 生成 `plainText`；`mention` 在 plain text 中表现为 `@displayName`。
- 生成稳定 `contentHash`；hash 基于 canonical blocks，而不是客户端原始 JSON 字符串。
- 计算 `sizeBytes`；建议基于 canonical blocks 的 UTF-8 JSON 字节数。

前端可以本地派生 `plainText` 做即时校验，但不能把本地 `plainText`、`contentHash` 或 `sizeBytes` 当作服务端事实提交。

## 校验和安全

前端提交前必须校验：

- blocks 非空，且至少有一个可见文本或代码内容。
- `plainText` 长度不超过产品限制；建议第一阶段评论纯文本上限 1000 字符，代码块计入总量。
- block 数量不超过 20。
- 单个 `code_block.code` 不超过 4000 字符。
- `mention` 数量不超过 20，重复 mention 只计一次通知。
- 单个 link URL 不超过 2048 字符。
- block / mark 必须在白名单内。
- link URL 必须通过安全 URL sanitizer。
- 容器嵌套深度不超过 2。
- `parentCommentId` 必须属于同一篇文章。
- 被回复评论为 `DELETED` 或 `HIDDEN` 时，是否允许继续回复由 Comment 服务统一判断，并返回明确错误。

后端必须重新校验同一组规则，前端校验只用于更快反馈，不作为安全边界。

校验错误路径应指向写入模型，例如：

- `body.blocks[0].children[2].href`
- `body.blocks[1].blocks[0].code`
- `body.blocks[0].children[3].userPublicId`
- `parentCommentId`

渲染要求：

- 评论 reader 不使用 `v-html` 渲染用户内容。
- link 渲染必须带安全 rel。
- `code_block` 只做文本渲染和高亮，不执行代码。
- `mention` 渲染为用户链接时必须使用 `userPublicId` 生成路由，不使用 display name 拼 URL。
- `HIDDEN` / `DELETED` 评论默认不返回正文；如需要展示占位，返回固定文案，不使用原正文。

## 迁移计划

1. 新增前端 `CommentBodyWriteInput` / `CommentBody` 类型，先不删除旧 `content`。
2. 新增 Tiptap JSON 到 `CommentBodyWriteInput` 的 mapper，并复用现有 link sanitizer。
3. 将评论草稿状态从 `string` 升级为 `EditorTiptapDocumentJson`，同时派生 `plainText` 用于空内容校验。
4. `CreateCommentReq` 从 `content` 切到 `body`；过渡期 API adapter 可接受旧 mock。
5. 评论列表 mapper 从 `comment.content` 改为 `comment.body.blocks` reader 渲染。
6. 后端迁移旧纯文本评论：每条旧内容转换为一个 `paragraph` block。
7. 删除或废弃第一阶段不支持的旧评论媒体写入字段：`imageFileIds`、`voiceFileId`、`voiceDuration`。

## 暂不支持

- 图片 / 附件评论。
- 任意外部 embed。
- 表格、公式、折叠块。
- task list。
- raw HTML。
- Tiptap JSON 直接入库作为长期事实源。
