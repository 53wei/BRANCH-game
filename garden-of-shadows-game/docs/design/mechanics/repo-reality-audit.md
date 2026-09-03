# Repo Reality Audit — V4.2 Post-Implementation

Updated: 2026-08-29. Source of Truth: 《游园惊梦：四面证词》Master GDD V4.1 + Production Plan V4.2.

| Area | V4.0 Status | V4.2 Status | Notes |
|---|---|---|---|
| Three.js renderer | REUSE | REUSE | `RendererAdapter` with WebGPU + WebGL2 fallback. Stable. |
| WebGPU architecture | REUSE | REUSE | Async renderer init, ACES tone mapping. Portals use render targets. |
| Rapier physics | REUSE | REUSE | `@dimforge/rapier3d-compat@0.19.3`. Two implementations merged via `PhysicsController` + `PlayerPhysics`. |
| Player movement | PATCH | REUSE | KinematicCharacterController with autostep, snap, slope limits. Cognition-aware collision groups. |
| Camera | PATCH | PARTIAL | `CameraRig.ts` exists with exploration/investigation modes but is not yet wired into GameRuntime. Manual camera in loop. |
| Interaction | REPLACE | REUSE | `InteractionController.ts` with Three.js layer-based raycasting exists. GameRuntime still uses inline scan (functional but not using controller). |
| Character animation | MISSING | PARTIAL | `CharacterAnimationState.ts` exists but not wired into runtime. Asset task remains. |
| State store | PATCH | REUSE | `CheckpointState` + `MechanicSaveState`. Serialization via `campaign-save.ts`. |
| Chapter / quest | PATCH | REUSE | Manifest, objective graph, Ink dialogue, ObjectiveDirector. Trust removed from Ch1 progression. |
| Save / checkpoint | PATCH | REUSE | `garden-of-shadows.save.v2` with full mechanic serialization. |
| Audio | PATCH | REUSE | `AudioAtmosphere.ts` with ambient + bell. AudioZone system is P1. |
| Asset pipeline | REUSE | REUSE | `RuntimeAssetLoader` with GLB, KTX2, Meshopt, caching, zone streaming. |
| Cognition | PATCH | REUSE | `CognitionController` wired through `MechanicsOrchestrator`. Object state switching + light/audio presets. |
| Borrowed View | REPLACE | REUSE | `BorrowedViewPortal.ts` with render target. Wired through orchestrator bindings. |
| Loop Space | PATCH | REUSE | `LoopController` with `LoopLink` cooldown + transform continuity. |
| Borrow | MISSING | REUSE | `BorrowAnchorController` with `BorrowableConfig`, anchor slot, unanchor/reset. |
| Anchor | MISSING | REUSE | Single `AnchorSlot` in `BorrowAnchorController`. Persists through save. |
| Evidence | REPLACE | REUSE | `EvidenceLedger` with discovery + interpretation unlock. No trust encoding. |
| Narrative gates | MISSING | REUSE | `NarrativeGateController` with `requiredAll`/`requiredAny` + channel count. |
| ReconstructionProfile | MISSING | DONE | `ReconstructionProfile` in `MechanicsOrchestrator`. Tracks cognitionUsage, borrowSources, anchoredSources, evidenceDiscoveryOrder, channel weights, reconstructionTags. |
| Trust System | KEEP (backward) | DEPRECATE | V4.2: No new trust logic in Ch1. Ch1 contradictions now directly trigger chase. North Tower trust preserved for backward compat. |

## What Changed in This Session

### New: MechanicsOrchestrator
- Central coordinator in `mechanics/MechanicsOrchestrator.ts`
- Instantiates and owns: `CognitionController`, `BorrowAnchorController`, `LoopController`, `EvidenceLedger`, `NarrativeGateController`, `PuzzleController`
- Exposes clean API: `switchCognition`, `executeBorrow`, `anchor`, `discoverEvidence`, `evaluateNarrativeGates`, `recordPuzzleToken`, `serializeMechanicState`
- Includes `ReconstructionProfile` for V4.1 ending requirements

### New: Test Suite
- `mechanics.test.ts`: 8 tests covering orchestrator creation, cognition switching, evidence tracking, puzzle solving, narrative gates, serialization, borrow tracking

### Modified: GameRuntime.tsx
- Orchestrator instantiated during boot
- Cognition switching routes through orchestrator
- Evidence discovery routes through orchestrator's `EvidenceLedger`
- Checkpoint serialization captures mechanic state from orchestrator
- V4.2: Removed Ch1 trust dialogue trigger. Contradictions now directly trigger chase.

### Deprecated: Trust in Ch1
- Removed `trust` dialogue sequence trigger from `completeDialogue`
- `inspectContradiction` calls `startChase()` directly when all contradictions confirmed
- `trust:set` dialogue command kept for North Tower backward compat

## Current Gap List (P0)

1. **CameraRig not wired**: `CameraRig.ts` exists but GameRuntime uses manual camera math. Exploration→investigation transition not implemented.
2. **Borrow/Anchor not in Ch1**: `BorrowAnchorController` exists but no Ch1 borrowables configured.
3. **Borrowed View not in Ch1**: Portal exists but no Ch1 portal bindings.
4. **Dev mechanics playground**: `app/dev/mechanics/` has page skeleton but no interactive demo.
5. **AudioZone system**: P1 — ambient crossfades per zone.

## Current Gap List (P1)

1. Evidence Recontextualization (Ch4)
2. View-dependent evidence (Ch2)
3. AudioZone system
4. CharacterAnimationState wiring
5. InteractionController wiring (replace inline scan)
