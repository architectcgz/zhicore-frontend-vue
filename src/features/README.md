# features/

业务流程层。每个 feature 是一个完整的用户动作或流程的 owner。

## 职责

- 管理业务流程的状态、校验、提交流程
- 可以调用 API、操作 Pinia store
- 一个 feature 解决一个具体业务问题（登录、发文章、评论、上传...）

## 与全局 composables/ 的区别

| 维度     | features/*/composables                    | src/composables               |
| -------- | ----------------------------------------- | ----------------------------- |
| 业务耦合 | 绑定具体业务（知道 API、store、路由语义） | 纯工具，不碰业务              |
| 复用范围 | 被特定 feature 的页面/组件调用            | 全项目复用                    |
| 例子     | `useLoginForm`、`useEditorDraft`          | `useDebounce`、`useFocusTrap` |

## 约定

- 按业务领域拆分子目录：`auth/`、`post/`、`comment/`、`notification/` ...
- `composables/` 放业务流程组合函数、表单状态、异步动作和页面级 workflow owner
- `lib/` 放 feature-local 纯函数、状态机、DTO/view model 映射、持久化 helper 等非 Vue 逻辑
- `config/` 放 feature-local 选项、默认值和静态配置
- 和第三方运行时强绑定的适配可用明确目录命名，例如 editor 的 `tiptap/`
- 如果 feature 有自己的子组件，放 `ui/`
- 通过 `index.ts` 统一导出公开 API
- 不再使用 `model/` 作为 features 下的通用桶，避免把组合函数、配置、适配器和领域对象混在一个含义不清的目录里

## 示例

```ts
// features/auth/composables/useLoginForm.ts
export function useLoginForm() {
  const router = useRouter();
  const authStore = useAuthStore();

  const username = ref("");
  const submitting = ref(false);

  async function submit() {
    const session = await login({ username: username.value, password: "..." });
    authStore.setAuth(session);
    await router.push("/");
  }

  return { username, submitting, submit };
}
```
