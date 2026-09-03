# UI / Story Image / Guidance Implementation

Date: 2026-08-31

## Outcome

Implemented the completion-first UI and guidance plan for the prologue and Chapter 1 without changing Blender Master geometry, GLB architecture, formal terrain, doors, windows or textures.

## Implemented

- Added a typed story/UI image manifest and missing-image fallback.
- Added first-run controls tutorial persisted in the campaign save; H can reopen it.
- Added right-side Area A minimap and M full map with live player position, heading, objective/search marker, region labels and locked regions.
- Added Esc pause flow, mouse release, resume, map, help, runtime settings and case-file exit.
- M now owns the map; the existing contradiction notebook moved to N.
- Rewrote prologue objective copy into entry, three spatial references, ledger, old-object search, anomaly return and steward return.
- Added 20-second distance guidance and 45-second spoken/world guidance, with an accessibility toggle.
- Chapter 1 now exposes the 3-of-4 trace search, cognition comparison, Loop, Borrowed View, Borrow/Anchor, loop break and 2-of-3 hidden-yard reward through readable task/map targets.
- Added static backdrops to the four prologue beats and four Chapter 1 beats while retaining portrait and dialogue systems.
- Generated and stored all 13 planned WebP assets, including the optional second batch.

## Verification

- `npm run typecheck`: passed.
- Focused Vitest set: 21/21 passed.
- Build preflight content suite: 51/51 passed.
- `npm run build`: passed.
- Focused ESLint on all touched TypeScript/TSX files: passed.
- Asset probe: all 13 WebP files match the planned dimensions.
- `git diff --check`: no whitespace errors; repository emits existing LF/CRLF conversion warnings.

## Review notes

- The repository was already heavily modified and contains user-owned untracked runtime work; no unrelated edits were reverted.
- The Master model and all formal scene assets remain untouched.
- Build emits the existing large-chunk advisory, and one existing Rapier initialization deprecation warning appears in tests.

## Continuous playtest follow-up

- Completed a fresh-save browser walkthrough from New Game through the prologue and all of Chapter 1, including the first-run tutorial, H help/tutorial reopen, M map, Esc pause/settings, three prologue landmarks, evidence and anomaly, both Chapter 1 contradictions, Borrowed View, Borrow/Anchor, loop break, hidden-yard rewards, chase, east exit and chapter-complete handoff.
- Fixed the Chapter 1 arrival marker: its task/map target now uses the real front-hall-to-west completion trigger instead of the player spawn anchor. The opening readout changed from the misleading 1 m to the actual approximately 6 m route.
- Fixed campaign resume from the case archive. The first menu entry now reflects the active checkpoint (继续序章 / 继续第一章 / 继续第二章 / 继续第三章) and resumes without resetting progress.
- Verified the mid-Chapter 1 resume path in-browser after a tooling reconnect, then continued from the restored Loop objective to Chapter 1 completion.
- Browser console: no runtime errors; only the known Rapier initialization deprecation warning.
- Follow-up verification: TypeScript passed, focused tests 12/12 plus final route test 3/3 passed, build preflight 51/51 passed, production build passed, and focused ESLint passed.
