# ZhiCore Frontend Alignment Plan

## Goal
Continue ZhiCore frontend development with a contract-first pipeline. This round targets the first public-content vertical slice so the home page, post detail page, and comment read path move closer to the backend inventory without broad refactors.

## Status
- Current phase: completed
- Active workflow: `planning-with-files` + `leader`
- Current slice: public content tag read flow follow-up

## Phases
- [x] Restore planning context from existing repo documents
- [x] Read the pulled frontend analysis, design, and implementation plan
- [x] Produce a minimal implementation plan for the current slice
- [x] Create one shared git worktree for the implementation pipeline
- [x] Run architecture analysis for the slice
- [x] Implement the slice with minimal diff
- [x] Review the changes
- [x] Validate with targeted checks
- [x] Sync documentation and update planning files

## Current Slice Scope
- Home hot tags sidebar
- Tag list read flow
- Tag detail read flow
- Backend-confirmed tag search and slug-post reads used by the above screens

## Constraints
- Keep changes limited to the first public-content vertical slice.
- Follow backend-confirmed contracts only; hide unsupported assumptions instead of inventing fields.
- Prefer query-hook and adapter cleanup over page-level hacks.
- Avoid broad refactors outside touched modules.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---:|---|
| `session-catchup.py` not found under `/home/azhi/.claude/plugins/planning-with-files/scripts/` | 1 | Use the active Codex skill directory and restore context manually from `task_plan.md`, `findings.md`, `progress.md`, and current repo docs |
| `vue-tsc` crashed with `Search string not found: /supportedTSExtensions.../` in the previous session | 1 | Already resolved upstream by exact-pinning `typescript` to `5.3.3`; keep this as a known environment baseline |
