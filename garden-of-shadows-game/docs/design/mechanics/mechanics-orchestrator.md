# MechanicsOrchestrator Design

## Purpose

`MechanicsOrchestrator` is the single entry point for all game-mechanics state in V4.2. GameRuntime delegates to it instead of managing individual controllers or inline logic.

## Architecture

```
GameRuntime
    │
    ▼
MechanicsOrchestrator
    │
    ├── CognitionController     — memory layer switching
    ├── BorrowAnchorController  — borrow → anchor → persist
    ├── LoopController          — teleport links with cooldown
    ├── EvidenceLedger          — discovery + interpretation unlock
    ├── NarrativeGateController — flag/evidence-based progression
    ├── PuzzleController        — token-based puzzle solving
    │
    └── ReconstructionProfile   — V4.1 ending requirements
```

## Key Design Decisions

### 1. Orchestrator owns all mechanic state
GameRuntime no longer directly mutates evidence flags, puzzle tokens, or cognition state. It calls orchestrator methods and the orchestrator updates internal controllers.

### 2. Bindings separate runtime from mechanics
`MechanicsBindings` provides the orchestrator with callbacks to affect the visual/physics world without the orchestrator knowing about Three.js or Rapier directly:
- `cognition.applyObjectState` — update visual/collider per cognition
- `cognition.applyLightPreset` — switch lighting
- `cognition.applyAudioPreset` — switch audio ambience
- `borrow.createBorrowedObject` — spawn borrowed prefab
- `borrow.destroyBorrowedObject` — remove borrowed prefab
- `borrow.setBorrowedObjectAnchored` — lock to anchor
- `applyCognitionVisual` — switch world memory layers
- `restoreCognition` — reset to default cognition

### 3. ReconstructionProfile is session-only
The profile is not persisted in `MechanicSaveState` yet. It accumulates during a play session and will be serialized in a future update when the fifth-reality ending system needs it.

### 4. Trust is not in the orchestrator
The orchestrator has zero trust-related logic. Trust decisions (for North Tower backward compat) remain in `NorthTowerRuntime.tsx` only.

## Usage in GameRuntime

```typescript
// Boot
const orchestrator = new MechanicsOrchestrator({ ... }, bindings);

// Cognition switch (TAB key)
orchestrator.switchCognition("gardener");

// Evidence discovery (on interact)
orchestrator.discoverEvidence("waterline-direction", ["space"]);

// Puzzle token (on interaction)
orchestrator.recordPuzzleToken("waterline-puzzle", "stain-wife");

// Serialize on checkpoint save
const mechanicState = orchestrator.serializeMechanicState();
```

## ReconstructionProfile Fields

| Field | Type | Purpose |
|---|---|---|
| `cognitionUsage` | `Record<CognitionId, number>` | How many times each cognition was active |
| `borrowSources` | `Record<CognitionId, string[]>` | Which objects were borrowed from each cognition |
| `anchoredSources` | `Record<CognitionId, string[]>` | Which borrowed objects were anchored per cognition |
| `evidenceDiscoveryOrder` | `string[]` | Chronological order of evidence discovery |
| `evidenceChannelWeights` | `Partial<Record<string, number>>` | How many evidence per channel (space, object, document, image, testimony, audio) |
| `reconstructionTags` | `string[]` | Semantic tags for reconstruction (e.g. "anchored:gardener:corridor-segment") |

## Future Extension Points

- **AudioZoneController**: Will be added to the orchestrator when P1 audio work begins
- **EvidenceRecontextualization**: Will extend EvidenceLedger for Ch4
- **ViewDependentEvidence**: Will add visibility conditions per cognition
- **CameraRig integration**: Will replace manual camera in GameRuntime
