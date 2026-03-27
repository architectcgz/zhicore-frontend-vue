import { describe, expect, it } from 'vitest';
import {
  buildConversationPage,
  buildMessagePage,
  toSendMessagePayload,
  type BackendConversationDTO,
  type BackendMessageDTO,
} from '@/api/message';

describe('message api adapters', () => {
  it('maps backend conversation dto list into page-friendly conversations', () => {
    const conversations: BackendConversationDTO[] = [
      {
        id: '2001',
        otherUserId: '3001',
        otherUserNickName: 'Alice',
        otherUserAvatarUrl: 'alice.png',
        lastMessageContent: '你好',
        lastMessageAt: '2026-03-23T13:20:00',
        unreadCount: 2,
        createdAt: '2026-03-20T08:00:00',
      },
    ];

    const page = buildConversationPage(conversations);

    expect(page).toEqual({
      items: [
        {
          id: '2001',
          participantIds: ['3001'],
          participants: [
            expect.objectContaining({
              id: '3001',
              nickname: 'Alice',
              avatar: 'alice.png',
            }),
          ],
          lastMessage: expect.objectContaining({
            conversationId: '2001',
            content: '你好',
          }),
          unreadCount: 2,
          updatedAt: '2026-03-23T13:20:00',
        },
      ],
      total: 1,
      page: 1,
      size: 1,
      hasMore: false,
    });
  });

  it('maps backend message dto list into page-friendly message items', () => {
    const messages: BackendMessageDTO[] = [
      {
        id: '5001',
        conversationId: '2001',
        senderId: '3001',
        receiverId: '4001',
        type: 'TEXT',
        content: 'hello',
        createdAt: '2026-03-23T13:20:00',
        isRead: false,
      },
    ];

    const page = buildMessagePage(messages);

    expect(page).toEqual({
      items: [
        expect.objectContaining({
          id: '5001',
          conversationId: '2001',
          senderId: '3001',
          receiverId: '4001',
          content: 'hello',
          messageType: 'TEXT',
          isRead: false,
          sequence: 1,
          createdAt: '2026-03-23T13:20:00',
        }),
      ],
      total: 1,
      page: 1,
      size: 1,
      hasMore: false,
    });
  });

  it('converts send message request to backend payload field names', () => {
    expect(toSendMessagePayload({
      receiverId: '4001',
      content: 'hello',
      messageType: 'TEXT',
      conversationId: '2001',
    })).toEqual({
      receiverId: '4001',
      type: 'TEXT',
      content: 'hello',
    });
  });
});
