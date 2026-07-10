# 编辑器 Block 保存模型实现计划

> **给 agentic workers：** 必需子技能：实现本计划时使用 @subagent-driven-development 或 @executing-plans 逐任务推进；逻辑切片按 @test-driven-development 执行。每个 checkbox 达到预期后立即更新；如需提交，提交前必须先使用 @committing-changes。

**目标：** 收敛 `/editor` 当前 Markdown-like 原型到正式 `PostBodyWriteInput` 保存模型，确保预览/UI 字段、ProseMirror 内部状态、本地 hash 和不完整媒体语义不会进入长期 Content 契约。

**架构：** `src/features/editor-showcase/model/editorContentCompiler` 继续负责 textarea 原型到中间态和保存模型的映射，但正式保存 mapper 必须与 reader preview mapper 分离。`src/entities/post-body` 承载稳定正文契约与媒体/provider 策略；未来 ProseMirror 只通过 adapter 输出 `PostBodyWriteInput`、预览块和校验位置映射，不直接持久化 ProseMirror JSON。

**技术栈：** Vue 3、TypeScript strict mode、Vitest、happy-dom、Axios。

---

## 背景依据

- `docs/contracts/editor-content-contract.md` 已定义四层数据：`EditorSource`、`EditorDocument`、`PostBodyWriteInput`、`ReaderBodyDocument`，并明确 `label`、`content`、`sourceRange`、`html` 不属于后端 contract。
- `docs/design/editor-design.md` 要求编辑器保持“连续文档 + 隐形 blocks 结构层”，保存事实仍为 `schemaVersion + blocks`。
- 当前 `mapEditorCompiledDocumentToPostBodyWriteInput()` 复用了 `mapEditorCompiledDocumentToPreviewReaderBlocks()`，导致块间空行 spacer 被写入正式 `PostBodyWriteInput`。
- 当前后端类型已包含 `underline` mark，reader 也有 underline class；但 Markdown-like compiler、toolbar 和 draft loader 尚不能无损输入/回填 underline。
- 当前 `/editor` 的保存仍是本地快照，`EditorSavedDraftSnapshot.contentHash` 使用 `local:` 前缀；接真实 Content API 时必须以服务端返回的 `draftBodyHash` 为事实。

## 已锁定决策

- **quote/list V1 继续保持扁平 inline-only。** 现有前后端契约和 reader 类型已经按 `quote.children`、`list.items[].children` 建模；本任务不升级为 `quote.blocks` 或 `list.items[].blocks`，避免前端单方面扩大 Content V1 contract。未来 ProseMirror adapter 遇到多段 quote、嵌套 list 或 list item 内 block 时，应返回“不支持保存”的结构校验结果，而不是静默 flatten。
- **Reader preview block 与正式保存 block 是两个模型。** Preview 可以拥有 `stableKey`、`readerBlockIndex`、`sourceRange`、spacer paragraph；正式 `PostBodyWriteInput.blocks` 只能来自 contract mapper。
- **当前 textarea 原型里的 Markdown 图片只表示外部图片嵌入。** 系统内图片和附件必须来自 Upload `fileId`，不能由 `![alt](url)` 伪造成 `image` 或 `attachment_gallery`。
- **ProseMirror JSON 只作为编辑器内部状态。** 长期保存事实仍是 `PostBodyWriteInput`；adapter 的公共出口只能暴露保存模型、reader preview 模型和错误位置映射。
- **本地 hash 只用于前端脏状态。** `baseDraftBodyHash` 和新的 `draftBodyHash` 必须来自服务端草稿读取或保存响应。

## 文件结构

- 修改：`docs/contracts/editor-content-contract.md`
  - 固化 quote/list V1 inline-only 决策、ProseMirror adapter 边界、媒体/provider 策略和 hash 事实边界。
- 修改：`docs/design/editor-design.md`
  - 补充“预览 spacer 不进入保存事实”和“ProseMirror 内部状态不持久化”的编辑器设计约束。
- 修改：`src/entities/post-body/model/types.ts`
  - 如需要，补充 `ExternalEmbedProvider`、`PostBodyValidationPath`、保存请求/响应相关稳定类型。
- 新增：`src/entities/post-body/model/policy.ts`
  - 外部 embed provider 白名单、媒体 block 事实判断、Content V1 支持边界。
- 新增：`src/entities/post-body/model/__tests__/policy.spec.ts`
  - 覆盖 provider 白名单和系统内媒体必须依赖 `fileId` 的规则。
- 修改：`src/entities/post-body/model/index.ts`
- 修改：`src/entities/post-body/index.ts`
  - 导出新增 contract policy 和类型。
- 修改：`src/features/editor-showcase/model/editorContentCompiler/types.ts`
  - 给当前中间态补 `underline` mark；明确 compiled block 仍可包含 `label/content/sourceRange`。
- 修改：`src/features/editor-showcase/model/editorContentCompiler/inlineParsers.ts`
  - 增加 underline 的 Markdown-like 临时输入语法。
- 修改：`src/features/editor-showcase/model/editorContentCompiler/postBodyWriteInputCompiler.ts`
  - 分离正式保存 mapper 和 preview mapper；新增保存路径映射所需输出。
- 修改：`src/features/editor-showcase/model/editorContentCompiler/postBodyEditorDraftLoader.ts`
  - 支持从 `PostBodyInlineMark` 的 `underline` 回填到当前 textarea 源文本；继续拒绝不支持的嵌套 quote/list/media。
- 修改：`src/features/editor-showcase/model/editorContentCompiler/index.ts`
  - 导出新增 mapper、adapter、错误位置类型。
- 修改：`src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyEditorDraftLoader.spec.ts`
- 修改：`src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts`
  - 覆盖正式保存不含 spacer/UI 字段、preview 仍保留 spacer、underline 编译和回填。
- 修改：`src/features/editor-showcase/model/editorToolbarTransforms.ts`
- 修改：`src/features/editor-showcase/model/__tests__/editorToolbarTransforms.spec.ts`
  - 增加 underline toolbar action。
- 修改：`src/components/editor-showcase/EditorWritingPane.vue`
- 修改：`src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts`
  - 增加 underline 按钮和事件覆盖。
- 新增：`src/features/editor-showcase/model/editorContentAdapter.ts`
  - 定义当前 textarea adapter 和未来 ProseMirror adapter 的最小边界。
- 新增：`src/features/editor-showcase/model/__tests__/editorContentAdapter.spec.ts`
  - 验证 adapter 不暴露内部编辑器 JSON 为持久化输出。
- 新增：`src/features/editor-showcase/model/editorValidationPathMapper.ts`
  - 将 `blocks[...].children[...]` 等后端 path 映射到当前 source range；未来 ProseMirror adapter 可替换为 position 映射。
- 新增：`src/features/editor-showcase/model/__tests__/editorValidationPathMapper.spec.ts`
  - 覆盖 block path、inline path、spacer 不偏移正式 block index、无法映射时降级为全局正文错误。
- 新增：`src/api/post.ts`
  - Content draft body 保存 API 类型和 adapter。
- 新增：`src/api/__tests__/post.spec.ts`
  - 覆盖 `SaveDraftBodyReq` 发送 `basePostVersion/baseDraftBodyId/baseDraftBodyHash` 和 `body` 字段。
- 修改：`src/features/editor-showcase/model/useEditorShowcaseDraft.ts`
- 修改：`src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts`
  - 把本地保存快照和服务端草稿基线拆开；真实保存只采信服务端返回的 `draftBodyHash`。
- 修改：`src/features/editor-showcase/model/index.ts`
  - 导出新增公共类型。
- 修改：`docs/todo/2026-07-02-1907-editor-block-save-model.md`
  - 实现完成后更新状态和 checkbox。

## 任务 1：拆分正式保存 mapper 与 reader preview mapper

**测试立场：** TDD - 保存模型行为和数据契约变化。

**文件：**

- 修改：`src/features/editor-showcase/model/editorContentCompiler/postBodyWriteInputCompiler.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts`

- [x] 编写失败测试：正式 `PostBodyWriteInput` 不再写入块间空行 spacer。

  测试要点：

  ````ts
  const writeInput = compileEditorContentToPostBodyWriteInput(
    [
      "```go",
      "package main",
      "```",
      "",
      "",
      "| 名称 | 说明 |",
      "| --- | --- |",
      "| ZhiCore | 内容社区 |",
    ].join("\n"),
  );

  expect(writeInput.blocks).toEqual([
    expect.objectContaining({ type: "code_block" }),
    expect.objectContaining({ type: "table" }),
  ]);
  expect(writeInput.blocks).not.toContainEqual({
    type: "paragraph",
    children: [{ type: "text", text: "\n\n" }],
  });
  ````

- [x] 编写失败测试：preview mapper 仍为 reader 视图生成 spacer 和 `sourceRange`。

  预期：`mapEditorCompiledDocumentToPreviewReaderBlocks()` 返回 spacer preview block；spacer 没有 `sourceRange`，真实 block 仍有 `sourceRange`。

- [x] 编写失败测试：正式保存结果序列化后不包含 `stableKey`、`readerBlockIndex`、`compiledBlockIndex`、`sourceRange`、`label`、`content`。

  运行：`pnpm exec vitest run src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts`

  预期：新增测试先失败，失败点指向当前正式 mapper 复用 preview mapper。

- [x] 修改 `mapEditorCompiledDocumentToPostBodyWriteInput()`，直接 `document.blocks.map(mapCompiledBlock)`，不再经过 `mapEditorCompiledDocumentToPreviewReaderBlocks()`。

  关键注释：说明 reader preview 的 spacer 是视觉和滚动同步辅助，不是 Content 保存事实。

- [x] 保持 `mapEditorCompiledDocumentToPreviewReaderBlocks()` 的 spacer 行为不变，避免破坏预览留白和滚动锚点。

- [x] 更新旧测试中“正式保存保留 spacer paragraph”的期望，把它改为 preview mapper 规格。

- [x] 运行目标测试。

  运行：`pnpm exec vitest run src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts`

  预期：全部通过。

## 任务 2：固化 Content V1 策略和媒体 provider 白名单

**测试立场：** TDD - contract policy 和保存边界。

**文件：**

- 修改：`docs/contracts/editor-content-contract.md`
- 修改：`src/entities/post-body/model/types.ts`
- 新增：`src/entities/post-body/model/policy.ts`
- 新增：`src/entities/post-body/model/__tests__/policy.spec.ts`
- 修改：`src/entities/post-body/model/index.ts`
- 修改：`src/entities/post-body/index.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/postBodyWriteInputCompiler.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts`

- [x] 编写失败测试：`image` 和 `attachment_gallery` 的系统内媒体事实必须包含 Upload `fileId`。

  建议 policy API：

  ```ts
  export const allowedExternalEmbedProviders = ["image"] as const;
  export type ExternalEmbedProvider =
    (typeof allowedExternalEmbedProviders)[number];

  export function isAllowedExternalEmbedProvider(
    provider: string,
  ): provider is ExternalEmbedProvider;
  export function isUploadBackedPostBodyBlock(block: PostBodyBlock): boolean;
  ```

- [x] 编写失败测试：`external_embed.provider` 只接受白名单 provider，当前只允许 `"image"`。

- [x] 编写失败测试：Markdown-like `![alt](https://example.com/image.png)` 只能编译为 `external_embed`，不能编译为 `image`。

- [x] 实现 `policy.ts` 并从 `entities/post-body` 出口导出。

- [x] 在 `postBodyWriteInputCompiler.ts` 使用 provider policy；不允许未知 provider 从 compiler 进入正式保存模型。

- [x] 更新 `docs/contracts/editor-content-contract.md`：

  - `quote` 和 `list` V1 明确为 inline-only。
  - ProseMirror 多段 quote、嵌套 list、list item 内 block 在 V1 中属于“不支持保存”，不得静默 flatten。
  - 系统内图片/附件长期事实是 Upload `fileId`。
  - 外部图片使用 `external_embed`，provider 受白名单控制。

- [x] 运行实体与 compiler policy 测试。

  运行：

  ```bash
  pnpm exec vitest run \
    src/entities/post-body/model/__tests__/policy.spec.ts \
    src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts
  ```

  预期：全部通过。

## 任务 3：补齐 underline 输入、保存和回填

**测试立场：** TDD - inline mark 解析、toolbar 行为和回填契约。

**文件：**

- 修改：`src/features/editor-showcase/model/editorContentCompiler/types.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/inlineParsers.ts`
- 修改：`src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/postBodyEditorDraftLoader.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyEditorDraftLoader.spec.ts`
- 修改：`src/features/editor-showcase/model/editorToolbarTransforms.ts`
- 修改：`src/features/editor-showcase/model/__tests__/editorToolbarTransforms.spec.ts`
- 修改：`src/components/editor-showcase/EditorWritingPane.vue`
- 修改：`src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts`

- [x] 编写失败测试：`++重点++` 编译为 `{ type: "underline" }` mark。

  选择 `++text++` 作为当前 textarea 原型的 underline 临时语法；它只存在于 `EditorSource`，正式保存仍是 `PostBodyInlineMark`。

- [x] 编写失败测试：`**++重点++**` 或 `++[链接](https://example.com)++` 能保存为叠加 marks，不丢失 bold/link。

- [x] 编写失败测试：`createEditorDraftFromPostBody()` 能把 underline mark 回填为 `++text++`，遇到包含 `++` 或换行的 underline 文本时返回 unsupported，避免不无损回填。

- [x] 编写失败测试：toolbar action `underline` 会把选区包装为 `++选中文本++`，并返回正确选区。

- [x] 编写失败测试：`EditorWritingPane` 渲染 underline 按钮并 emit `toolbarAction: "underline"`。

- [x] 修改 `EditorCompiledInlineMark` 增加 `{ type: "underline" }`。

- [x] 在 `inlineParsers.ts` 的 delimiter specs 中加入 `++`，优先级放在 `~~` 之后、`***` 之前即可；保持现有 marks 叠加递归逻辑。

- [x] 在 `postBodyEditorDraftLoader.ts` 为 underline 增加 `++${text}++` 回填逻辑和 delimiter 冲突检查。

- [x] 在 `editorToolbarTransforms.ts` 增加 `EditorShowcaseToolbarAction` 的 `"underline"` 分支。

- [x] 在 `EditorWritingPane.vue` 的 inline toolbar 中增加 `U` 按钮，文案使用 `下划线`，保持现有 toolbar 分组和移动端主操作规则。

- [x] 运行 underline 相关测试。

  运行：

  ```bash
  pnpm exec vitest run \
    src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts \
    src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts \
    src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyEditorDraftLoader.spec.ts \
    src/features/editor-showcase/model/__tests__/editorToolbarTransforms.spec.ts \
    src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts
  ```

  预期：全部通过。

## 任务 4：建立 ProseMirror adapter 边界

**测试立场：** TDD - adapter contract 和架构边界。

**文件：**

- 新增：`src/features/editor-showcase/model/editorContentAdapter.ts`
- 新增：`src/features/editor-showcase/model/__tests__/editorContentAdapter.spec.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/index.ts`
- 修改：`src/features/editor-showcase/model/index.ts`
- 修改：`docs/design/editor-design.md`
- 修改：`docs/contracts/editor-content-contract.md`

- [x] 编写失败测试：当前 textarea adapter 的持久化出口只返回 `PostBodyWriteInput`，不返回 compiled blocks、preview blocks 或内部编辑器状态。

- [x] 编写失败测试：adapter 对 quote/list 嵌套能力声明为 V1 inline-only，不支持多段 quote 或嵌套 list。

- [x] 新增 adapter 类型：

  ```ts
  export type EditorInternalDocumentKind =
    "textarea-source" | "prosemirror-doc";

  export interface EditorContentAdapter<TInternalDocument> {
    readonly kind: EditorInternalDocumentKind;
    toPostBodyWriteInput(document: TInternalDocument): PostBodyWriteInput;
    toPreviewReaderBlocks(
      document: TInternalDocument,
    ): EditorPreviewReaderBlock[];
    getUnsupportedContentReasons(
      document: TInternalDocument,
    ): EditorUnsupportedContentReason[];
  }
  ```

- [x] 新增当前 textarea adapter，内部复用 `compileEditorContent()`、`mapEditorCompiledDocumentToPostBodyWriteInput()` 和 preview mapper。

- [x] 增加 `EditorUnsupportedContentReason` 类型，用于未来 ProseMirror adapter 报告多段 quote、嵌套 list、无 `fileId` 的系统媒体等不能保存的结构。

- [x] 文档补充：

  - ProseMirror doc 不进入 API。
  - ProseMirror adapter 输出 `PostBodyWriteInput` 后才能保存。
  - 不支持结构要阻止保存并定位提示，不能静默丢弃。

- [x] 运行 adapter 测试。

  运行：`pnpm exec vitest run src/features/editor-showcase/model/__tests__/editorContentAdapter.spec.ts`

  预期：全部通过。

## 任务 5：实现后端校验 path 到编辑位置的映射

**测试立场：** TDD - 错误 path 解析和 fallback 行为。

**文件：**

- 新增：`src/features/editor-showcase/model/editorValidationPathMapper.ts`
- 新增：`src/features/editor-showcase/model/__tests__/editorValidationPathMapper.spec.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/postBodyWriteInputCompiler.ts`
- 修改：`src/features/editor-showcase/model/editorContentCompiler/index.ts`
- 修改：`src/features/editor-showcase/model/index.ts`

- [x] 编写失败测试：`blocks[1].children[0].marks[0].href` 映射到正式保存模型中第 1 个 block 对应的 `sourceRange`。

- [x] 编写失败测试：preview spacer 不参与正式 block index；当源码中 code block 和 table 之间有两个空行时，`blocks[1]` 仍指向 table，而不是 preview spacer。

- [x] 编写失败测试：无法解析的 path、越界 block index 或没有 `sourceRange` 的 path 返回全局正文错误。

- [x] 新增 path 解析类型：

  ```ts
  export interface EditorValidationPathTarget {
    kind: "source-range" | "global";
    path: string;
    blockIndex?: number;
    sourceRange?: EditorCompiledSourceRange;
    reason?: string;
  }
  ```

- [x] 在正式保存 mapper 旁增加 mapping 输出：

  ```ts
  export interface PostBodyWriteInputWithSourceMap {
    writeInput: PostBodyWriteInput;
    blockSourceRanges: Array<EditorCompiledSourceRange | undefined>;
  }
  ```

- [x] 实现 `mapPostBodyValidationPathToEditorTarget(path, sourceMap)`；当前 textarea 返回 `source-range`，未来 ProseMirror adapter 可在同一边界返回 position。

- [x] 在源码注释中说明：后端 path 是保存模型 path，不是 preview block path，所以不能用 `readerBlockIndex` 直接映射。

- [x] 运行错误映射测试。

  运行：`pnpm exec vitest run src/features/editor-showcase/model/__tests__/editorValidationPathMapper.spec.ts`

  预期：全部通过。

## 任务 6：接入真实 Content API 保存基线

**测试立场：** TDD - API 请求契约、异步保存状态和服务端 hash 事实。

**文件：**

- 新增：`src/api/post.ts`
- 新增：`src/api/__tests__/post.spec.ts`
- 修改：`src/features/editor-showcase/model/useEditorShowcaseDraft.ts`
- 修改：`src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts`
- 修改：`src/features/editor-showcase/model/index.ts`

- [x] 编写失败测试：`saveDraftBody()` 发送的请求体包含最新 `PostBodyWriteInput` 和 `basePostVersion`。

  请求类型：

  ```ts
  export interface SaveDraftBodyReq extends PostBodyWriteInput {
    basePostVersion: number;
    baseDraftBodyId?: string;
    baseDraftBodyHash?: string;
    clientSavedAt?: string;
  }

  export interface SaveDraftBodyResp {
    postId: string;
    postVersion: number;
    draftBodyId: string;
    draftBodyHash: string;
    savedAt: string;
    wordCount: number;
  }
  ```

- [x] 编写失败测试：`useEditorShowcaseDraft.saveDraft()` 在提供 server save client 时，使用当前基线发起保存，并在成功后用响应更新 `basePostVersion/baseDraftBodyId/baseDraftBodyHash`。

- [x] 编写失败测试：保存请求不使用 `local:` hash 填充 `baseDraftBodyHash`。

- [x] 编写失败测试：保存失败时保留本地输入和 dirty 状态，不覆盖本地基线。

- [x] 新增 `src/api/post.ts`，按 ZhiCore 统一 envelope 解包 `data` 后返回 `SaveDraftBodyResp`。

  目标形态：

  ```ts
  interface ApiEnvelope<T> {
    code: number;
    message: string;
    data: T;
    timestamp: number;
    traceId?: string;
  }

  export async function saveDraftBody(
    postId: string,
    input: SaveDraftBodyReq,
  ): Promise<SaveDraftBodyResp> {
    const response = await getAxiosInstance().put<
      ApiEnvelope<SaveDraftBodyResp>
    >(`/v1/posts/${postId}/draft/body`, input);

    return response.data.data;
  }
  ```

  URL 按 `docs/contracts/editor-content-contract.md` 的 `/api/v1/posts/{postId}/draft/body` 语义和当前 Axios `baseURL: "/api"` 对齐。

- [x] 修改 `useEditorShowcaseDraft` options，注入 server save 依赖而不是在 composable 内直接 import API：

  ```ts
  export interface EditorServerDraftBaseline {
    postId: string;
    basePostVersion: number;
    baseDraftBodyId?: string;
    baseDraftBodyHash?: string;
  }

  export interface EditorDraftServerSaveClient {
    saveDraftBody(
      postId: string,
      input: SaveDraftBodyReq,
    ): Promise<SaveDraftBodyResp>;
  }
  ```

- [x] 保留无 server baseline 时的本地 demo 保存路径；有 server baseline 时走真实保存路径。

- [x] 将 `EditorSavedDraftSnapshot` 拆分为本地展示快照和服务端基线，命名避免把 `localContentHash` 误读成服务端 `draftBodyHash`。

- [x] 在成功保存后，只采信 `SaveDraftBodyResp.draftBodyHash` 作为下一次 `baseDraftBodyHash`。

- [x] 运行 API 和 draft 测试。

  运行：

  ```bash
  pnpm exec vitest run \
    src/api/__tests__/post.spec.ts \
    src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts
  ```

  预期：全部通过。

## 任务 7：文档、todo 和集成验证收口

**测试立场：** Mixed - 文档为直接修改；保存模型、API、adapter 走相关测试和类型检查。

**文件：**

- 修改：`docs/todo/2026-07-02-1907-editor-block-save-model.md`
- 修改：必要时更新 `docs/contracts/editor-content-contract.md`、`docs/design/editor-design.md`
- 修改：本计划 checkbox

- [x] 确认 todo 中每个 open item 已被代码、测试或文档覆盖；将已完成项打勾并把 `Status` 改为 `Done`。

- [x] 运行编辑器保存模型相关定向测试。

  运行：

  ```bash
  pnpm exec vitest run \
    src/entities/post-body/model/__tests__/policy.spec.ts \
    src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts \
    src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyWriteInput.spec.ts \
    src/features/editor-showcase/model/editorContentCompiler/__tests__/postBodyEditorDraftLoader.spec.ts \
    src/features/editor-showcase/model/__tests__/editorToolbarTransforms.spec.ts \
    src/features/editor-showcase/model/__tests__/editorContentAdapter.spec.ts \
    src/features/editor-showcase/model/__tests__/editorValidationPathMapper.spec.ts \
    src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts \
    src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts \
    src/api/__tests__/post.spec.ts
  ```

  预期：目标测试全部通过。

- [x] 运行类型检查。

  运行：`pnpm typecheck`

  预期：无 TypeScript 错误。

- [x] 运行格式检查。

  运行：

  ```bash
  pnpm exec prettier --check \
    docs/contracts/editor-content-contract.md \
    docs/design/editor-design.md \
    docs/todo/2026-07-02-1907-editor-block-save-model.md \
    src/entities/post-body/model/types.ts \
    src/entities/post-body/model/policy.ts \
    src/entities/post-body/model/index.ts \
    src/entities/post-body/index.ts \
    src/features/editor-showcase/model/editorContentCompiler/types.ts \
    src/features/editor-showcase/model/editorContentCompiler/inlineParsers.ts \
    src/features/editor-showcase/model/editorContentCompiler/postBodyWriteInputCompiler.ts \
    src/features/editor-showcase/model/editorContentCompiler/postBodyEditorDraftLoader.ts \
    src/features/editor-showcase/model/editorContentCompiler/index.ts \
    src/features/editor-showcase/model/editorToolbarTransforms.ts \
    src/features/editor-showcase/model/editorContentAdapter.ts \
    src/features/editor-showcase/model/editorValidationPathMapper.ts \
    src/features/editor-showcase/model/useEditorShowcaseDraft.ts \
    src/features/editor-showcase/model/index.ts \
    src/components/editor-showcase/EditorWritingPane.vue \
    src/api/post.ts
  ```

  预期：格式检查通过；如失败，运行 `pnpm exec prettier --write <具体文件>` 后重跑。

- [x] 运行空白错误检查。

  运行：`git diff --check`

  预期：无 trailing whitespace 或 conflict marker。

- [x] 如本任务后续进入提交，按仓库规则和 @committing-changes 组织最小可审阅提交。（本轮未提交，未触发提交流程。）

## 架构适配评估

- owner 明确：稳定正文 contract 和 provider policy 属于 `entities/post-body`；编辑器输入、preview、adapter 和错误位置映射属于 `features/editor-showcase/model`；API 请求封装属于 `src/api/post.ts`。
- 保存模型边界明确：正式 `PostBodyWriteInput` 不再复用 reader preview blocks，避免 `stableKey/sourceRange/spacer` 泄漏到长期契约。
- ProseMirror 边界明确：本计划不引入 ProseMirror 依赖，只建立 adapter 接口和不持久化内部 JSON 的防线；后续替换编辑器底层时按同一接口接入。
- V1 能力取舍明确：quote/list 保持 inline-only，是为了和现有后端草案、reader、loader 最小一致；多段和嵌套结构作为“不支持保存”显式暴露，避免静默损坏。
- hash 事实边界明确：本地 hash 只服务脏状态和 demo 保存；真实保存的并发基线只来自服务端读取或保存响应。
- 结构收敛充分：following this plan 会直接修复当前正式保存 mapper 的错误行为，并为媒体、underline、错误定位和 API 保存建立同一条 contract 管线，不需要完成后立刻二次重构保存模型。

## 回滚与恢复

- 保存 mapper、adapter、错误映射和 toolbar 改动集中在编辑器 feature 与 post-body entity，可按任务粒度 revert。
- `src/api/post.ts` 是新增 API adapter；若后端 endpoint 仍未 ready，可保留类型和注入式 save client，不影响默认本地 demo 保存路径。
- 若 underline 临时语法造成输入歧义，可回滚 toolbar/parser/loader 的 underline 切片，保留 reader 对后端 underline mark 的展示能力。
- 未改路由、构建配置、数据库、部署或全局 runtime 行为。

## 残余风险

- quote/list V1 保持扁平意味着未来 ProseMirror 多段和嵌套结构需要明确 UI 限制或升级 Content V2；本计划只保证不会静默保存错误结构。
- 当前错误映射在 textarea 原型中只能精确到 source line range，不能精确到 inline 字符；ProseMirror adapter 接入后需要扩展为 position mapping。
- 外部 embed provider 白名单当前只有 `image`；后续视频、卡片、链接预览 provider 需要后端 contract 先锁定。
