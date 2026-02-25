/**
 * 类型定义索引
 *
 * 所有应用程序类型定义的中央导出点。
 * 按类别组织，便于发现和维护。
 *
 * @module types
 */

// ============================================================================
// WebSocket 类型
// ============================================================================
export type {
  ChatMessagePayload,
  NotificationPayload,
  SystemMessagePayload,
  HeartbeatPayload,
  ConnectionEventData,
  ErrorEventData,
  WebSocketMessage,
  MessageHandler,
  GenericMessageHandler,
  IWebSocketManager,
} from './websocket';

// ============================================================================
// 错误类型
// ============================================================================
export type {
  BaseError,
  ApiError,
  NetworkError,
  ValidationError,
  AppError,
  ErrorHandler,
  ErrorType,
  ErrorInfo,
} from './errors';

export {
  isApiError,
  isNetworkError,
  isValidationError,
  getErrorMessage,
  createApiError,
  createNetworkError,
  createValidationError,
} from './errors';

// ============================================================================
// 网络错误处理类型
// ============================================================================
export {
  NetworkErrorType,
} from './network-errors';

export type {
  ClassifiedError,
  UserMessage,
  DeveloperLog,
  ErrorMessageConfig,
  ErrorStatistics,
  RetryConfig,
  CachedRequest,
  ErrorMessageTemplate,
  ErrorMessageDictionary,
} from './network-errors';

// ============================================================================
// 标签页同步类型
// ============================================================================
export type {
  TabSyncMessageType,
  AuthChangedPayload,
  LogoutPayload,
  MarkReadPayload,
  NewMessagePayload,
  NotificationReceivedPayload,
  TabSyncMessage,
  TabSyncHandler,
  GenericTabSyncHandler,
  ITabSyncManager,
} from './tabsync';

// ============================================================================
// 组件类型
// ============================================================================
export type {
  IconType,
  MenuItem,
  ComponentErrorInfo,
  ButtonVariant,
  ButtonSize,
  ModalSize,
  LoadingState,
  ToastPosition,
  ToastType,
  ValidationState,
  DropdownMenuItem,
  TabItem,
  BreadcrumbItem,
  PaginationConfig,
  SortConfig,
  FilterConfig,
  TableColumn,
} from './components';

// ============================================================================
// 事件类型
// ============================================================================
export type {
  UploadProgressEvent,
  UploadProgressHandler,
  WebSocketEventType,
  WebSocketEventDataMap,
  WebSocketEventHandler,
  GenericWebSocketEventHandler,
  FormSubmitHandler,
  InputChangeHandler,
  ClickHandler,
  KeyboardHandler,
  ScrollHandler,
  ResizeHandler,
  DragHandler,
  FileSelectionHandler,
  VisibilityChangeHandler,
  CustomEventData,
  CustomEventHandler,
  EventEmitter,
} from './events';

// ============================================================================
// 领域类型
// ============================================================================

// 通用 API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  bio: string;
  role: 'USER' | 'ADMIN';
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

// 文章状态类型
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// 文章相关类型
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  authorId: string;
  author: User;
  tags: Tag[];
  categoryId?: string;
  category?: Category;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  isLiked: boolean;
  isFavorited: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 评论相关类型
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  parent?: Comment;
  replies: Comment[];
  repliesCount: number;
  hasMore: boolean;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// 通知类型枚举
export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';

// 通知类型
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  relatedType?: 'POST' | 'COMMENT' | 'USER';
  isRead: boolean;
  createdAt: string;
}

// 消息类型
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  isRead: boolean;
  sequence: number;
  createdAt: string;
}

// 会话类型
export interface Conversation {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// 认证相关类型
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

// 通知查询参数接口
export interface NotificationQueryParams {
  page?: number;
  size?: number;
  type?: NotificationType;
  isRead?: boolean;
  sort?: 'latest' | 'oldest';
}

// 通知统计信息接口
export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    LIKE: number;
    COMMENT: number;
    FOLLOW: number;
    SYSTEM: number;
  };
}

// 搜索相关类型
export interface SearchRequest {
  query: string;
  type?: 'POST' | 'USER';
  page?: number;
  size?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'KEYWORD' | 'TAG' | 'USER';
  count?: number;
}

// 排行榜类型
export interface RankingItem {
  id: string;
  title: string;
  score: number;
  rank: number;
  change: number; // 排名变化
  author?: User;
  type: 'POST' | 'USER' | 'TAG';
}

// 文件上传类型
export interface UploadResponse {
  url: string;
  thumbUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  filename: string;
  size: number;
  mimeType: string;
}

// 注意：ApiError 现在从上面的 './errors' 模块导出
// 旧的定义已被移除以避免冲突

// HTTP 请求配置类型
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  skipErrorHandler?: boolean;
}
