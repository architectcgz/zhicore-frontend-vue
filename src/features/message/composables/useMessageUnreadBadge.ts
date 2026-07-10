import { ref } from "vue";

import { getMessageUnreadCount } from "@/api/message";

// 顶栏/移动端导航消息未读徽标的轻量 owner：只拉未读摘要，不加载会话列表。
// 与 useMessageCenterPage 分开，避免仅为一个徽标就把整份会话列表工作流拉起来。
// 未读数加载失败保持 null，UI 用占位或隐藏 badge，不显示为 0。
export function useMessageUnreadBadge() {
  const unreadCount = ref<number | null>(null);

  async function refresh(): Promise<void> {
    try {
      const result = await getMessageUnreadCount();
      unreadCount.value = result.unreadCount;
    } catch {
      unreadCount.value = null;
    }
  }

  void refresh();

  return {
    unreadCount,
    refresh,
  };
}
