# api/

后端 provider HTTP 适配器层。

## 职责

- 封装 HTTP 请求（基于 `src/api/request.ts` 提供的 Axios 实例）。
- 定义后端 provider 可复用接口的入参和返回值类型，具体 HTTP 接口使用 `Req` / `Resp` 后缀。
- 在 transport 层注入运行时登录态所需的 `Authorization` 和 `X-CSRF-Token` header。
- 处理请求参数序列化、`FormData` 构造、响应 envelope 解包和 API 边界归一化。
- 作为 feature workflow 的下游 adapter，不直接承载页面流程、导航或 UI 状态。

## 约定

- 按后端 provider 或稳定资源能力拆分文件（`auth.ts`、`post.ts`、`comment.ts`、`file.ts` ...）。
- 可导出函数或轻量 client 对象；导出形态以现有调用模式和测试便利性为准，不强制类。
- 可以做 API 边界归一化，例如 ID 字符串化、可空字段默认值、时间字段规范化；不要做 feature view model 映射。
- 不在这里管理请求状态（loading / error）、导航、toast 或业务权限判断，这些归 feature workflow。
- 只有 endpoint 明确只服务单一 feature 且不会被其他 feature 复用时，才放到 `src/features/<feature>/api/`。
- 页面、布局和组件不直接 import 本目录；业务请求必须从 `src/features/*` 进入。

## 本地 Mock API

- 本地 mock 只在 API adapter 层接入，fixture 放在 `src/api/mock/` 或 adapter 私有范围。
- mock 返回值必须使用真实 `Req` / `Resp` DTO 类型，模拟后端 API 返回，而不是模拟 feature view model。
- feature、page、component 不新增 mock 开关，也不 import `src/api/mock/**`；它们继续调用正常 API 函数。
- 切换到真实 API 时，只允许改 adapter、fixture 或环境变量，不改页面和 feature 工作流。
- 新增 mock adapter 时，在 `src/api/__tests__` 验证 mock 模式下不调用 Axios，真实模式下仍验证 URL / 参数 / 解包。

## 示例

```ts
// src/api/post.ts
import { getAxiosInstance } from "./request";
import type { Post } from "@/entities/post";

export async function getPost(id: string): Promise<Post> {
  const res = await getAxiosInstance().get<Post>(`/posts/${id}`);
  return res.data;
}
```
