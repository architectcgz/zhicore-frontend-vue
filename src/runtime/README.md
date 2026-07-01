# runtime/

全局运行时基础设施。

## 职责

- HTTP 401 拦截 → 自动登出跳转
- Vue `app.config.errorHandler` → 未捕获异常的全局兜底
- Router `onError` → 路由错误的全局兜底
- 命名空间 logger → 各模块按需初始化自己的开发调试日志
- 后续可扩展：性能监控、客户端错误上报、全局 loading 条

## 约定

- 在 `main.ts` 中通过 `setupGlobalErrorRuntime()` 一次性注册
- 各部分可独立替换：传入自定义 `ErrorRuntimeOptions` 覆盖默认行为
- 模块内使用 `createAppLogger(["module", "scope"])` 创建 logger，调用方不需要管理 logger 生命周期
- logger 不在模块加载时自动启用全局开关；开发调试时通过浏览器 `localStorage.debug = "zhicore:*"` 或更窄的 namespace 开启
