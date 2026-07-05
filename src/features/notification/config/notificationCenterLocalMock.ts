import type { NotificationCenterItem } from "../types";

export const notificationCenterLocalMock: NotificationCenterItem[] = [
  {
    id: "notif-like",
    type: "interaction",
    title: "新的互动",
    body: "Han Meimei 赞了你的草稿《2026 前端趋势》。",
    occurredAt: "10 分钟前",
    unread: true,
  },
  {
    id: "notif-system",
    type: "system",
    title: "欢迎加入知构",
    body: "草稿已满足封面、摘要和标签要求。",
    occurredAt: "1 天前",
    unread: true,
  },
  {
    id: "notif-mention",
    type: "content",
    title: "内容提及",
    body: "Alice 在《Vue3 设计原理》中提到了你。",
    occurredAt: "3 天前",
    unread: true,
  },
];
