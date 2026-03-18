# Backend Alignment Implementation Plan

## Objective

Execute frontend-backend alignment in small vertical slices, starting with the lowest-risk, highest-visibility flows and avoiding source churn that depends on unresolved backend ambiguities.

## Planning Assumptions

- backend inventory document is the current source of truth
- application source code is not changed in this pass; this plan defines the next stage
- current build health is unstable, so each phase must include a typecheck gate

## Phase 0: Contract Baseline

### Goal

Establish one frontend contract baseline before feature changes begin.

### Work

- create a backend-confirmed endpoint matrix per domain in code comments or local engineering notes
- identify speculative endpoints currently used by `src/api/*`
- define normalized response helpers for:
  - `PageResult<T>`
  - `HybridPageResult<T>`
  - `CursorPage<T>`
  - `SearchResultVO<T>`
- decide current-user bootstrap strategy:
  - confirmed `/me`
  - confirmed JWT claim decoding
  - or temporary deferment of auth-dependent flows

### Deliverables

- contract checklist for each `src/api/*.ts`
- explicit decision record for current-user bootstrap
- list of routes/features that must remain disabled until ambiguity is resolved

### Exit Criteria

- team agrees which backend operations are in scope
- no implementation phase starts with an unresolved auth bootstrap assumption

## Phase 1: First Vertical Slice

### Slice

Public content read path.

### Why This Slice First

- it delivers user-visible value quickly
- it avoids the unresolved auth bootstrap dependency
- it forces the adapter/query pattern needed by every later phase

### Scope

- home feed
- post detail
- comment list
- hot tags sidebar/list entry points
- only backend-confirmed ranking reads used by these screens

### Target Modules

- `src/api/post.ts`
- `src/api/comment.ts`
- `src/api/tag.ts`
- `src/api/ranking.ts`
- `src/queries/posts/*`
- `src/queries/comments/*`
- `src/queries/tags/*`
- `src/pages/Home.vue`
- `src/pages/post/PostDetail.vue`
- comment list components

### Work

- realign list/detail/read endpoints to backend inventory
- normalize `HybridPageResult<PostBriefVO>` and `PageResult<CommentVO>`
- remove unsupported public-content assumptions such as:
  - `/posts/hot`
  - `/posts/recommended`
  - `/posts/{id}/related`
  - nested `/posts/{id}/comments`
- ensure UI renders only fields backed by confirmed DTOs

### Exit Criteria

- home page loads backend-aligned post list and hot posts
- post detail loads by `postId`
- comments load by post ID through the confirmed backend path
- touched files pass `vue-tsc`

## Phase 2: Session and Auth Alignment

### Goal

Make protected routes truthful and remove speculative auth flows.

### Scope

- login
- register
- refresh
- route guard behavior
- session persistence

### Work

- update auth request/response modeling to match backend inventory
- remove or isolate unsupported flows:
  - `/auth/logout` if not confirmed
  - `/auth/me` if not confirmed
  - forgot/reset/verify/change-password until backend coverage exists
- wire `authStore` to the chosen current-user bootstrap strategy
- ensure login form uses backend-confirmed fields

### Exit Criteria

- login and refresh flows work with confirmed backend contracts
- protected routes do not assume user data that the backend cannot provide
- unsupported auth UI paths are hidden or marked pending

## Phase 3: User Profile and Social Basics

### Goal

Align the user-facing social and profile flows on top of the corrected session model.

### Scope

- public profile read
- profile update
- followers/following
- follow status
- check-in
- stranger-message setting

### Work

- replace shorthand follow endpoints with actor/target route usage
- align `UserVO` and follow stats handling
- split read-only profile fields from editable settings fields
- keep password/email management out unless backend coverage is confirmed

### Exit Criteria

- profile page loads via confirmed user routes
- follow/unfollow and follow-state checks work
- check-in works against backend stats/monthly endpoints
- settings page only shows supported capabilities

## Phase 4: Authoring and Draft Lifecycle

### Goal

Make create/edit/draft/publish flows match backend post and upload capabilities.

### Scope

- post create
- post edit
- draft save/load/delete/publish
- cover image upload
- editor image upload
- tag assignment

### Work

- align draft semantics to backend draft endpoints
- decide whether frontend creates a post first, then saves drafts by `postId`, or uses drafts list as the entry path
- move upload flows to `upload` service APIs
- remove unsupported category assumptions unless backend category APIs are later confirmed
- add schedule/unpublish/restore only after core authoring works

### Exit Criteria

- create/edit/draft flows compile and work against confirmed backend paths
- image upload uses the upload service, not speculative post-image endpoints
- draft list and publish actions are consistent with backend state transitions

## Phase 5: Search and Ranking Alignment

### Goal

Constrain discovery features to confirmed backend capabilities.

### Scope

- post search
- suggestions
- hot keywords
- history list/clear
- ranking tabs and cards

### Work

- adapt search page to `SearchResultVO<PostSearchVO>`
- remove unsupported user/tag/global search modes unless backend support is later verified
- limit ranking page to:
  - hot posts
  - daily/weekly/monthly posts
  - hot creators
  - hot topics
- hide unsupported creator/topic time tabs

### Exit Criteria

- search results page only exposes supported modes
- ranking UI only exposes supported backend periods/categories

## Phase 6: Notifications and Messaging

### Goal

Finish the migration from store-owned server state to query-owned server state and then reconnect realtime behavior.

### Scope

- notification center
- notification dropdown
- message center
- conversations/messages query hooks
- websocket/realtime adapter

### Work

- rewrite notification pages to use query hooks and notification mutations, not deprecated store methods
- align message REST paths to backend inventory
- correct message/conversation DTO typing
- verify websocket transport:
  - direct websocket
  - STOMP/SockJS
  - auth handshake behavior
- reintroduce realtime only after REST paths and DTOs are stable

### Exit Criteria

- message and notification pages compile
- no page calls removed notification/message store methods
- unread counts and mark-read flows work over REST
- realtime hookup is either verified or explicitly deferred behind a feature flag

## Phase 7: Admin Moderation Completion

### Goal

Expand the already-started admin slice into a truthful moderation surface.

### Scope

- admin posts
- admin comments
- admin reports
- admin dashboard cleanup

### Work

- add delete reason capture for content deletion flows
- add reports route/page using existing admin report hooks after enum alignment
- keep dashboard minimal until metrics endpoints are confirmed
- optionally expose ranking rebuild only if there is a real operator need

### Exit Criteria

- reports are visible and operable
- delete flows send backend-required payloads
- dashboard does not call unverified admin stats endpoints

## Cross-Phase Engineering Rules

1. Do not add new speculative endpoints.
2. Do not make pages parse raw backend envelopes directly.
3. Do not keep duplicated server state in Pinia and TanStack Query.
4. Do not expose unsupported UI controls "for later."
5. Run `vue-tsc` after each slice and fix touched-area failures before proceeding.

## Suggested Sequencing

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 5
7. Phase 6
8. Phase 7

## Recommended First Vertical Slice

Build the public content read path first:

- `GET /api/v1/posts`
- `GET /api/v1/posts/{postId}`
- `GET /api/v1/comments/post/{postId}/page`
- `GET /api/v1/ranking/posts/hot/details`
- `GET /api/v1/tags/hot`

This is the smallest slice that:

- is visible to all users
- avoids the current-user bootstrap ambiguity
- exercises the response adapter layer
- provides a reusable pattern for later authenticated and admin slices

## Known Blockers / Ambiguities

1. current-user bootstrap after login is unresolved
2. notification realtime transport is unresolved
3. exact admin report/post/comment row schemas need confirmation
4. upload service ownership and auth path need deployment confirmation
5. category support should remain out of scope until backend category APIs are confirmed
