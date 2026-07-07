import type { MessageCenterConversation } from "../types";

export const messageCenterLocalMock: MessageCenterConversation[] = [
  {
    id: "conv-antigravity",
    participantName: "Antigravity",
    participantInitial: "AI",
    lastMessage: "编辑器保存冲突那篇我看完了，有一个问题想请教。",
    lastMessageAt: "刚刚",
    unreadCount: 2,
    online: true,
    messages: [
      {
        id: "msg-1",
        author: "other",
        text: "编辑器保存冲突那篇我看完了，有一个问题想请教。",
        sentAt: "16:00",
      },
      {
        id: "msg-2",
        author: "me",
        deliveryStatus: "read",
        text: "可以，我们把冲突提示放在正文保存状态旁边。",
        sentAt: "16:02",
      },
    ],
  },
  {
    id: "conv-lin",
    participantName: "Lin",
    participantInitial: "林",
    lastMessage: "你的编辑器体验笔记我收藏了。",
    lastMessageAt: "2 小时前",
    unreadCount: 0,
    online: false,
    messages: [
      {
        id: "msg-3",
        author: "other",
        text: "你的编辑器体验笔记我收藏了。",
        sentAt: "14:12",
      },
    ],
  },
];
