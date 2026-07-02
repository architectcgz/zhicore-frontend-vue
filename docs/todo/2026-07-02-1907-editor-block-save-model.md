# Editor Block Save Model 优化待办

- Project: `/home/azhi/workspace/projects/zhicore-frontend-vue`
- Created: `2026-07-02T19:07+08:00`
- Status: `Done`

## Context

在引入 ProseMirror 作为 zhicore-frontend 编辑器底层前，先收敛当前结构化 block 保存模型，避免 Markdown 原型或预览概念漏入长期内容契约。

## Open Items

- [x] 拆分 reader preview blocks 与正式 PostBodyWriteInput，保存路径不得写入空行 spacer、sourceRange、label、stableKey 等预览/UI 字段。
- [x] 决定 quote/list 的 V1 表达能力：继续保持扁平 inline-only，或升级为 quote.blocks 与 list.items[].blocks 以匹配 ProseMirror 多段/嵌套结构。
- [x] 建立 ProseMirror adapter 边界：ProseMirror doc 只作为编辑器内部状态，长期保存仍输出 PostBodyWriteInput，不直接保存 ProseMirror JSON。
- [x] 梳理媒体 block 语义：系统内图片/附件必须保存 Upload fileId；外部图片或第三方资源走 external_embed 和 provider 白名单。
- [x] 补齐 inline marks 语义：编辑器/adapter 支持 underline，并确保 bold、italic、strike、inline_code、link 等叠加 marks 可无损保存和渲染。
- [x] 设计后端校验错误到编辑位置的映射：将 blocks[...].children[...] 等 path 映到当前 source range；未来 ProseMirror adapter 可替换为 position，无法映射时降级为全局正文错误。
- [x] 接真实 Content API 保存时，使用 basePostVersion、baseDraftBodyId、baseDraftBodyHash 和服务端返回的 draftBodyHash，不把 local hash 当服务端事实。
