# 编辑器内容前后端协作契约

状态：前端草案，基于 `zhicore-go` 当前 Content 文档制定。后端 `services/zhicore-content/api/http/endpoints/content-api.md` 仍标记为草案；后端 HTTP schema / handler contract test 固化后，本文件需要同步收敛。

## 后端事实源

本契约只描述前端如何对齐后端，不替代后端 provider contract。后端事实源按优先级读取：

- `zhicore-go/services/zhicore-content/api/http/README.md`
- `zhicore-go/services/zhicore-content/api/http/endpoints/content-api.md`
- `zhicore-go/docs/architecture/services/content/body-storage-and-publishing.md`
- `zhicore-go/docs/architecture/services/content/adr/0002-body-blocks-no-raw-html.md`
- `zhicore-go/docs/architecture/services/content/adr/0003-link-preview-deferred.md`
- `zhicore-go/docs/contracts/data-types.md`
- `zhicore-go/docs/contracts/errors.md`
- `zhicore-go/docs/contracts/error-codes.md`

## 核心结论

- 后端返回和接收的是结构化 `schemaVersion + blocks`，不是 raw HTML。
- 前端可以提供 Markdown-like 输入体验，但提交前必须编译成 blocks。
- HTML 只是前端阅读器或预览器的派生渲染结果，不进入保存、发布和冲突判断。
- 系统内媒体长期事实是 Upload 返回的 `fileId`；展示 URL 只作为派生字段使用。
- 草稿保存使用 copy-on-write，前端必须带 `basePostVersion`、`baseDraftBodyId`、`baseDraftBodyHash` 做乐观冲突检测。
- `bodyId` 是正文引用，不是产品意义上的历史版本号。

## 分层模型

前端需要区分四层数据，不互相混用：

| 层                   | 归属                      | 用途                                                              | 是否提交后端 |
| -------------------- | ------------------------- | ----------------------------------------------------------------- | ------------ |
| `EditorSource`       | 编辑器 feature            | 用户正在输入的 Markdown-like 文本、选区、光标、局部草稿。         | 否           |
| `EditorDocument`     | 编辑器 compiler / adapter | 从输入编译出的前端中间态，用于预览、错误定位和 API 写入模型映射。 | 否，需转换   |
| `PostBodyWriteInput` | API contract              | `schemaVersion + blocks`，保存正文的请求体事实。                  | 是           |
| `ReaderBodyDocument` | 阅读器组件                | 从 `PostBody` 映射出的展示模型。                                  | 否           |

当前原型里的 `label`、`content`、`sourceRange`、`html` 是前端预览和错误定位辅助字段，不属于后端 contract。

## HTTP Envelope

Content API 仍使用 ZhiCore 统一 envelope。前端 API adapter 只把 `data` 映射给业务 feature，不能把 `code/message/timestamp/traceId` 散落到组件中。

成功响应：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1782112892184,
  "traceId": "optional-trace-id"
}
```

错误响应：

```json
{
  "code": 4013,
  "message": "参数校验失败",
  "data": {
    "details": [
      {
        "path": "blocks[3].children[1].latex",
        "code": "MATH_LATEX_TOO_LONG",
        "messageKey": "content.body.math_latex_too_long"
      }
    ]
  },
  "timestamp": 1782112892184,
  "traceId": "optional-trace-id"
}
```

前端机器分支依赖 `code` 和 `data.details[].code`，不依赖中文 `message`。

## 正文模型命名

命名规则：

- 具体 HTTP 接口的请求 / 响应类型使用 `Req` / `Resp` 后缀。
- 后端 schema 中已有明确业务名的响应对象直接沿用，例如 `PostBody`、`Draft`。
- 正文写入模型使用 `PostBodyWriteInput`，表示“前端提交给 Content 的正文写入输入”。
- 正文内部结构使用 `PostBodyBlock`、`PostBodyInlineNode`、`PostBodyInlineMark`。
- 不使用泛化的 `DTO` 后缀，除非类型只是无业务含义的字段搬运对象。

### 请求体

创建草稿和保存草稿正文时，前端提交的正文请求体只包含可写字段：

```ts
interface PostBodyWriteInput {
  schemaVersion: 1;
  blocks: PostBodyBlock[];
}
```

`POST /api/v1/posts` 的 `body` 字段可以省略；如果携带，形态为 `PostBodyWriteInput`。

`PUT /api/v1/posts/{postId}/draft/body` 请求体：

```ts
interface SaveDraftBodyReq extends PostBodyWriteInput {
  basePostVersion: number;
  baseDraftBodyId?: string;
  baseDraftBodyHash?: string;
  clientSavedAt?: string;
}
```

### 响应体

后端读取正文返回 `PostBody`：

```ts
interface PostBody {
  bodyId: string;
  schemaVersion: number;
  format: "blocks";
  blocks: PostBodyBlock[];
  plainText: string;
  contentHash: `sha256:${string}`;
  sizeBytes: number;
  createdAt: string;
}
```

`format`、`plainText`、`contentHash`、`sizeBytes` 由后端 canonicalize 后生成。前端可以展示或缓存这些字段，但不能把本地计算结果当作服务端事实。

## Blocks V1

后端已确认第一阶段支持的可发布 block 类型：`paragraph`、`heading`、`quote`、`list`、`code_block`、`table`、`collapsible`、`math`、`image`、`external_embed`、`attachment_gallery`。

前端提交前必须去掉 UI 临时字段，例如本地 block id、hover 状态、选区、拖拽状态、`sourceRange`、`label`、预览 HTML。

建议前后端第一版 JSON 形态按以下 TypeScript contract 固化：

```ts
type PostBodyBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock
  | TableBlock
  | CollapsibleBlock
  | MathBlock
  | ImageBlock
  | ExternalEmbedBlock
  | AttachmentGalleryBlock;

interface ParagraphBlock {
  type: "paragraph";
  children: PostBodyInlineNode[];
}

interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: PostBodyInlineNode[];
}

interface QuoteBlock {
  type: "quote";
  children: PostBodyInlineNode[];
}

interface ListBlock {
  type: "list";
  ordered: boolean;
  task: boolean;
  items: Array<{
    children: PostBodyInlineNode[];
    checked?: boolean;
  }>;
}

interface CodeBlock {
  type: "code_block";
  language?: string;
  code: string;
}

interface TableBlock {
  type: "table";
  headers: PostBodyTableCell[];
  rows: PostBodyTableCell[][];
}

interface PostBodyTableCell {
  children: PostBodyInlineNode[];
}

interface CollapsibleBlock {
  type: "collapsible";
  title: PostBodyInlineNode[];
  blocks: PostBodyBlock[];
  defaultOpen?: boolean;
}

interface MathBlock {
  type: "math";
  latex: string;
}

interface ImageBlock {
  type: "image";
  fileId: string;
  alt?: string;
  caption?: PostBodyInlineNode[];
  url?: string;
}

interface ExternalEmbedBlock {
  type: "external_embed";
  provider: string;
  url: string;
  title?: string;
}

interface AttachmentGalleryBlock {
  type: "attachment_gallery";
  items: Array<{
    fileId: string;
    caption?: PostBodyInlineNode[];
  }>;
}
```

约束：

- `table` 第一阶段只支持简单二维表，不支持 `rowspan` / `colspan`。
- `collapsible` 最大嵌套深度为 2。
- `math.latex` 只保存 LaTeX 字符串，前端用 KaTeX / MathJax 渲染，后端不执行公式。
- `code_block.language` 只是高亮 hint，后端只做格式和长度限制。
- `image.fileId` 是系统内图片事实；`url` 如出现，只是后端或 Upload 解析出的展示派生字段。外部媒体不要塞进 `image.url`，使用 `external_embed`。
- `external_embed` 由 provider 白名单控制，禁止任意 iframe / HTML。
- `attachment_gallery` 只允许 Upload `fileId`。
- `mention`、`poll`、`custom_widget` 当前只预留，不允许发布；出现时按 `4014 BLOCK_TYPE_NOT_ENABLED` 处理。

## Inline Marks

后端第一阶段支持 marks：`bold`、`italic`、`underline`、`strike`、`inline_code`、`link`。

为了支持同一段文本叠加多个样式，前端提交的 inline 节点建议使用文本节点 + marks 数组：

```ts
interface PostBodyInlineNode {
  type: "text";
  text: string;
  marks?: PostBodyInlineMark[];
}

type PostBodyInlineMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "inline_code" }
  | { type: "link"; href: string };
```

约束：

- `link.href` 只允许安全的 `http` / `https`。
- 禁止 `javascript:`、`data:`、`file:` 等 scheme。
- 前端渲染外链时使用 `target="_blank"` 必须同时设置 `rel="noopener noreferrer"`。
- 行内样式不能提交任意 CSS、class、style 或事件属性。

## 编辑器编译映射

当前前端原型的 Markdown-like compiler 到后端写入模型的映射规则：

| 原型 block | 后端 block                                                  |
| ---------- | ----------------------------------------------------------- |
| `text`     | `paragraph`                                                 |
| `heading`  | `heading`                                                   |
| `quote`    | `quote`                                                     |
| `code`     | `code_block`                                                |
| `list`     | `list`                                                      |
| `table`    | `table`                                                     |
| `math`     | `math`                                                      |
| `media`    | `image` 或 `external_embed`，取决于是否已有 Upload `fileId` |

行内映射：

| 原型 inline     | 后端 mark     |
| --------------- | ------------- |
| `strong`        | `bold`        |
| `emphasis`      | `italic`      |
| `strikethrough` | `strike`      |
| `inlineCode`    | `inline_code` |
| `link`          | `link`        |

前端 adapter 的职责是把原型中为预览服务的扁平 inline 节点合并成 `PostBodyInlineNode + marks`，并在提交前剔除空段落和 UI 辅助字段。

## 草稿工作流

### 创建草稿

`POST /api/v1/posts`

前端可只提交元数据，也可携带初始正文：

```ts
interface CreatePostReq {
  title?: string;
  summary?: string;
  coverFileId?: string;
  topicId?: string;
  categoryId?: string;
  tags?: string[];
  body?: PostBodyWriteInput;
}
```

响应：

```ts
interface CreatePostResp {
  postId: string;
  postVersion: number;
}
```

### 读取草稿

`GET /api/v1/posts/{postId}/draft`

响应：

```ts
interface Draft {
  postId: string;
  postVersion: number;
  meta: {
    title?: string;
    summary?: string;
    coverFileId?: string;
    topicId?: string;
    categoryId?: string;
    tags?: string[];
  };
  draftBody?: PostBody;
  draftBodyHash?: string;
  savedAt?: string;
}
```

前端打开编辑器时，把 `postVersion`、`draftBody.bodyId`、`draftBodyHash` 保存为下一次保存的 base 值。

### 保存草稿正文

`PUT /api/v1/posts/{postId}/draft/body`

保存成功后，前端必须用响应里的新值更新本地 base：

```ts
interface SaveDraftBodyResp {
  postId: string;
  postVersion: number;
  draftBodyId: string;
  draftBodyHash: string;
  savedAt: string;
  wordCount: number;
}
```

规则：

- autosave 由前端 debounce，避免每个按键都请求后端。
- 内容未变化时前端可以跳过保存；后端仍会以 canonical `contentHash` 做 no-op 防线。
- 保存失败不能丢弃本地输入。
- `clientSavedAt` 只用于冲突提示，不作为服务端事实。

### 发布

`POST /api/v1/posts/{postId}/publish`

发布时必须提交用户确认时看到的版本和草稿正文指纹：

```ts
interface PublishPostReq {
  basePostVersion: number;
  draftBodyId: string;
  draftBodyHash: string;
  idempotencyKey?: string;
}
```

响应：

```ts
interface PublishPostResp {
  postId: string;
  postVersion: number;
  publishedAt: string;
}
```

前端发布前需要确认标题和正文最低要求的本地校验，但后端仍是最终防线。

## 公开阅读工作流

阅读页可以使用：

- `GET /api/v1/posts/{postId}`：读取文章详情，默认包含 `body`。
- `GET /api/v1/posts/{postId}/body`：单独读取 published body。

前端阅读器消费 `PostBody.blocks` 渲染。不要要求后端返回 HTML，也不要把 raw HTML 插入 DOM。

## 错误映射

| code                                       | 前端处理                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `4013 BODY_SCHEMA_INVALID`                 | 显示正文结构错误；如果有 `data.details`，定位到具体 block / inline path。 |
| `4014 BLOCK_TYPE_NOT_ENABLED`              | 提示当前内容类型暂不支持发布，保留本地内容。                              |
| `4015 BODY_TOO_LARGE`                      | 提示正文过大，阻止继续自动保存风暴。                                      |
| `4016 BODY_TEXT_TOO_SHORT`                 | 发布前提示正文有效文字不足。                                              |
| `4017 DRAFT_CONFLICT`                      | 停止覆盖服务端；保留本地改动，提示刷新、恢复本地草稿或手动合并。          |
| `4018 CONTENT_BODY_UNAVAILABLE`            | 阅读页显示正文不可用状态；不要读取草稿冒充 published body。               |
| `4019 CONTENT_BODY_INCONSISTENT`           | 显示正文一致性异常，允许重试或联系维护者。                                |
| `4020 EXTERNAL_EMBED_PROVIDER_NOT_ALLOWED` | 标记对应外部嵌入，提示 provider 不支持。                                  |
| `4021 MEDIA_REF_INVALID`                   | 标记图片、封面或附件引用；要求重新上传或移除。                            |
| `4022 VALIDATION_ERROR_LIMIT_EXCEEDED`     | 告知错误过多，只展示已返回的有限错误。                                    |
| `4023 COVER_UNAVAILABLE`                   | 标记封面引用不可发布。                                                    |
| `4024 BODY_SCHEMA_UNSUPPORTED`             | 显示当前前端或后端不支持该正文版本。                                      |

`data.details[].path` 指向请求体 JSON path，例如 `blocks[3].children[1].marks[0].href`。前端需要维护从请求体 path 到编辑位置的映射；没有映射时降级为全局正文错误。

## 安全约束

- 前端不提交 raw HTML。
- 阅读器默认使用 Vue 组件渲染 blocks，不使用 `v-html`。
- 确需 HTML 派生渲染时，必须走统一 sanitize helper，并且变量名或调用点能看出已净化。
- 前端不抓取第三方链接生成 preview；链接预览后续由后端异步 SSRF-safe fetcher 生成，前端只消费缓存结果。
- 任何外部 URL 必须经过 scheme 和 allowlist 校验后再渲染。
- 用户输入不得进入 CSS class、style、事件属性或 iframe HTML。

## Upload 协作

- 用户插入系统内图片或附件时，前端先走 Upload 流程拿到 `fileId`。
- 正文 blocks 只保存 `fileId`，不把 Upload URL、对象存储 key、签名 URL 或 CDN path 当长期事实保存。
- 未保存草稿的临时上传文件由 Upload 的 temporary / unbound TTL 清理，Content 不负责未引用文件。
- 保存草稿和发布时，后端会校验媒体引用；校验失败映射为 `4021 MEDIA_REF_INVALID`。

## 版本与迁移

- 当前前端只写 `schemaVersion: 1`。
- 读取时按后端返回的 `schemaVersion` 选择 reader adapter；不认识的版本显示 `BODY_SCHEMA_UNSUPPORTED` 风格错误。
- schema 升级时后端采用读兼容 + 分批 copy-on-write migration；前端不能假设 `bodyId` 稳定代表历史版本。

## 待后端锁定项

以下内容已经有方向，但需要后端 HTTP schema 或 contract test 固化后再视为最终协议：

- 每个 block 的 JSON 字段名和必填 / 可选边界。
- `PostBodyInlineNode + marks` 是否作为最终 inline 结构。
- `image` 是否只允许系统内 `fileId`，外部图片是否全部归入 `external_embed`。
- `collapsible` 的 title / children 字段命名和嵌套深度校验路径。
- `table` 空表、空 header、行列数量上限。
- blocks canonical JSON 的字段排序、空字段剔除和 hash 细节。
