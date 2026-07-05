import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { messageCenterLocalMock } from "../config/messageCenterLocalMock";
import type { MessageCenterPageState } from "../types";

interface UseMessageCenterPageOptions {
  localDemoEnabled?: boolean;
}

const unavailableMessageCenterState: MessageCenterPageState = {
  isLocalDemo: false,
  unreadCount: null,
  conversations: [],
  activeConversation: null,
};

export function useMessageCenterPage(
  options: UseMessageCenterPageOptions = {},
): MessageCenterPageState {
  const localDemoEnabled = options.localDemoEnabled ?? isLocalDemoModeEnabled();

  if (!localDemoEnabled) {
    return unavailableMessageCenterState;
  }

  const unreadCount = messageCenterLocalMock.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  return {
    isLocalDemo: true,
    unreadCount,
    conversations: messageCenterLocalMock,
    activeConversation: messageCenterLocalMock[0] ?? null,
  };
}
