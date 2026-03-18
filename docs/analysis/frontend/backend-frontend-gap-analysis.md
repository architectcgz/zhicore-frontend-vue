# Backend vs Frontend Gap Analysis

## Scope

- Backend source of truth: `docs/analysis/backend/zhicore-backend-api-inventory.md`
- Frontend inspected: routes, pages, components, stores, API clients, query hooks, composables, and current build health
- Validation run: `npm run build:check` on 2026-03-18

## Executive Summary

The current frontend has broad feature coverage at the route and component level, but only a subset of those surfaces are aligned to the backend inventory. The dominant problem is not "no UI exists"; it is "UI, store, query, and API layers are using different contracts."

The repo currently mixes three states:

1. Aligned surfaces
   - Admin user management is the clearest example.
   - Home page hot-post sidebar already uses `/ranking/posts/hot/details`.
2. Partial surfaces
   - Pages exist, but API paths, request shapes, or TypeScript models do not match the backend inventory.
3. Missing surfaces
   - Backend capability exists, but the frontend has no route/module for it yet.

Typecheck confirms the drift is material rather than theoretical:

- notification pages still call removed store methods
- drafts page calls composable methods that no longer exist
- tag and user optimistic state assumes fields not present in shared types
- message UI expects message sender objects not present in current message types
- auth, search, ranking, and comment code depend on contracts not present in the backend inventory

## Status Legend

- `Implemented`: route/module exists and is reasonably close to the backend inventory
- `Partial`: route/module exists but endpoint shape, data model, or architecture is misaligned
- `Missing`: backend capability exists but no frontend surface or adapter exists

## Domain Matrix

| Domain | Status | Implemented | Partial | Missing |
| --- | --- | --- | --- | --- |
| Auth / Session | Partial | login/register pages, auth store, refresh path | login form sends `username`; backend expects `email`; register expects auth response but backend returns user id; frontend depends on `/auth/me`, `/auth/logout`, forgot/reset/verify/change-password not confirmed in inventory | explicit current-user bootstrap contract, confirmed logout flow, verified password recovery/email verification flow |
| User / Profile / Social | Partial | user profile page, settings page, followers/following tabs, check-in widget | follow/unfollow path uses `/users/{id}/follow` instead of actor/target routes; profile update path/shape does not match inventory; settings mixes unsupported email/password flows; follow state check is TODO | block list/check UI, stranger-message setting UI, batch simple user fetch use, explicit follow-status adapter |
| Posts / Drafts / Likes / Favorites / Tags | Partial | home feed, post detail, post create/edit UI, drafts page, tag list/detail pages | frontend assumes `/posts/hot`, `/posts/recommended`, `/posts/drafts`, `/posts/images/upload`, `/posts/{id}/related`, category support, and draft semantics not present in inventory; publish/unpublish/schedule/restore flows are not aligned; type errors exist in create/edit/drafts/tag pages | schedule publishing UI, unpublish/restore UI, `my/{postId}` and `my?status=` views, post content endpoint usage, separate tag attach/remove flow, batch like/favorite status usage |
| Comments | Partial | comment components and comment query/mutation layer exist | frontend uses `/posts/{postId}/comments` style paths while backend exposes `/comments/post/{postId}/page|cursor`; current mutations/types do not line up cleanly; typecheck shows like/delete signature drift | comment cursor pagination, reply cursor flow, liked batch-state alignment, image/voice comment media upload integration, hot-reply specific handling |
| Messaging | Partial | message center page, message query hooks, websocket composable, conversation creation entry from profile | frontend paths use `/messages/conversations`, `/messages/history`, `/messages/send`; backend uses `/conversations`, `/messages/conversation/{conversationId}`, `/messages`; message UI expects sender display object fields not present in current type model | unread conversation count surface, recall UI, conversation-by-user alignment, finalized real-time transport contract |
| Notifications | Partial | notification center page, dropdown, unread-count query, websocket scaffolding | backend only confirms list, unread count, mark read, mark all read; frontend assumes delete, clear all, unread list, stats, settings, recent list, subscribe/unsubscribe; pages still use store methods that no longer exist | contract-aligned notification center built on query hooks only, verified realtime `/ws/notification` integration |
| Search | Partial | post-only search results page, hot search hooks, suggestion hooks | backend inventory confirms post search, suggest, hot, history; frontend now constrains the active route/page to post-only and consumes confirmed `List<String>` suggestion/hot responses; server-backed history is not wired yet (SearchBar keeps localStorage history) | history list/clear UX aligned to backend (auth required), user/tag/global/advanced search remain unconfirmed and should stay isolated |
| Ranking | Partial | ranking page shell, home hot-post sidebar, ranking query layer | backend confirms hot/daily/weekly/monthly post reads and hot creator/topic reads; frontend additionally assumes yearly posts, daily/weekly/monthly creators and topics, rising creators, trending topics, stats, user rank, post rank, topic rank | creator/topic views constrained to confirmed endpoints, score/rank detail surfaces if needed, admin ranking rebuild UI |
| Upload | Partial | dedicated upload client, avatar upload flow, editor/cover image upload scaffolding | upload client bypasses shared request stack; frontend uses upload patterns tied to post endpoints not in inventory; comment media uploads are not wired to backend comment-media endpoints; auth/ownership of upload requests is not normalized | audio upload UX, file URL resolution flow, delete/upload lifecycle for post/comment media |
| Admin / Moderation | Partial | admin routes for dashboard/users/posts/comments, aligned admin user page, admin posts/comments list/delete scaffolding | dashboard depends on unconfirmed stats/trends/activity endpoints; delete flows ignore backend delete-reason bodies; reports API exists in client/hooks but no route/page; report action enum does not match inventory yet | report queue page, report handling workflow, delete reason capture, ranking rebuild admin action if needed |

## Domain Notes

### Auth / Session

Implemented:

- `src/pages/auth/Login.vue`
- `src/pages/auth/Register.vue`
- `src/stores/auth.ts`
- `src/api/auth.ts`

Key gaps:

- Backend login request is `{ email, password }`; login page builds `{ username, password, rememberMe }`.
- Backend register request is `{ userName, email, password }`; current form/store assume richer frontend-only fields and an immediate authenticated `AuthResponse`.
- Backend inventory confirms `refresh`; it does not confirm `/auth/me` or `/auth/logout`.
- Much of the app assumes a current-user object is directly available after login, but the inventory only confirms token issuance.

Impact:

- Any authenticated feature depending on `authStore.user` is built on an unverified session bootstrap model.

### User / Profile / Social

Implemented:

- profile route and page
- followers/following tabs in profile
- settings page shell
- check-in widget

Key gaps:

- Follow routes in frontend use `/users/{userId}/follow`; backend uses `/{actorId}/following/{targetUserId}`.
- Blocking routes from backend have no frontend module.
- Stranger-message settings exist in backend inventory but are absent in settings UI.
- Settings page includes email and password flows not present in the inventory.

### Posts / Drafts / Tags

Implemented:

- home feed
- post detail
- create/edit editor screens
- drafts page shell
- tag list/detail pages

Key gaps:

- Frontend models still include category support although categories are not part of the inspected backend scope.
- Draft lifecycle is modeled as `/posts/drafts` in frontend, but backend inventory uses `/posts/{postId}/draft`, `/posts/drafts`, `GET /posts/my`, and explicit publish/unpublish/schedule flows.
- Tag detail/list reads are now aligned to backend-confirmed tag contracts:
  - tag detail: `GET /api/v1/tags/{slug}`
  - tag posts: `GET /api/v1/tags/{slug}/posts?page=&size=`
  - tag search: `GET /api/v1/tags/search?keyword=&limit=`
  - UI no longer renders speculative `isFollowing`, `followersCount`, `relatedTags`, or paging fields.
- Remaining: tag follow/related/suggestions/followers are not confirmed in the inspected content service and are currently not implemented in the public-content read slice.
- The editor path uses post-image upload assumptions instead of contract-aligned upload service usage.

### Comments

Implemented:

- comment list/form/item components
- comment query/mutation layer

Key gaps:

- Backend comment reads are organized under `/comments/post/{postId}/page|cursor`; frontend still expects nested `/posts/{postId}/comments`.
- Like/delete mutation signatures have already drifted enough to fail typecheck.
- Backend supports comment media uploads and voice attachments; frontend has no aligned end-to-end integration for those paths.

### Messaging

Implemented:

- `src/pages/message/MessageCenter.vue`
- query hooks for conversations/messages/send/mark-read/create-conversation
- websocket composable

Key gaps:

- The main REST paths are misnamed relative to backend inventory.
- Data shape assumptions differ: backend `MessageVO` contains sender display fields; current shared `Message` type is thinner and the page still expects nested `sender.avatar` style access.
- Conversation creation in frontend uses POST create semantics; backend inventory shows `GET /conversations/user/{userId}`.

### Notifications

Implemented:

- notification center route/page
- notification dropdown
- unread count query
- generic websocket hookup

Key gaps:

- The page and dropdown still depend on store methods that no longer exist after server-state migration to TanStack Query.
- Frontend assumes delete, clear-all, unread-only, settings, recent-list, and subscription endpoints not present in the backend inventory.
- Backend realtime contract is STOMP/SockJS at `/ws/notification`; current frontend websocket utility is generic and unverified against that transport.

### Search

Implemented:

- search results route/page narrowed to post-only search
- contract-aligned `src/api/search.ts` for confirmed `/search/posts`, `/search/suggest`, `/search/hot`, `/search/history`
- search result normalization from `SearchResultVO<PostSearchVO>` to route-friendly post cards
- search bar suggestions and hot keywords aligned to backend `string[]` responses

Key gaps:

- Backend inventory confirms post search plus suggestions/hot/history; the active UI now limits itself to the confirmed post-only search read flow.
- Unconfirmed global/user/tag/advanced/report/filter capabilities are intentionally isolated (see `src/api/search-legacy.ts`) and should not be used by the public-content slice until contracts are verified.
- Backend history list/clear is now wired for authenticated users; anonymous users still use localStorage fallback because the confirmed backend history contract is auth-required.

### Ranking

Implemented:

- ranking page narrowed to backend-confirmed hot-post-only view
- hot-post sidebar on home
- contract-aligned `src/api/ranking.ts` now keeps only `GET /ranking/posts/hot/details`

Key gaps:

- Daily/weekly/monthly post lists and creator/topic hot lists still need explicit hydration or page-ready DTO handling before they can return to the active public page.
- Legacy ranking APIs and hooks remain available for untouched surfaces, but they are intentionally separated from the contract-aligned page and client.
- Unsupported creator/topic time tabs, yearly posts, rising/trending lists, stats, and item-rank detail flows are no longer exposed by the active ranking page.

### Upload

Implemented:

- standalone upload client
- avatar upload flow
- editor image upload scaffolding

Key gaps:

- Upload client bypasses shared auth/error-handling stack.
- Backend upload inventory includes image, audio, image-with-access, batch images, file URL, and delete; frontend only partially uses that surface.
- Comment image/voice upload paths are not wired.

### Admin / Moderation

Implemented:

- admin route tree
- aligned admin user management slice
- admin posts/comments listing and delete scaffolding
- admin reports client/hooks exist

Key gaps:

- `Dashboard.vue` advertises endpoints not confirmed by backend inventory.
- Admin post/comment delete endpoints require reason bodies; current UI/client delete flows do not capture them.
- Reports have backend coverage and client hooks, but no visible route/page yet.

## Current Frontend Health Risks

### 1. Contract drift is systemic

The repo does not have a single source of truth for backend DTOs and paths. Pages, stores, composables, query hooks, and API clients have drifted independently.

### 2. Query migration is incomplete

Notifications and messages are halfway migrated from store-owned server state to TanStack Query. Several pages still call old store methods.

### 3. Shared domain types are too idealized

`User`, `Post`, `Tag`, `Message`, and `Notification` are modeled as if all screens receive the same shape. The backend inventory shows multiple DTO families with materially different fields.

### 4. Public vs authenticated flows are not clearly separated

Because auth bootstrap is unverified, protected features cannot be trusted until session semantics are reconciled.

## Highest-Value Gaps

1. Session contract alignment
   - login/register/current-user assumptions do not match the inventory
2. Public content contract alignment
   - posts/comments/tags/search/ranking read flows are the most user-visible and closest to being salvageable
3. Notification/message architecture cleanup
   - pages are wired to obsolete store APIs
4. DTO normalization
   - current shared types hide important backend response differences
5. Admin moderation completion
   - reports flow is effectively missing despite backend coverage

## Recommended Direction For The Next Pipeline Stage

Start with a contract-first public-content slice instead of an auth-heavy slice.

Why:

- it avoids the unresolved `/auth/me` and token bootstrap ambiguity
- it can deliver visible value quickly
- it forces the frontend to introduce the missing adapter layer for `HybridPageResult`, `PageResult`, `PostVO`, `CommentVO`, and `TagDTO`
- it creates the pattern that later authenticated and admin flows can reuse

Recommended first slice:

- home feed via backend-aligned `/posts` and `/ranking/posts/hot/details`
- post detail via `/posts/{postId}`
- comment list via `/comments/post/{postId}/page`
- tag hot/list detail flows only where the backend inventory actually confirms them

## Ambiguities To Resolve Early

1. How the frontend obtains the current logged-in user after `POST /auth/login`
   - backend inventory confirms token issuance, not a current-user endpoint
2. Whether JWT claims can safely drive current-user bootstrap
3. Whether admin delete endpoints require `reason` in all cases
4. Exact `ReportVO`, `PostManageVO`, and `CommentManageVO` field shapes
5. Whether `/ws/notification` is directly reachable by the browser and how auth is passed
6. Whether upload requests should go through the gateway or directly to a separate file service
