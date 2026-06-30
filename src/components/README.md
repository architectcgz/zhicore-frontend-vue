# components/

UI 组件层。按业务领域分组的可复用界面块。

## 职责

- 纯 UI 渲染，不直接发请求、不直接操作 store
- 通过 props 接收数据，通过 emits 向外传递事件
- 可以有自己的内部 UI 状态（如展开/收起），但不包含业务决策

## 目录组织

- `components/common/`：跨领域通用组件（EmptyState、LoadingSpinner、ErrorBoundary ...）
- `components/post/`：文章相关组件（PostCard、PostEditor、MarkdownPreview ...）
- `components/comment/`：评论相关组件（CommentItem、CommentList ...）
- `components/user/`：用户相关组件（UserCard、ProfileSection ...）
- 后续按业务增长继续添加子目录

## 示例

```vue
<!-- components/post/PostCard.vue -->
<script setup lang="ts">
import type { Post } from '@/entities/post'

defineProps<{ post: Post }>()
defineEmits<{ click: [postId: string] }>()
</script>
```
