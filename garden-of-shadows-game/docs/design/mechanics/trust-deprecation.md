# Trust System Deprecation — V4.2

## Status: DEPRECATED (no new expansion)

The Trust/TruthMatrix system that powered Ch1 "choose who to believe" mechanics is deprecated per V4.2 Production Plan.

## What Changed

### Removed from Ch1
- `trust` dialogue sequence no longer triggers after contradiction confirmation
- Contradictions now directly trigger the chase sequence
- No "choose believe gardener/wife" UI in Chapter 1

### Preserved (backward compat)
- `TrustNode` type in `types.ts` — still used by North Tower chapter
- `trust:set` dialogue command — still parsed and handled
- `trustDecisions` in `CheckpointState` — still serialized/deserialized
- North Tower trust dialogue sequence — functional

### Must Not Change
- Do NOT add new `trust:set` commands in Ch1 dialogue
- Do NOT add new `TrustNode` entries to `west-corridor.ts`
- Do NOT add trust-related flags to Ch1 `completionFlags`
- Do NOT create trust UI components

## Migration Path

| Old V4.0 behavior | V4.2 replacement |
|---|---|
| Player chooses who to believe | Player combines evidence from both cognitions |
| Trust score determines outcome | Contradiction confirmation + evidence path determines outcome |
| "Who is lying" framing | "Both remember different gardens" framing |
| Trust → chase trigger | Contradictions confirmed → chase directly |

## Code Locations with Trust References

| File | Usage | Action |
|---|---|---|
| `types.ts:44` | `trustNodes: TrustNode[]` in ChapterManifest | Keep for North Tower |
| `types.ts:150` | `TrustNode` interface | Keep for North Tower |
| `types.ts:178` | `trustDecisions` in CheckpointState | Keep for backward compat |
| `types.ts:242` | `trustDecision` in ChapterCompletePayload | Keep for backward compat |
| `types.ts:75` | `trust:set` dialogue command type | Keep for North Tower |
| `GameRuntime.tsx` | `trust:set` handler | Keep (serves Ch1 and North) |
| `NorthTowerRuntime.tsx` | Full trust integration | Keep — North Tower uses it |
| `campaign-save.ts` | `trustDecisions` normalization | Keep |
| `manifests/west-corridor.ts:106` | `trustNodes` array | No new entries; existing kept |
| `manifests/west-onboarding.ts` | `trust` dialogue sequence | Keep existing; no new trust sequences in Ch1 |
| `narrative/dialogue.ts` | `trust:set` parser | Keep for North Tower |
| `dialogue.test.ts` | trust parsing tests | Keep |
| `rules.test.ts` | trust flag tests | Keep |
