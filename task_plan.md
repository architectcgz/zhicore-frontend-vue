# ZhiCore Frontend Overnight Plan

## Goal
By morning, finish the current ZhiCore frontend admin/user-management slice to a handoff-ready state: design aligned, code coherent, tests runnable locally on the user's computer, and a clear verification record.

## Status
- Current phase: in_progress
- Owner: OpenClaw + Codex worker supervision
- Handoff target: morning local inheritance/integration testing by user

## Phases
- [x] Inspect current repo state and in-flight admin slice changes
- [x] Install dependencies locally in repo
- [x] Fix verification pipeline blockers
  - [x] Make targeted admin API test discoverable/runnable
  - [x] Resolve vue-tsc version-compatibility blocker
  - [x] Distinguish remaining resource-limit failures from real code failures
- [x] Re-verify admin slice
  - [x] targeted tests
  - [x] type/build checks
- [ ] Review diffs and trim unnecessary edits
- [ ] Commit with clear message
- [x] Leave morning handoff summary

## Constraints
- Keep scope focused on current admin slice and verification pipeline needed to support it.
- Avoid broad unrelated refactors.
- Prefer minimal safe fixes.
- Put project docs under docs/ subfolders.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---:|---|
| `vue-tsc` crashed with `Search string not found: /supportedTSExtensions.../` | 1 | Resolved by exact-pinning `typescript` to `5.3.3`; current repo-wide `vue-tsc` now runs and reports real pre-existing type errors instead of crashing |
| `vitest` could not find `src/api/admin.test.ts` | 1 | Resolved by relocating the test to `test/api/admin.test.ts`, which matches the existing Vitest include pattern |
| `npm run build` previously exited `137` after chunking/gzip | 1 | Re-ran successfully; this was an environment/transient resource failure, not a persistent code/build configuration issue |
