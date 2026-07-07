export interface MessageCenterMessage {
  id: string;
  author: "me" | "other";
  deliveryStatus?: "sent" | "read";
  text: string;
  sentAt: string;
}

export interface MessageCenterConversation {
  id: string;
  participantName: string;
  participantInitial: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  online: boolean;
  messages: MessageCenterMessage[];
}

export interface MessageCenterPageState {
  isLocalDemo: boolean;
  unreadCount: number | null;
  conversations: MessageCenterConversation[];
  activeConversation: MessageCenterConversation | null;
}
