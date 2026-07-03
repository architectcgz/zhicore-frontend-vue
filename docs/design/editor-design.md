# 编辑器设计方向

本文记录 ZhiCore 前端编辑器模块的视觉与交互方向。后续实现编辑器、展示页或阅读页时，优先按本文保持一致。

## 结论

主编辑器采用“专注写作 + 可切换预览”的混合方案：

- 默认进入专注写作模式，弱化工具栏和结构边框，让标题、段落和保存状态成为主要视觉。
- 预览面板作为发布前检查能力出现，支持用户查看读者视图、封面、摘要、字数、保存版本和草稿指纹。
- 后端正文模型仍然是 `schemaVersion + blocks`，但前端不把 blocks 直接做成重卡片或管理后台式 UI。
- `/editor` 正文运行时事实是 Tiptap doc / JSON；保存和读者预览由 Tiptap mapper 直接映射为 `PostBodyWriteInput` / reader blocks。
- 编辑器背景保留多候选能力，当前候选为纸面、青绿、暖沙和墨蓝，用于比较写作场景下的阅读舒适度。

## 方案取舍

### 专注写作

适合作为默认编辑体验。

- 优点：干扰少，写作节奏清晰，适合普通文章和长文。
- 要求：工具栏保持轻量；保存状态、冲突状态和发布动作要清楚但不抢正文注意力。

### 写作 + 预览

适合作为编辑器的辅助模式，尤其是发布前确认。

- 优点：能同时检查最终读者视图和草稿事实字段。
- 要求：预览面板可开关，不应长期压缩主写作区；移动端优先做分段切换而不是强行左右分栏。

### 工程文档

适合阅读页、展示页或技术文档模板，不作为默认编辑器。

- 优点：结构感强，适合最终展示技术内容。
- 限制：作为编辑器默认态会让写作界面显得过重。

### 结构化 Blocks

不采用当前展示页里的强结构化视觉作为主编辑器方向。

- 保留：后端保存和校验仍然以 blocks 为事实模型。
- 调整：前端只在 hover、focus、拖拽、插入、错误定位时露出 block handle、类型菜单和校验提示。
- 避免：不要把每个 block 默认渲染成厚重卡片；用户应感觉自己在写文章，而不是操作 JSON 结构。

### 连续文档编辑器

当前主编辑器原型采用“连续文档 + 隐形 blocks 结构层”：

- 正文区保持标题和段落连续排版，编辑行为优先接近普通文档写作。
- 左侧 gutter 承担插入、拖拽、定位和 block path 暴露，不在正文里画出段落卡片。
- 悬浮格式工具只服务当前选区，不能把编辑区拆成工具面板或配置表单。
- 工具按钮必须有实际编辑行为：行内按钮给当前选区施加 Tiptap mark，`Code` / `H2` 这类结构按钮通过 Tiptap command 生成对应 node 并回到正文焦点。
- 校验错误和后端冲突应定位到具体文本位置或 gutter 标记，默认不打断整篇文章的阅读流。

### Tiptap 正文事实

`/editor` 不再把 Markdown-like source 当作正文事实：

- 输入态以 Tiptap doc / JSON 保存正文和选区事实。
- `**文本**`、`++文本++`、``` 等字符序列只作为普通文本存在，不触发行内格式或 block 结构。
- 加粗、链接、标题、引用、列表、代码、公式、表格和外部图片嵌入通过 Tiptap mark / node 表达。
- 后端仍只接收 `PostBodyWriteInput`；Tiptap JSON 只存在于编辑器运行时和前端草稿状态，不直接提交给 Content API。

### 预览渲染规则

预览器渲染结构化模型，不直接把 markdown 源文本塞进 DOM：

- code block 来自 Tiptap `codeBlock` node，单独记录语言并用 `<pre><code>` 展示纯代码内容。
- link 应解析成安全 inline 节点，用 `<a>` 渲染；不要用 `v-html` 渲染用户输入。
- bold 等行内格式来自 Tiptap mark，例如 `bold` mark 渲染为 `<strong>`；原始 `**text**` 字符串按普通文本展示。
- 不支持的结构块可以临时降级为结构化块预览，但不能混进纯文本段落里展示为原始标记。

### Mapper 边界

编辑器输入状态和后端保存模型通过 Tiptap mapper 分离：

- 编辑器 feature model 负责标题、Tiptap 正文 JSON、选区、字数、保存状态和撤销/重做。
- Tiptap mapper 负责把 doc 映射为 `PostBodyWriteInput`、reader preview blocks 和纯文本统计。
- 预览组件消费 reader preview blocks 渲染，不自行解析 markdown、code fence 或链接。
- 旧 Markdown-like compiler / textarea adapter 已删除；`/editor` runtime 不再存在 source string 编译入口。
- mapper 遇到 Content V1 暂不支持的超深容器、复杂表格单元格或缺少 Upload `fileId` 的系统媒体时，应阻止保存并定位提示，不能静默压平为 inline 文本。

## 与后端契约的关系

编辑器视觉可以保持写作体验，但数据提交必须对齐 Content 后端契约：

- 详细 API / DTO / 错误处理规则见 `docs/contracts/editor-content-contract.md`。
- 草稿正文保存为 `schemaVersion + blocks`。
- 系统内媒体使用 Upload 返回的 `fileId`，展示 URL 只是派生值。
- 保存草稿时携带 `basePostVersion`、`baseDraftBodyId` 和 `baseDraftBodyHash`。
- `DRAFT_CONFLICT` 时保留本地改动，提示用户刷新或合并，不静默覆盖服务端草稿。
- block 级校验错误应映射到具体编辑位置，例如 `blocks[3].children[1].latex`。

## 当前原型

当前样式比较页位于：

- 路由：`/editor`
- 主编辑器页面：`src/pages/editor/EditorRoutePage.vue`
- 主编辑器工作台组件：`src/features/editor/ui/EditorWorkspace.vue`
- 工程文档展示路由：`/editor-document`
- 工程文档展示组件：`src/components/editor/EditorDocumentViewer.vue`

后续进入真实编辑器实现时，应以“专注写作”为默认形态，并把“写作 + 预览”收敛为可切换视图或侧边面板。

## 背景候选

背景色不是装饰层，而是编辑器长时间写作时的阅读环境。当前展示器保留四个候选：

- 纸面：默认背景，适合普通写作和长时间阅读。
- 青绿：降低冷白界面压力，适合偏安静的创作氛围。
- 暖沙：保留旧示例里的暖色质感，适合更柔和的写作界面。
- 墨蓝：提供暗色候选，用于夜间或低光环境下比较。

后续真实编辑器可以继续保留背景切换，但背景选择应只影响编辑器工作区，不改变后端 blocks 数据模型。
