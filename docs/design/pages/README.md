# 页面设计索引

本目录记录 ZhiCore 前端的页面初设计、页面分区、接口编排、加载状态、空态、错误态和降级规则。

这些文档是产品 / 前端交互设计事实源，不替代后端 HTTP 字段级 contract。字段、错误码、path 和权限语义仍以后端服务级 HTTP schema 为准。

| 页面域 | 文档 | 页面性质 |
| --- | --- | --- |
| Auth | [auth.md](auth.md) | 登录、注册、会话和安全设置 |
| User | [user.md](user.md) | 资料、关注、拉黑和用户设置 |
| Content | [content.md](content.md) | 文章浏览、编辑、互动和内容管理 |
| Comment | [comment.md](comment.md) | 评论区、回复、评论点赞和审核入口 |
| Message | [message.md](message.md) | 私信会话、聊天线程、未读和发送状态 |
| Notification | [notification.md](notification.md) | 通知中心、偏好、免打扰和投递状态 |
| Search | [search.md](search.md) | 搜索框、建议、热门词、历史和结果列表 |
| Ranking | [ranking.md](ranking.md) | 热榜、周期榜、创作者 / 话题榜和 rebuild |
| File | [file.md](file.md) | 上传组件、批量上传、URL 解析和媒体入口 |
| Admin | [admin.md](admin.md) | 管理端总览、审核、举报和审计 |
| Gateway | [gateway.md](gateway.md) | 内部路由、认证、限流和下游诊断 |
| Ops | [ops.md](ops.md) | 对账、修复、事件回放和 worker 状态 |
| ID Generator | [id-generator.md](id-generator.md) | 当前无产品页，未来发号诊断页占位 |
