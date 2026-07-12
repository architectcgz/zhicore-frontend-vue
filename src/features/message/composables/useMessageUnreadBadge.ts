import { storeToRefs } from "pinia";

import { useMessageUnreadStore } from "@/stores/messageUnread";

// 顶栏/移动端导航消息未读徽标：读共享未读 store，与会话列表、会话行徽标同一信息源。
// 进入会话既读后，store 的 total 立即下降，这里的红点无需自行轮询即可跟随更新。
// 未读数加载失败保持 null，UI 用占位或隐藏 badge，不显示为 0。
export function useMessageUnreadBadge() {
  const unreadStore = useMessageUnreadStore();
  const { total: unreadCount } = storeToRefs(unreadStore);

  // 首次挂载拉一次未读摘要；已有会话列表页时 store 可能已被 hydrate，这里仍是安全的幂等刷新。
  void unreadStore.refreshTotal();

  return {
    unreadCount,
    refresh: unreadStore.refreshTotal,
  };
}
