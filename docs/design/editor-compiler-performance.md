# 编辑器内容编译性能优化

本文记录 ZhiCore 前端编辑器内容编译链路的性能优化事实，后续可用于项目复盘、简历描述和后端解析器对齐。

## 背景

编辑器预览依赖 `editorContentCompiler` 将用户输入的 Markdown-like 文本编译为结构化 blocks 和 HTML。实时输入场景下，如果每次输入都同步完整编译，并且 inline parser 对每个字符尝试所有规则，会放大不必要的解析开销。

相关提交：

- `beb6e4d perf(editor): 优化编辑器内容编译`

## 优化内容

### 输入停止后再编译

`useEditorShowcaseDraft` 将正文预览编译改为默认 `160ms` debounce。

- 用户连续输入时，不在每次 `updateBody` 后立即编译。
- 预览在用户短暂停顿后刷新，降低高频输入期间的同步解析压力。
- 解析类测试可通过 `previewCompileDebounceMs: 0` 保持同步断言，避免把测试重点和防抖行为混在一起。

### 重复内容跳过编译

`useEditorShowcaseDraft` 增加正文 hash + 原文双重判断。

- 正文未变化时直接跳过编译。
- hash 用于快速判断，原文比较用于避免 hash 碰撞导致误判。
- 标题不进入正文编译器，所以标题变化不触发内容编译。

### Inline 触发字符分派

`inlineParsers` 从“每个字符尝试全部 inline 规则”改为“遇到触发字符后只尝试对应规则”。

当前触发字符：

- `` ` ``：inline code
- `[`：link
- `~`：strikethrough
- `*`：strong / emphasis
- `_`：strong / emphasis

这样普通文本字符不会再逐个尝试所有正则规则，减少无效匹配次数，同时保留原有语法优先级。

## 测试覆盖

本次优化补充了行为测试：

- 连续输入只在 debounce 后编译最后一次。
- 相同正文不重复编译。
- 原有 Markdown 解析行为保持不变。

验证命令：

- `pnpm exec vue-tsc --noEmit`
- `pnpm exec prettier --check ...`
- `pnpm test:run`

验证结果：

- 5 个测试文件通过
- 24 个测试通过

## 可用于简历的事实基础

- 针对 Markdown 编辑器实时预览场景，优化内容编译链路，降低高频输入时的同步解析开销。
- 通过 debounce、内容 hash 缓存和 inline 触发字符分派，减少无效编译与不必要的正则匹配。
- 为性能优化补充 Vitest 行为测试，覆盖 debounce 合并、重复内容跳过和 Markdown 解析回归。
