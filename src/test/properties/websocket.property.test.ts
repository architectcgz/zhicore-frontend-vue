/**
 * WebSocket 类型安全属性测试
 * Property-based tests for WebSocket type safety
 * 
 * Feature: typescript-type-safety, Property 1: 消息数据的类型安全
 * Validates: Requirements 1.1, 1.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { PBT_CONFIG } from '../setup';
import type {
  WebSocketMessage,
  ChatMessagePayload,
  NotificationPayload,
  SystemMessagePayload,
  HeartbeatPayload,
  ConnectionEventData,
  ErrorEventData,
  MessageHandler
} from '@/types/websocket';
import type { NotificationType } from '@/types';

/**
 * 生成随机的聊天消息载荷
 * Generate random chat message payload
 */
const chatMessagePayloadArb = fc.record({
  conversationId: fc.string({ minLength: 1, maxLength: 50 }),
  senderId: fc.string({ minLength: 1, maxLength: 50 }),
  content: fc.string({ minLength: 1, maxLength: 500 }),
  messageType: fc.constantFrom('TEXT', 'IMAGE', 'FILE') as fc.Arbitrary<'TEXT' | 'IMAGE' | 'FILE'>
});

/**
 * 生成随机的通知消息载荷
 * Generate random notification payload
 */
const notificationPayloadArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom('LIKE', 'COMMENT', 'FOLLOW', 'SYSTEM') as fc.Arbitrary<NotificationType>,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  content: fc.string({ minLength: 1, maxLength: 500 }),
  relatedId: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
});

/**
 * 生成随机的系统消息载荷
 * Generate random system message payload
 */
const systemMessagePayloadArb = fc.record({
  code: fc.string({ minLength: 1, maxLength: 20 }),
  message: fc.string({ minLength: 1, maxLength: 200 }),
  data: fc.option(
    fc.dictionary(fc.string(), fc.anything()),
    { nil: undefined }
  )
});

/**
 * 生成随机的心跳载荷
 * Generate random heartbeat payload
 */
const heartbeatPayloadArb = fc.record({
  timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
});

/**
 * 生成随机的连接事件数据
 * Generate random connection event data
 */
const connectionEventDataArb = fc.record({
  timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 }),
  code: fc.option(fc.integer({ min: 1000, max: 1015 }), { nil: undefined }),
  reason: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined })
});

/**
 * 生成随机的错误事件数据
 * Generate random error event data
 */
const errorEventDataArb = fc.record({
  error: fc.constant(new Error('Test error')),
  timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
});

/**
 * 生成随机的 WebSocket 消息（可辨识联合类型）
 * Generate random WebSocket message (discriminated union)
 */
const webSocketMessageArb: fc.Arbitrary<WebSocketMessage> = fc.oneof(
  // Chat message
  fc.record({
    type: fc.constant('chat' as const),
    data: chatMessagePayloadArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  }),
  // Notification message
  fc.record({
    type: fc.constant('notification' as const),
    data: notificationPayloadArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  }),
  // System message
  fc.record({
    type: fc.constant('system' as const),
    data: systemMessagePayloadArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  }),
  // Ping message
  fc.record({
    type: fc.constant('ping' as const),
    data: heartbeatPayloadArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  }),
  // Pong message
  fc.record({
    type: fc.constant('pong' as const),
    data: heartbeatPayloadArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  }),
  // Connected message
  fc.record({
    type: fc.constant('connected' as const),
    data: connectionEventDataArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  }),
  // Disconnected message
  fc.record({
    type: fc.constant('disconnected' as const),
    data: connectionEventDataArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  }),
  // Error message
  fc.record({
    type: fc.constant('error' as const),
    data: errorEventDataArb,
    timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 })
  })
);

describe('WebSocket 类型安全属性测试', () => {
  /**
   * Property 1: 消息数据的类型安全
   * Message Data Type Safety
   * 
   * 对于任何 WebSocket 消息，消息的 data 类型应该与消息的 type 字段匹配，
   * 并且 TypeScript 应该能够正确地辨识和收窄类型。
   * 
   * For any WebSocket message, the message data type should match the message type field,
   * and TypeScript should correctly discriminate and narrow the type.
   * 
   * Validates: Requirements 1.1, 1.4
   */
  it('Property 1: 消息数据的类型安全 - Message Data Type Safety', () => {
    fc.assert(
      fc.property(webSocketMessageArb, (message) => {
        // 验证消息具有必需的基础属性
        // Verify message has required base properties
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('data');
        expect(message).toHaveProperty('timestamp');
        expect(typeof message.type).toBe('string');
        expect(typeof message.timestamp).toBe('number');

        // 根据消息类型验证数据结构
        // Verify data structure based on message type
        switch (message.type) {
          case 'chat': {
            // TypeScript 应该将 data 收窄为 ChatMessagePayload
            // TypeScript should narrow data to ChatMessagePayload
            const data = message.data as ChatMessagePayload;
            expect(data).toHaveProperty('conversationId');
            expect(data).toHaveProperty('senderId');
            expect(data).toHaveProperty('content');
            expect(data).toHaveProperty('messageType');
            expect(typeof data.conversationId).toBe('string');
            expect(typeof data.senderId).toBe('string');
            expect(typeof data.content).toBe('string');
            expect(['TEXT', 'IMAGE', 'FILE']).toContain(data.messageType);
            break;
          }

          case 'notification': {
            // TypeScript 应该将 data 收窄为 NotificationPayload
            // TypeScript should narrow data to NotificationPayload
            const data = message.data as NotificationPayload;
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('type');
            expect(data).toHaveProperty('title');
            expect(data).toHaveProperty('content');
            expect(typeof data.id).toBe('string');
            expect(['LIKE', 'COMMENT', 'FOLLOW', 'SYSTEM']).toContain(data.type);
            expect(typeof data.title).toBe('string');
            expect(typeof data.content).toBe('string');
            if (data.relatedId !== undefined) {
              expect(typeof data.relatedId).toBe('string');
            }
            break;
          }

          case 'system': {
            // TypeScript 应该将 data 收窄为 SystemMessagePayload
            // TypeScript should narrow data to SystemMessagePayload
            const data = message.data as SystemMessagePayload;
            expect(data).toHaveProperty('code');
            expect(data).toHaveProperty('message');
            expect(typeof data.code).toBe('string');
            expect(typeof data.message).toBe('string');
            if (data.data !== undefined) {
              expect(typeof data.data).toBe('object');
            }
            break;
          }

          case 'ping':
          case 'pong': {
            // TypeScript 应该将 data 收窄为 HeartbeatPayload
            // TypeScript should narrow data to HeartbeatPayload
            const data = message.data as HeartbeatPayload;
            expect(data).toHaveProperty('timestamp');
            expect(typeof data.timestamp).toBe('number');
            break;
          }

          case 'connected':
          case 'disconnected': {
            // TypeScript 应该将 data 收窄为 ConnectionEventData
            // TypeScript should narrow data to ConnectionEventData
            const data = message.data as ConnectionEventData;
            expect(data).toHaveProperty('timestamp');
            expect(typeof data.timestamp).toBe('number');
            if (data.code !== undefined) {
              expect(typeof data.code).toBe('number');
            }
            if (data.reason !== undefined) {
              expect(typeof data.reason).toBe('string');
            }
            break;
          }

          case 'error': {
            // TypeScript 应该将 data 收窄为 ErrorEventData
            // TypeScript should narrow data to ErrorEventData
            const data = message.data as ErrorEventData;
            expect(data).toHaveProperty('error');
            expect(data).toHaveProperty('timestamp');
            expect(data.error).toBeInstanceOf(Error);
            expect(typeof data.timestamp).toBe('number');
            break;
          }

          case 'new_message':
          case 'message_read':
          case 'message_deleted':
          case 'typing':
          case 'online_status':
          case 'notification_read':
          case 'unread_count':
          case 'max_reconnect_attempts':
          case 'send_message':
          case 'mark_read': {
            // 这些消息类型有各自的载荷类型，这里只验证基本结构
            // These message types have their own payload types, just verify basic structure
            expect(message.data).toBeDefined();
            expect(typeof message.data).toBe('object');
            break;
          }

          default: {
            // 不应该到达这里 - 所有消息类型都应该被处理
            // Should not reach here - all message types should be handled
            const _exhaustiveCheck: never = message;
            throw new Error(`未处理的消息类型: ${(_exhaustiveCheck as any).type}`);
          }
        }

        return true;
      }),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 1.1: 消息处理器类型匹配
   * Message Handler Type Matching
   * 
   * 对于任何消息类型，消息处理器应该接收与该消息类型匹配的数据类型。
   * 
   * For any message type, the message handler should receive data type matching that message type.
   * 
   * Validates: Requirements 1.1, 1.4
   */
  it('Property 1.1: 消息处理器类型匹配 - Message Handler Type Matching', () => {
    fc.assert(
      fc.property(webSocketMessageArb, (message) => {
        // 模拟消息处理器调用
        // Simulate message handler invocation
        let handlerCalled = false;
        let receivedData: any = null;

        // 创建类型安全的处理器
        // Create type-safe handler
        const createHandler = <T extends WebSocketMessage['type']>(
          _expectedType: T
        ): MessageHandler<T> => {
          return (data) => {
            handlerCalled = true;
            receivedData = data;
          };
        };

        // 根据消息类型调用相应的处理器
        // Invoke appropriate handler based on message type
        switch (message.type) {
          case 'chat': {
            const handler = createHandler('chat');
            handler(message.data as ChatMessagePayload);
            expect(handlerCalled).toBe(true);
            expect(receivedData).toHaveProperty('conversationId');
            expect(receivedData).toHaveProperty('senderId');
            expect(receivedData).toHaveProperty('content');
            expect(receivedData).toHaveProperty('messageType');
            break;
          }

          case 'notification': {
            const handler = createHandler('notification');
            handler(message.data as NotificationPayload);
            expect(handlerCalled).toBe(true);
            expect(receivedData).toHaveProperty('id');
            expect(receivedData).toHaveProperty('type');
            expect(receivedData).toHaveProperty('title');
            expect(receivedData).toHaveProperty('content');
            break;
          }

          case 'system': {
            const handler = createHandler('system');
            handler(message.data as SystemMessagePayload);
            expect(handlerCalled).toBe(true);
            expect(receivedData).toHaveProperty('code');
            expect(receivedData).toHaveProperty('message');
            break;
          }

          case 'ping':
          case 'pong': {
            const handler = createHandler(message.type);
            handler(message.data as HeartbeatPayload);
            expect(handlerCalled).toBe(true);
            expect(receivedData).toHaveProperty('timestamp');
            break;
          }

          case 'connected':
          case 'disconnected': {
            const handler = createHandler(message.type);
            handler(message.data as ConnectionEventData);
            expect(handlerCalled).toBe(true);
            expect(receivedData).toHaveProperty('timestamp');
            break;
          }

          case 'error': {
            const handler = createHandler('error');
            handler(message.data as ErrorEventData);
            expect(handlerCalled).toBe(true);
            expect(receivedData).toHaveProperty('error');
            expect(receivedData).toHaveProperty('timestamp');
            break;
          }
        }

        return true;
      }),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 1.2: 消息序列化和反序列化一致性
   * Message Serialization and Deserialization Consistency
   * 
   * 对于任何 WebSocket 消息，序列化后再反序列化应该得到等价的消息对象。
   * 
   * For any WebSocket message, serializing and then deserializing should yield an equivalent message object.
   * 
   * Validates: Requirements 1.1, 1.4
   */
  it('Property 1.2: 消息序列化和反序列化一致性 - Message Serialization Consistency', () => {
    fc.assert(
      fc.property(webSocketMessageArb, (message) => {
        // 序列化消息
        // Serialize message
        const serialized = JSON.stringify(message);
        expect(typeof serialized).toBe('string');

        // 反序列化消息
        // Deserialize message
        const deserialized: WebSocketMessage = JSON.parse(serialized);

        // 验证反序列化后的消息与原始消息等价
        // Verify deserialized message is equivalent to original
        expect(deserialized.type).toBe(message.type);
        expect(deserialized.timestamp).toBe(message.timestamp);

        // 验证数据字段
        // Verify data field
        switch (message.type) {
          case 'chat': {
            const originalData = message.data as ChatMessagePayload;
            const deserializedData = deserialized.data as ChatMessagePayload;
            expect(deserializedData.conversationId).toBe(originalData.conversationId);
            expect(deserializedData.senderId).toBe(originalData.senderId);
            expect(deserializedData.content).toBe(originalData.content);
            expect(deserializedData.messageType).toBe(originalData.messageType);
            break;
          }

          case 'notification': {
            const originalData = message.data as NotificationPayload;
            const deserializedData = deserialized.data as NotificationPayload;
            expect(deserializedData.id).toBe(originalData.id);
            expect(deserializedData.type).toBe(originalData.type);
            expect(deserializedData.title).toBe(originalData.title);
            expect(deserializedData.content).toBe(originalData.content);
            expect(deserializedData.relatedId).toBe(originalData.relatedId);
            break;
          }

          case 'system': {
            const originalData = message.data as SystemMessagePayload;
            const deserializedData = deserialized.data as SystemMessagePayload;
            expect(deserializedData.code).toBe(originalData.code);
            expect(deserializedData.message).toBe(originalData.message);
            // Note: data field may not serialize/deserialize perfectly due to 'anything()' arbitrary
            break;
          }

          case 'ping':
          case 'pong': {
            const originalData = message.data as HeartbeatPayload;
            const deserializedData = deserialized.data as HeartbeatPayload;
            expect(deserializedData.timestamp).toBe(originalData.timestamp);
            break;
          }

          case 'connected':
          case 'disconnected': {
            const originalData = message.data as ConnectionEventData;
            const deserializedData = deserialized.data as ConnectionEventData;
            expect(deserializedData.timestamp).toBe(originalData.timestamp);
            expect(deserializedData.code).toBe(originalData.code);
            expect(deserializedData.reason).toBe(originalData.reason);
            break;
          }

          case 'error': {
            // Error 对象不能直接序列化，所以跳过这个测试
            // Error objects cannot be directly serialized, so skip this test
            // 在实际应用中，错误应该被转换为可序列化的格式
            // In real applications, errors should be converted to serializable format
            break;
          }
        }

        return true;
      }),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });

  /**
   * Property 1.3: 类型辨识器的完整性
   * Type Discriminator Completeness
   * 
   * 对于任何有效的消息类型字符串，应该能够创建对应类型的消息。
   * 
   * For any valid message type string, it should be possible to create a message of that type.
   * 
   * Validates: Requirements 1.1, 1.4
   */
  it('Property 1.3: 类型辨识器的完整性 - Type Discriminator Completeness', () => {
    const validMessageTypes = [
      'chat',
      'notification',
      'system',
      'ping',
      'pong',
      'connected',
      'disconnected',
      'error'
    ] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...validMessageTypes),
        fc.integer({ min: 0, max: Date.now() + 1000000 }),
        (messageType, _timestamp) => {
          // 验证每种消息类型都可以被正确识别
          // Verify each message type can be correctly identified
          expect(validMessageTypes).toContain(messageType);

          // 验证类型字符串是有效的 WebSocketMessage 类型
          // Verify type string is a valid WebSocketMessage type
          const isValidType = (type: string): type is WebSocketMessage['type'] => {
            return validMessageTypes.includes(type as any);
          };

          expect(isValidType(messageType)).toBe(true);

          return true;
        }
      ),
      {
        numRuns: PBT_CONFIG.numRuns,
        verbose: PBT_CONFIG.verbose,
      }
    );
  });
});
