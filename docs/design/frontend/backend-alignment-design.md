# Backend Alignment Design

## Goal

Realign the Vue frontend around the backend inventory without rewriting the entire application. The target is a contract-first architecture where backend paths, DTOs, and pagination shapes are normalized once, then consumed consistently by query hooks and route-level screens.

## Non-Goals

- no visual redesign in this stage unless required by a contract change
- no broad folder reorganization that is not needed for backend alignment
- no speculative frontend support for backend APIs that were not confirmed in the inventory

## Design Principles

1. Gateway-facing backend paths are the only source of truth.
2. Raw backend DTOs and frontend view models must be separated.
3. TanStack Query owns server data; Pinia stores keep UI-only state.
4. Route pages should be composition surfaces, not contract adapters.
5. Unsupported backend capabilities should be hidden, not guessed.

## Current Problems To Solve

- API clients contain speculative endpoints that are not in the backend inventory.
- Shared frontend types flatten different backend DTO families into one idealized shape.
- Store-based server state and query-based server state coexist in the same domains.
- Some pages depend on contracts that do not compile today.
- Auth bootstrap is ambiguous because the inventory confirms token issuance but not `/auth/me`.

## Target Architecture

## 1. Transport Layer

Keep `src/utils/request.ts` as the common HTTP transport, but treat it strictly as transport:

- base URL and auth header handling
- `ApiResponse<T>` unwrapping
- generic error translation
- token refresh flow

Transport must not encode domain-specific DTO assumptions.

## 2. Contract-Aligned Domain Clients

Each domain client under `src/api` should expose only backend-confirmed operations.

Target behavior:

- `auth.ts`
  - only confirmed login/register/refresh in the first pass
- `user.ts`
  - read profile, update profile, follow/follow-check, followers/following, check-in, stranger-message settings
- `post.ts`
  - list/detail/create/update/publish/unpublish/schedule/restore/draft/tag/like/favorite based on actual backend paths
- `comment.ts`
  - page/cursor list, replies, create/update/delete, like, media upload
- `message.ts`
  - conversations and messages using backend-named routes
- `notification.ts`
  - list/unread-count/mark-read/mark-all-read only until more endpoints are verified
- `search.ts`
  - post search, suggest, hot, history
- `ranking.ts`
  - hot posts, daily/weekly/monthly posts, hot creators, hot topics
- `upload.ts`
  - image/audio/batch/url/delete with shared request semantics where feasible
- `admin.ts`
  - users/posts/comments/reports aligned to gateway-visible `/admin` endpoints

Boundary rule:

- When a frontend surface still depends on endpoints not confirmed in the backend inventory, keep them in `src/api/*-legacy.ts` modules and do not import them from contract-aligned pages/hooks. This makes the public-content slice boundary explicit and prevents speculative APIs from leaking back into `src/api/*`.

## 3. DTO Adapter Layer

Introduce explicit normalization between backend DTOs and UI-facing view models.

Required adapter families:

- response envelopes
  - `ApiResponse<T>`
  - `PageResult<T>`
  - `HybridPageResult<T>`
  - `CursorPage<T>`
  - `SearchResultVO<T>`
- domain DTOs
  - `UserVO`, `UserSimpleDTO`, `FollowStatsVO`, `CheckInVO`
  - `PostVO`, `PostBriefVO`, `PostContentVO`, `DraftVO`, `TagDTO`
  - `CommentVO`
  - `ConversationVO`, `MessageVO`
  - `AggregatedNotificationVO`
  - `HotPostDTO`, `HotScore`
  - admin DTO families once exact field shapes are confirmed

Design rule:

- API clients may return backend DTOs internally
- query hooks should expose normalized data the page can render directly
- pages should not manually interpret `PageResult` or `HybridPageResult`

## 4. Query Layer As The Server-State Boundary

TanStack Query should be the only place that pages get server data from.

Target responsibilities:

- query keys reflect real backend filters
- mutation hooks invalidate the minimal necessary data
- optimistic updates only when DTO shape is stable
- query hooks return page-ready data, not raw transport envelopes

Store guidance:

- `auth` store keeps session state
- `message` store keeps only current selected conversation ID
- `notification` store keeps only panel open/closed state and view timestamps
- server collections and unread counts move fully to query hooks

## 5. Feature/Page Layer

Route-level pages stay thin and delegate to:

- domain query hooks for reads
- mutation hooks for writes
- focused feature components for forms/lists/cards

This is already the right direction in admin user management and should become the default pattern.

## Domain Design Decisions

## Auth / Session

Design decision:

- split token session from current-user hydration

Reason:

- backend inventory guarantees token issuance, not current-user payload availability

Design approach:

- `login` and `refresh` update session tokens only
- current-user hydration becomes an explicit step behind a verified contract
- until a confirmed `/me` or claim-based bootstrap exists, auth-required features should fail closed instead of inventing user fields

## Public Content

Design decision:

- make public content the reference slice for contract alignment

Scope:

- home feed
- post detail
- comment list
- hot tags
- tag detail where confirmed

Reason:

- most visible value
- least blocked by auth ambiguity
- forces adapter support for multiple backend pagination/result shapes

## User Profile / Social

Design decision:

- use backend actor/target semantics explicitly

Implications:

- frontend should not continue using shorthand `/follow` endpoints
- follow state, follower/following lists, and check-in become separate query/mutation concerns
- stranger-message setting belongs in settings once the session bootstrap is verified

## Authoring / Drafts

Design decision:

- align editor flows to backend post/draft primitives instead of frontend-only draft resource assumptions

Implications:

- auto-save should target backend draft endpoints
- publish/unpublish/schedule state belongs to explicit mutations
- upload must use the upload service instead of post-scoped image endpoints that are not confirmed

## Notifications / Messaging

Design decision:

- do not finalize realtime architecture until the browser transport contract is verified

Implications:

- REST alignment first
- realtime integration second
- notification center and message center must stop depending on deprecated store APIs before websocket work resumes

## Ranking / Search

Design decision:

- constrain UI controls to confirmed backend capabilities

Implications:

- creators/topics should not show unsupported daily/weekly/monthly tabs
- search should default to post results until user/tag search contracts are confirmed
- user-visible filters should be backed by real backend parameters only

## Admin / Moderation

Design decision:

- keep the admin shell minimal and truthful

Implications:

- retain aligned user management slice
- align posts/comments delete flows with backend reason bodies
- add reports page before expanding dashboard metrics
- keep dashboard informational if stats endpoints are still unconfirmed

## Page and Module Priorities

## Priority 0: Contract Foundation

- response envelope adapters
- backend DTO typing
- session bootstrap decision
- query/store responsibility cleanup

## Priority 1: Public Content Read Flows

- home feed
- post detail
- comments
- hot tags
- safe ranking entry points

## Priority 2: Session and User Basics

- login/register/refresh alignment
- protected-route behavior
- profile read/update
- follow/followers/following
- check-in

## Priority 3: Authoring

- create/edit
- draft save/load/publish
- cover/editor upload
- tag assignment

## Priority 4: Search and Ranking Expansion

- history and suggestions
- contract-limited ranking tabs
- ranking details only if required

## Priority 5: Notifications and Messaging

- REST contract fix
- page/query migration completion
- realtime integration after transport confirmation

## Priority 6: Admin Moderation Completion

- reports UI
- delete reason capture
- optional dashboard metrics after backend confirmation

## Risk Handling

## 1. Actor-ID-In-Path Routes

Risk:

- some backend user routes take actor ID in the path

Handling:

- frontend should always pass the authenticated user ID explicitly
- do not assume the backend ignores mismatched actor IDs
- add integration tests for follow/block/check-in mutations once session bootstrap is settled

## 2. Current-User Bootstrap

Risk:

- login returns tokens, not an explicit user payload in the inventory

Handling:

- block auth-dependent rollout behind one explicit decision:
  - confirmed `/me` endpoint
  - confirmed JWT claim decoding strategy
  - or a backend follow-up contract

## 3. Realtime Notification Transport

Risk:

- inventory shows STOMP/SockJS style notification transport, while frontend currently uses a generic websocket manager

Handling:

- keep websocket work isolated behind a notification transport adapter
- do not wire production pages directly to the current generic websocket manager until backend transport is confirmed

## 4. Admin DTO Incompleteness

Risk:

- exact list-row shapes for reports/posts/comments may still change

Handling:

- use narrow view models
- keep admin list columns minimal until DTOs are confirmed

## 5. Upload Ownership

Risk:

- upload may be gateway-routed or direct-service depending on deployment

Handling:

- isolate base URL and auth behavior inside upload client
- avoid hardcoding service-specific assumptions in pages

## Acceptance Criteria For This Design

The design is considered implemented when:

1. no page calls speculative endpoints outside the backend inventory
2. query hooks, not stores, own notification and message server data
3. shared page models come from adapters instead of hand-written idealized types
4. unsupported ranking/search/admin controls are removed or hidden
5. the first public-content slice works end to end against confirmed backend APIs
