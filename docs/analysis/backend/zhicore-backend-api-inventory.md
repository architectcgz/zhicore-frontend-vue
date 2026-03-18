# ZhiCore Backend API Inventory

## Summary

- This inventory is based on controller code, gateway routing, auth propagation code, shared response models, and a small set of request/response DTOs in the backend repos.
- Standard HTTP envelope is `ApiResponse<T>` with fields: `code`, `message`, `data`, `timestamp`, optional `traceId`.
- The frontend-relevant gateway prefixes are mostly under `/api/v1/...`.
- Important routing nuance: `/api/v1/admin/**` is routed by `zhicore-gateway` to `zhicore-admin` and `StripPrefix=2`, so the admin service actually implements `/admin/**` internally.
- Important ambiguity: several domain services also expose `/api/v1/admin/...` controllers, but those do not appear to be gateway-primary under the current route config.

## Service/Module Inventory

- `zhicore-gateway`
  - Public ingress for `/api/v1/users`, `/auth`, `/posts`, `/comments`, `/messages`, `/conversations`, `/notifications`, `/search`, `/ranking`, `/upload`, `/admin`.
  - JWT filter injects `X-User-Id`, `X-User-Name`, `X-User-Roles` after validating `Authorization: Bearer <token>`.
  - Whitelist includes login/register/refresh, public post reads, public profile read pattern, search, ranking, tags, categories.
- `zhicore-common`
  - Shared `ApiResponse`, `PageResult`, `HybridPageResult`, `UserContext`.
  - `UserContext.requireUserId()` is the common signal that login is required.
- `zhicore-user`
  - Auth/session, profile, follow, block, check-in, some admin-style user endpoints.
- `zhicore-content`
  - Post CRUD/publish/draft/tag/favorite/like, tag queries, some admin-style post/outbox endpoints.
- `zhicore-comment`
  - Comment CRUD/query, like state, comment media upload, some admin-style moderation/outbox endpoints.
- `zhicore-message`
  - Conversations and direct messages.
- `zhicore-notification`
  - Notification list/read state; also STOMP/SockJS push endpoint.
- `zhicore-search`
  - Post search, suggestions, hot keywords, user history.
- `zhicore-ranking`
  - Post/creator/topic rankings plus one admin rebuild endpoint.
- `zhicore-upload`
  - Upload proxy layer over external file-service.
- `zhicore-admin`
  - Current gateway-targeted admin/moderation API for users, posts, comments, reports.

## Endpoint Catalog By Domain

### Auth / Session

- `POST /api/v1/auth/register`
  - Owner: `zhicore-user`
  - Auth: public
  - Body: `RegisterRequest { userName, email, password }`
  - Response: `ApiResponse<Long>` user id
- `POST /api/v1/auth/login`
  - Owner: `zhicore-user`
  - Auth: public
  - Body: `LoginRequest { email, password }`
  - Response: `ApiResponse<TokenVO>`
  - `TokenVO`: `accessToken`, `refreshToken`, `tokenType`, `expiresIn`
- `POST /api/v1/auth/refresh`
  - Owner: `zhicore-user`
  - Auth: public
  - Body: `RefreshTokenRequest { refreshToken }`
  - Response: `ApiResponse<TokenVO>`

### User / Profile / Social

- `GET /api/v1/users/{userId}`
  - Owner: `zhicore-user`
  - Auth: likely public via gateway whitelist intent
  - Response: `ApiResponse<UserVO>`
  - `UserVO`: id, userName, nickName, email, avatarUrl, bio, status, emailConfirmed, roles, followersCount, followingCount, createdAt
- `GET /api/v1/users/{userId}/simple`
  - Response: `ApiResponse<UserSimpleDTO>`
- `POST /api/v1/users/batch/simple`
  - Body: `Set<Long>` user ids
  - Response: `ApiResponse<Map<Long, UserSimpleDTO>>`
- `GET /api/v1/users/{userId}/settings/stranger-message`
  - Response: `ApiResponse<Boolean>`
- `PUT /api/v1/users/{userId}/profile`
  - Auth: required
  - Body: `UpdateProfileRequest { nickName?, avatarId?, bio? }`
  - Response: `ApiResponse<Void>`
- `PUT /api/v1/users/{userId}/settings/stranger-message`
  - Auth: required
  - Body: `UpdateStrangerMessageSettingRequest { allowStrangerMessage }`
  - Response: `ApiResponse<Void>`

- `GET /api/v1/users/{userId}/followers?page=1&size=20`
  - Response: `ApiResponse<List<UserVO>>`
- `GET /api/v1/users/{userId}/following?page=1&size=20`
  - Response: `ApiResponse<List<UserVO>>`
- `GET /api/v1/users/{userId}/follow-stats?currentUserId=...`
  - Response: `ApiResponse<FollowStatsVO>`
  - `FollowStatsVO`: userId, followersCount, followingCount, isFollowing, isFollowed
- `GET /api/v1/users/{userId}/following/{targetUserId}/check`
  - Response: `ApiResponse<Boolean>`
- `POST /api/v1/users/{userId}/following/{targetUserId}`
  - Auth: expected
  - Response: `ApiResponse<Void>`
- `DELETE /api/v1/users/{userId}/following/{targetUserId}`
  - Auth: expected
  - Response: `ApiResponse<Void>`

- `GET /api/v1/users/{blockerId}/blocking?page=1&size=20`
  - Response: `ApiResponse<List<UserVO>>`
- `GET /api/v1/users/{blockerId}/blocking/{blockedId}/check`
  - Response: `ApiResponse<Boolean>`
- `POST /api/v1/users/{blockerId}/blocking/{blockedId}`
  - Auth: expected
  - Response: `ApiResponse<Void>`
- `DELETE /api/v1/users/{blockerId}/blocking/{blockedId}`
  - Auth: expected
  - Response: `ApiResponse<Void>`

- `GET /api/v1/users/{userId}/check-in/stats`
  - Response: `ApiResponse<CheckInVO>`
  - `CheckInVO`: checkInDate, totalDays, continuousDays, maxContinuousDays, checkedInToday
- `GET /api/v1/users/{userId}/check-in/monthly?year=YYYY&month=M`
  - Response: `ApiResponse<Long>` bitmap-like monthly value
- `POST /api/v1/users/{userId}/check-in`
  - Auth: expected
  - Response: `ApiResponse<CheckInVO>`

### Posts / Drafts / Likes / Favorites / Tags

- `POST /api/v1/posts`
  - Owner: `zhicore-content`
  - Auth: required, acting user from `UserContext`
  - Body: `CreatePostRequest { title, content?, contentType=markdown|html|rich, topicId?, coverImageId?, tags?[]<=10 }`
  - Response: `ApiResponse<Long>` post id
- `PUT /api/v1/posts/{postId}`
  - Auth: required
  - Body: `UpdatePostRequest { title?, content?, topicId?, coverImageId?, tags?[]<=10 }`
  - Response: `ApiResponse<Void>`
- `POST /api/v1/posts/{postId}/publish`
- `POST /api/v1/posts/{postId}/unpublish`
- `POST /api/v1/posts/{postId}/schedule`
  - Body: `SchedulePublishRequest { scheduledAt }`
- `DELETE /api/v1/posts/{postId}/schedule`
- `DELETE /api/v1/posts/{postId}`
- `POST /api/v1/posts/{postId}/restore`
- `POST /api/v1/posts/{postId}/draft`
  - Body: `SaveDraftRequest { content, contentType, isAutoSave?, deviceId? }`
- `DELETE /api/v1/posts/{postId}/draft`
- `POST /api/v1/posts/{postId}/tags`
  - Body: `AttachTagsRequest { tags[] }`
- `DELETE /api/v1/posts/{postId}/tags/{slug}`
  - All above respond `ApiResponse<Void>` unless noted

- `GET /api/v1/posts/{postId}`
  - Auth: public
  - Response: `ApiResponse<PostVO>`
  - `PostVO`: id, ownerId/ownerName/ownerAvatar, title, raw, html, excerpt, coverImageUrl, status, topicId/topicName, publishedAt/scheduledAt/createdAt/updatedAt, likeCount/commentCount/favoriteCount/viewCount, liked, favorited
- `GET /api/v1/posts/my/{postId}`
  - Auth: required
  - Response: `ApiResponse<PostVO>`
- `GET /api/v1/posts/my?status=DRAFT&page=1&size=20`
  - Auth: required
  - Response: `ApiResponse<List<PostBriefVO>>`
- `GET /api/v1/posts?page=&cursor=&size=&sort=&status=`
  - Auth: public
  - Response: `ApiResponse<HybridPageResult<PostBriefVO>>`
- `GET /api/v1/posts/cursor?cursor=&size=`
  - Response: `ApiResponse<List<PostBriefVO>>`
- `GET /api/v1/posts/hybrid?page=&cursor=&size=`
  - Response: `ApiResponse<HybridPageResult<PostBriefVO>>`
- `POST /api/v1/posts/batch`
  - Body: `Set<Long>` post ids
  - Response: `ApiResponse<Map<Long, PostDTO>>`
- `GET /api/v1/posts/{postId}/content`
  - Response: `ApiResponse<PostContentVO>`
  - `PostContentVO`: raw/html/text, contentType, wordCount, readingTime, blocks[], media[], timestamps
- `GET /api/v1/posts/{postId}/draft`
  - Auth: required
  - Response: `ApiResponse<DraftVO>`
- `GET /api/v1/posts/drafts`
  - Auth: required
  - Response: `ApiResponse<List<DraftVO>>`
- `GET /api/v1/posts/{postId}/tags`
  - Response: `ApiResponse<List<TagDTO>>`

- `POST /api/v1/posts/{postId}/like`
- `DELETE /api/v1/posts/{postId}/like`
  - Auth: required
  - Response: `ApiResponse<Void>`
- `GET /api/v1/posts/{postId}/like/status`
  - Auth: required
  - Response: `ApiResponse<Boolean>`
- `POST /api/v1/posts/like/batch-status`
  - Auth: required
  - Body: `List<Long>`
  - Response: `ApiResponse<Map<Long, Boolean>>`
- `GET /api/v1/posts/{postId}/like/count`
  - Response: `ApiResponse<Integer>`

- `POST /api/v1/posts/{postId}/favorite`
- `DELETE /api/v1/posts/{postId}/favorite`
  - Auth: required
  - Response: `ApiResponse<Void>`
- `GET /api/v1/posts/{postId}/favorite/status`
  - Auth: required
  - Response: `ApiResponse<Boolean>`
- `POST /api/v1/posts/favorite/batch-status`
  - Auth: required
  - Body: `List<Long>`
  - Response: `ApiResponse<Map<Long, Boolean>>`
- `GET /api/v1/posts/{postId}/favorite/count`
  - Response: `ApiResponse<Integer>`

- `GET /api/v1/tags/{slug}`
  - Response: `ApiResponse<TagDTO>`
- `GET /api/v1/tags?page=0&size=20`
  - Response: `ApiResponse<PageResult<TagDTO>>`
- `GET /api/v1/tags/search?keyword=&limit=`
  - Response: `ApiResponse<List<TagDTO>>`
- `GET /api/v1/tags/{slug}/posts?page=0&size=20`
  - Response: `ApiResponse<PageResult<PostVO>>`
- `GET /api/v1/tags/hot?limit=`
  - Response: `ApiResponse<List<TagStatsDTO>>`

### Comments

- `POST /api/v1/comments`
  - Owner: `zhicore-comment`
  - Auth: required
  - Body: `CreateCommentRequest { postId, content, rootId?, replyToCommentId?, imageIds?[]<=9, voiceId?, voiceDuration? }`
  - Response: `ApiResponse<Long>` comment id
- `PUT /api/v1/comments/{commentId}`
  - Auth: required
  - Body: `UpdateCommentRequest { content }`
  - Response: `ApiResponse<Void>`
- `DELETE /api/v1/comments/{commentId}`
  - Auth: required
  - Response: `ApiResponse<Void>`

- `GET /api/v1/comments/{commentId}`
  - Response: `ApiResponse<CommentVO>`
  - `CommentVO`: id, postId, rootId, content, imageIds, voiceId, voiceDuration, author, replyToUser, likeCount, replyCount, createdAt, liked, hotReplies
- `GET /api/v1/comments/post/{postId}/page?page=0&size=20&sort=TIME|HOT`
  - Response: `ApiResponse<PageResult<CommentVO>>`
- `GET /api/v1/comments/post/{postId}/cursor?cursor=&size=20&sort=TIME|HOT`
  - Response: `ApiResponse<CursorPage<CommentVO>>`
- `GET /api/v1/comments/{commentId}/replies/page?page=0&size=20`
  - Response: `ApiResponse<PageResult<CommentVO>>`
- `GET /api/v1/comments/{commentId}/replies/cursor?cursor=&size=20`
  - Response: `ApiResponse<CursorPage<CommentVO>>`

- `POST /api/v1/comments/{commentId}/like`
- `DELETE /api/v1/comments/{commentId}/like`
  - Auth: required
  - Response: `ApiResponse<Void>`
- `GET /api/v1/comments/{commentId}/liked`
  - Auth: required
  - Response: `ApiResponse<Boolean>`
- `POST /api/v1/comments/batch/liked`
  - Auth: required
  - Body: `BatchCheckLikedRequest { commentIds[]<=100 }`
  - Response: `ApiResponse<Map<Long, Boolean>>`
- `GET /api/v1/comments/{commentId}/like-count`
  - Response: `ApiResponse<Integer>`

- `POST /api/v1/comments/media/images`
  - Auth: not explicit in controller
  - Form: `file`
  - Response: `ApiResponse<String>` file id
- `POST /api/v1/comments/media/voice`
  - Form: `file`
  - Response: `ApiResponse<String>` file id

### Messaging

- `GET /api/v1/conversations?cursor=&limit=20`
  - Owner: `zhicore-message`
  - Auth: required
  - Response: `ApiResponse<List<ConversationVO>>`
  - `ConversationVO`: id, otherUserId, otherUserNickName, otherUserAvatarUrl, lastMessageContent, lastMessageAt, unreadCount, createdAt
- `GET /api/v1/conversations/{conversationId}`
  - Auth: required
  - Response: `ApiResponse<ConversationVO>`
- `GET /api/v1/conversations/user/{userId}`
  - Auth: required
  - Response: `ApiResponse<ConversationVO>`
- `GET /api/v1/conversations/count`
  - Auth: required
  - Response: `ApiResponse<Integer>`

- `GET /api/v1/messages/conversation/{conversationId}?cursor=&limit=20`
  - Auth: required
  - Response: `ApiResponse<List<MessageVO>>`
  - `MessageVO`: id, conversationId, sender/receiver ids, sender display info, type, content, mediaUrl, isRead, readAt, status, createdAt, isSelf
- `GET /api/v1/messages/unread-count`
  - Auth: required
  - Response: `ApiResponse<Integer>`
- `POST /api/v1/messages`
  - Auth: required
  - Body: `SendMessageRequest { receiverId, type(TEXT|IMAGE|FILE), content?, mediaUrl? }`
  - Response: `ApiResponse<MessageVO>`
- `POST /api/v1/messages/{messageId}/recall`
  - Auth: required
  - Response: `ApiResponse<Void>`
- `POST /api/v1/messages/conversation/{conversationId}/read`
  - Auth: required
  - Response: `ApiResponse<Void>`

### Notifications

- `GET /api/v1/notifications?page=0&size=20`
  - Owner: `zhicore-notification`
  - Auth: required
  - Response: `ApiResponse<PageResult<AggregatedNotificationVO>>`
  - `AggregatedNotificationVO`: type, targetType, targetId, totalCount, unreadCount, latestTime, latestContent, recentActors, aggregatedContent
- `GET /api/v1/notifications/unread-count`
  - Auth: required
  - Response: `ApiResponse<Integer>`
- `POST /api/v1/notifications/{notificationId}/read`
  - Auth: required
  - Response: `ApiResponse<Void>`
- `POST /api/v1/notifications/read-all`
  - Auth: required
  - Response: `ApiResponse<Void>`

- WebSocket push surface
  - Service-local STOMP/SockJS endpoint: `/ws/notification`
  - User destinations: `/user/queue/notifications`, `/user/queue/unread-count`
  - Broadcast topic: `/topic/announcements`
  - Not present in current gateway HTTP route config

### Search

- `GET /api/v1/search/posts?keyword=&page=0&size=10`
  - Owner: `zhicore-search`
  - Auth: optional; controller records search history when user context exists
  - Response: `ApiResponse<SearchResultVO<PostSearchVO>>`
  - `SearchResultVO`: `items`, `total`, `page`, `size`, `totalPages`, `hasNext`, `hasPrevious`
  - `PostSearchVO`: id, title, highlightTitle, excerpt, highlightContent, authorId, authorName, tags, categoryName, likeCount, commentCount, viewCount, publishedAt, score
- `GET /api/v1/search/suggest?prefix=&limit=10`
  - Controller marks bearer auth in OpenAPI, but implementation uses optional `UserContext.getUserId()`
  - Response: `ApiResponse<List<String>>`
- `GET /api/v1/search/hot?limit=10`
  - Response: `ApiResponse<List<String>>`
- `GET /api/v1/search/history?limit=10`
  - Auth: required
  - Response: `ApiResponse<List<String>>`
- `DELETE /api/v1/search/history`
  - Auth: required
  - Response: `ApiResponse<Void>`

### Ranking

- Owner: `zhicore-ranking`
- Public ranking reads
  - `GET /api/v1/ranking/posts/hot?page=0&size=20` -> `ApiResponse<List<String>>` post ids
  - `GET /api/v1/ranking/posts/hot/details?page=0&size=20` -> `ApiResponse<List<HotPostDTO>>`
  - `GET /api/v1/ranking/posts/hot/scores?page=0&size=20` -> `ApiResponse<List<HotScore>>`
  - `GET /api/v1/ranking/posts/daily?date=&limit=` -> `ApiResponse<List<String>>`
  - `GET /api/v1/ranking/posts/daily/scores?date=&limit=` -> `ApiResponse<List<HotScore>>`
  - `GET /api/v1/ranking/posts/weekly?year=&week=&limit=` -> `ApiResponse<List<String>>`
  - `GET /api/v1/ranking/posts/weekly/scores?year=&week=&limit=` -> `ApiResponse<List<HotScore>>`
  - `GET /api/v1/ranking/posts/monthly?year=&month=&limit=` -> `ApiResponse<List<String>>`
  - `GET /api/v1/ranking/posts/monthly/scores?year=&month=&limit=` -> `ApiResponse<List<HotScore>>`
  - `GET /api/v1/ranking/posts/{postId}/rank` -> `ApiResponse<Long>`
  - `GET /api/v1/ranking/posts/{postId}/score` -> `ApiResponse<Double>`
  - `GET /api/v1/ranking/creators/hot?page=0&size=20` -> `ApiResponse<List<String>>` user ids
  - `GET /api/v1/ranking/creators/hot/scores?page=0&size=20` -> `ApiResponse<List<HotScore>>`
  - `GET /api/v1/ranking/creators/{userId}/rank` -> `ApiResponse<Long>`
  - `GET /api/v1/ranking/creators/{userId}/score` -> `ApiResponse<Double>`
  - `GET /api/v1/ranking/topics/hot?page=0&size=20` -> `ApiResponse<List<Long>>` topic ids
  - `GET /api/v1/ranking/topics/hot/scores?page=0&size=20` -> `ApiResponse<List<HotScore>>`
  - `GET /api/v1/ranking/topics/{topicId}/rank` -> `ApiResponse<Long>`
  - `GET /api/v1/ranking/topics/{topicId}/score` -> `ApiResponse<Double>`
- Admin ranking op
  - `POST /api/v1/ranking/admin/rebuild-from-ledger`
  - Auth: required and `UserContext.isAdmin()`
  - Response: `ApiResponse<RankingReplayResultDTO>`
- Key response shapes
  - `HotPostDTO`: id, title, excerpt, coverImageUrl, owner id/name/avatar, topicId/topicName, publishedAt, like/comment/favorite/view counts, hotScore, rank
  - `HotScore`: entityId, score, rank, updatedAt

### Upload

- Owner: `zhicore-upload`
- `POST /api/v1/upload/image`
  - Form: `file`
  - Response: `ApiResponse<FileUploadResponse>`
- `POST /api/v1/upload/audio`
  - Form: `file`
  - Response: `ApiResponse<FileUploadResponse>`
- `POST /api/v1/upload/image/with-access`
  - Form: `file`, `accessLevel=PUBLIC|PRIVATE`
  - Response: `ApiResponse<FileUploadResponse>`
- `POST /api/v1/upload/images/batch`
  - Form: `files[]`, optional `accessLevel`
  - Response: `ApiResponse<List<FileUploadResponse>>`
- `GET /api/v1/upload/file/{fileId}/url`
  - Response: `ApiResponse<String>`
- `DELETE /api/v1/upload/file/{fileId}`
  - Response: `ApiResponse<Void>`
- `FileUploadResponse`
  - `fileId`, `url`, `fileSize`, `fileHash`, `instantUpload`, `uploadTime`, `accessLevel`, `originalName`, `contentType`

### Admin / Moderation

Primary gateway-visible admin API is `zhicore-admin`:

- `GET /api/v1/admin/users?keyword=&status=&page=1&size=20`
  - Gateway -> `zhicore-admin` `/admin/users`
  - Auth: admin role required
  - Response: `ApiResponse<PageResult<UserManageVO>>`
- `POST /api/v1/admin/users/{userId}/disable`
  - Body: `DisableUserRequest { reason }`
  - Response: `ApiResponse<Void>`
- `POST /api/v1/admin/users/{userId}/enable`
  - Response: `ApiResponse<Void>`

- `GET /api/v1/admin/posts?keyword=&status=&authorId=&page=1&size=20`
  - Response: `ApiResponse<PageResult<PostManageVO>>`
- `DELETE /api/v1/admin/posts/{postId}`
  - Body: `DeleteContentRequest { reason }`
  - Response: `ApiResponse<Void>`

- `GET /api/v1/admin/comments?keyword=&postId=&userId=&page=1&size=20`
  - Response: `ApiResponse<PageResult<CommentManageVO>>`
- `DELETE /api/v1/admin/comments/{commentId}`
  - Body: `DeleteContentRequest { reason }`
  - Response: `ApiResponse<Void>`

- `GET /api/v1/admin/reports/pending?page=1&size=20`
  - Response: `ApiResponse<PageResult<ReportVO>>`
- `GET /api/v1/admin/reports?status=PENDING&page=1&size=20`
  - Response: `ApiResponse<PageResult<ReportVO>>`
- `POST /api/v1/admin/reports/{reportId}/handle`
  - Body: `HandleReportRequest { action, remark? }`
  - `action` allows `DELETE_CONTENT|WARN_USER|BAN_USER|IGNORE`
  - Response: `ApiResponse<Void>`

Direct-service admin-style endpoints also exist in domain services, but are likely not primary for frontend ingress under the current gateway:

- `zhicore-user`: `/api/v1/admin/users`, `/api/v1/admin/users/{userId}/disable|enable|invalidate-tokens`
- `zhicore-content`: `/api/v1/admin/posts`, `/api/v1/admin/posts/{postId}`, `/api/v1/admin/outbox/...`
- `zhicore-comment`: `/api/v1/admin/comments`, `/api/v1/admin/comments/{commentId}`, `/api/v1/admin/comment-outbox/...`

## Auth / Permission Notes

- Gateway JWT filter requires `Authorization: Bearer <token>` for non-whitelisted routes and forwards:
  - `X-User-Id`
  - `X-User-Name`
  - `X-User-Roles`
- Common controller auth patterns:
  - Public reads often omit `UserContext.requireUserId()`.
  - Logged-in operations call `UserContext.requireUserId()`.
  - Admin service uses `@RequireAdmin` plus `X-User-Roles` containing `ADMIN`.
- Important mismatch:
  - Several `zhicore-user` follow/block/check-in/profile routes take actor ids from path params (`/{userId}/...`) instead of always deriving actor from `UserContext`.
  - The controller layer alone does not prove path user id must equal JWT user id. Frontend should assume backend enforces this deeper in service layer, but this is not guaranteed from controller inspection alone.

## Known Ambiguities / Missing Contract Details

- Gateway/admin overlap:
  - Current gateway sends all `/api/v1/admin/**` traffic to `zhicore-admin` with `StripPrefix=2`.
  - Domain-service admin controllers under `/api/v1/admin/...` look real, but are probably direct-service/internal/legacy unless another ingress path exists.
- Gateway prefix drift:
  - Gateway routes `/api/v1/follows/**`, but inspected user controllers use `/api/v1/users/{id}/followers|following`; no `/api/v1/follows/**` controller was found in inspected modules.
  - Gateway routes `/api/v1/categories/**`, but no category controller was inspected in the prioritized modules.
  - Gateway routes `/api/v1/files/**`, but `zhicore-upload` controller only exposes `/api/v1/upload/**`.
- Upload service naming:
  - Gateway points upload traffic to service id `file-service`, while inspected upload repo is `zhicore-upload`.
  - `zhicore-upload` docs describe itself as a proxy layer over file-service. Final runtime ownership of `/api/v1/upload/**` should be verified in deployment config.
- Notification realtime delivery:
  - WebSocket endpoint `/ws/notification` is service-local and not shown in gateway route config.
  - Frontend WebSocket base URL and auth handshake expectations are not explicit here.
- Search suggest auth:
  - OpenAPI marks `/api/v1/search/suggest` with bearer security, but implementation accepts missing user context and still returns suggestions.
- Response DTO incompleteness:
  - Admin VO shapes (`UserManageVO`, `PostManageVO`, `CommentManageVO`, `ReportVO`) were not expanded here; list/detail fields need follow-up if the frontend depends on exact columns.
- Error contract:
  - Generic `ApiResponse` fail format is known, but endpoint-specific validation/business error code catalogs were not enumerated in this pass.

## Frontend Mapping Hints

- Use gateway-facing paths as source of truth for the first frontend coverage pass:
  - `/api/v1/auth`
  - `/api/v1/users`
  - `/api/v1/posts`
  - `/api/v1/comments`
  - `/api/v1/messages`
  - `/api/v1/conversations`
  - `/api/v1/notifications`
  - `/api/v1/search`
  - `/api/v1/ranking`
  - `/api/v1/upload`
  - `/api/v1/admin`
- Treat duplicate admin endpoints inside `zhicore-user` / `zhicore-content` / `zhicore-comment` as secondary until runtime ingress proves otherwise.
- For coverage diffing, model envelopes separately from payloads:
  - common envelope: `ApiResponse<T>`
  - pagination variants: `PageResult<T>`, `HybridPageResult<T>`, `CursorPage<T>`, `SearchResultVO<T>`
- Flag these for follow-up integration checks:
  - actor-id-in-path routes in user module
  - upload/file-service route ownership
  - WebSocket notification connection path and auth
  - exact admin list row schemas
