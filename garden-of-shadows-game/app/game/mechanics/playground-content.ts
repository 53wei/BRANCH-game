import type { BorrowableConfig, CognitionObjectDefinition, EvidenceDefinition, NarrativeGateDefinition, PuzzleDefinition } from "./types";

export const playgroundCognitionObjects: CognitionObjectDefinition[] = [
  {
    id: "wife-door",
    defaultState: { lightPreset: "wife-warm", audioPreset: "wife-rain" },
    states: {
      wife: { visible: true, colliderEnabled: true, interactionEnabled: true },
      gardener: { visible: false, colliderEnabled: false, interactionEnabled: false, lightPreset: "gardener-cool", audioPreset: "gardener-rain" },
    },
  },
  {
    id: "gardener-route",
    states: {
      wife: { visible: false, colliderEnabled: false },
      gardener: { visible: true, colliderEnabled: true },
    },
  },
  {
    id: "source-bridge",
    states: {
      wife: { visible: false, colliderEnabled: false, interactionEnabled: false },
      gardener: { visible: true, colliderEnabled: true, interactionEnabled: true },
    },
  },
  {
    id: "source-slab",
    states: {
      wife: { visible: true, colliderEnabled: true, interactionEnabled: true },
      gardener: { visible: false, colliderEnabled: false, interactionEnabled: false },
    },
  },
];

export const playgroundBorrowables: BorrowableConfig[] = [
  {
    id: "source-bridge",
    sourceCognition: "gardener",
    runtimePrefabId: "bridge-segment",
    collisionPrefabId: "bridge-segment-collision",
    allowedTargetAnchors: ["gap-anchor"],
  },
  {
    id: "source-slab",
    sourceCognition: "wife",
    runtimePrefabId: "stone-slab",
    collisionPrefabId: "stone-slab-collision",
    allowedTargetAnchors: ["gap-anchor"],
  },
];

export const playgroundEvidence: EvidenceDefinition[] = [
  {
    id: "loop-landmark",
    channel: "space",
    observableFacts: ["穿过假山后，再次看见同一盏方灯。"],
    narrativeTags: ["chapter-1", "route"],
    interpretations: [{ id: "initial", text: "这条侧路会回到它自己。" }],
  },
  {
    id: "borrowed-structure",
    channel: "object",
    observableFacts: ["另一认知中的结构可以在当前位置形成实体碰撞。"],
    narrativeTags: ["chapter-1", "borrow"],
    interpretations: [{ id: "initial", text: "借出的结构不是幻象。" }],
  },
  {
    id: "wet-footprint",
    channel: "document",
    observableFacts: ["夹院湿脚印朝水榭方向延伸，数量多于已知四人。"],
    narrativeTags: ["chapter-2", "fifth-person"],
    interpretations: [
      { id: "initial", text: "案发夜还有一条未被记录的路线。" },
      { id: "fifth-person", unlockCondition: "beat.fifth-person", text: "这组脚印属于未被四份证词承认的第五人。" },
    ],
  },
];

export const playgroundGates: NarrativeGateDefinition[] = [
  {
    id: "CH2_FIFTH_PERSON_CONFIRMED",
    requiredAll: ["evidence.loop-landmark", "evidence.borrowed-structure", "evidence.wet-footprint"],
    minEvidenceChannels: 3,
    evidenceScope: ["loop-landmark", "borrowed-structure", "wet-footprint"],
    unlockBeat: "beat.fifth-person",
  },
];

export const playgroundPuzzles: PuzzleDefinition[] = [
  {
    id: "break-rockery-loop",
    inputs: ["loop.seen", "bridge.borrowed", "slab.borrowed", "object.anchored", "anchor.verified"],
    worldStates: ["looping", "direct-route"],
    solutions: [
      { id: "anchored-bridge", requiredTokens: ["loop.seen", "bridge.borrowed", "object.anchored", "anchor.verified"], worldStateId: "direct-route" },
      { id: "anchored-slab", requiredTokens: ["loop.seen", "slab.borrowed", "object.anchored", "anchor.verified"], worldStateId: "direct-route" },
    ],
    evidenceRewards: ["wet-footprint"],
    resetPolicy: "manual",
  },
];

