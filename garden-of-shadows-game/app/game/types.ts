import type { MechanicSaveState } from "./mechanics/types";

export type ChapterStatus = "playable" | "prototype" | "planned";
export const MEMORY_IDS = ["baseline", "wife", "gardener", "accountant", "painter", "zhaoying"] as const;
export type MemoryId = (typeof MEMORY_IDS)[number];
export type ContradictionKind = "geometry" | "time" | "object" | "identity" | "causality";
export const ENDING_IDS = ["domestic", "spatial", "documentary", "pictorial", "composite"] as const;
export type EndingId = (typeof ENDING_IDS)[number];
export const SPEAKER_IDS = ["narrator", "zhaoying", "young-zhaoying", "master", "steward", "wife", "gardener", "accountant", "painter"] as const;
export type SpeakerId = (typeof SPEAKER_IDS)[number];
export type DialoguePresentation = "stage" | "bark";
export type GuidanceChannel = "objective" | "direction" | "world-marker" | "outline" | "light" | "audio";

export interface CampaignManifest {
  id: "garden-of-shadows";
  title: string;
  subtitle: string;
  version: string;
  chapterOrder: string[];
  chapters: ChapterManifest[];
  endingRules: Record<EndingId, EndingRule>;
}

export interface EndingRule {
  title: string;
  description: string;
  requiredFlags: string[];
  /** Optional campaign metric contract used to derive the final stability mode. */
  metrics?: {
    cognition?: Extract<MemoryId, "wife" | "gardener" | "accountant" | "painter">;
    minimumLead?: number;
    balancedMaxSpread?: number;
  };
  requiredContradictions?: number;
  requiredNameAnchors?: number;
  hidden?: boolean;
}

export interface ChapterManifest {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  logline: string;
  estimatedMinutes: [number, number];
  status: ChapterStatus;
  unlock: { chapterId?: string; requiredFlags: string[] };
  assetPack: AssetPackRef;
  spawnAnchor: string;
  memories: MemoryLayer[];
  contradictions: SpatialContradiction[];
  puzzleGraph: PuzzleGraph;
  trustNodes: TrustNode[];
  chaseSegments: ChaseSegment[];
  completionFlags: string[];
  dialogueSequences?: DialogueSequence[];
  objectives?: ObjectiveDefinition[];
}

export interface DialogueSequence {
  id: string;
  knotId: string;
  presentation: DialoguePresentation;
  participants: SpeakerId[];

  completionFlag?: string;
  backdrop?: string;
}

export interface SpeakerProfile {
  id: SpeakerId;
  name: string;
  side: "left" | "right" | "none";
  themeColor: string;
  voiceId?: string;
  portraits: Record<string, string>;
  defaultPortrait: string;
}

export type DialogueCommand =
  | { type: "objective:start"; objectiveId: string; stepId: string }
  | { type: "objective:step"; stepId: string }
  | { type: "flag:set"; flag: string }
  | { type: "trust:set"; nodeId: string; choiceId: string; outputFlag: string }
  | { type: "memory:unlock"; memoryId: MemoryId }
  | { type: "scene:resume" };

export interface ObjectiveDefinition {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  completionFlags: string[];
}

export type ObjectiveTargetRef =
  | { kind: "anchor"; id: string }
  | { kind: "interactable"; id: string }
  | { kind: "trigger"; id: string };

export interface TutorialStep {
  id: string;
  instruction: string;
  /** Canonical world target used by direction, map and world marker. */
  targetRef?: ObjectiveTargetRef;


  targetInteractableId?: string;
  guidance: GuidanceChannel[];
  hints: [string, string, string];
}

export interface DialogueProgress {
  sequenceId: string;
  inkStateJson: string;
}

export interface AssetPackRef {
  id: string;
  initialBudgetMb: number;
  preload: string[];
  deferred: string[];
}

export interface MemoryLayer {
  id: MemoryId;
  character: string;
  label: string;
  description: string;
  visual: {
    fog: string;
    ambient: string;
    keyLight: string;
    exposure: number;
    lut: string;
  };
  topologyOverrides: string[];
  collisionGroup: number;
  switchRegions: string[];
}

export interface SpatialContradiction {
  id: string;
  label: string;
  description: string;
  position: [number, number, number];
  kind: ContradictionKind;
  requiredIndependentTestimonies: MemoryId[];
  confirmedByDefault: boolean;
  outputFlag: string;
}

export interface PuzzleGraph {
  nodes: PuzzleNode[];
}

export interface PuzzleNode {
  id: string;
  title: string;
  ruleStage: "teach" | "combine" | "invert";
  prerequisites: string[];
  interaction: string;
  outputFlags: string[];
  softHint: string;
}

export interface TrustNode {
  id: string;
  prompt: string;
  options: Array<{ id: string; label: string; outputFlag: string }>;
  prerequisiteFlags: string[];
}

export interface ChaseSegment {
  id: string;
  title: string;
  triggerFlags: string[];
  startAnchor: string;
  safeAnchor: string;
  checkpointSeconds: number;
  narrativeReveal: string;
}

export interface ReconstructionTraceState {
  discoveredOptionalEvidence: string[];
  solvedWithCognition: Record<string, string[]>;
  /** How often the player actively relied on each cognition while investigating. */
  cognitionUsage: Partial<Record<MemoryId, number>>;
  anchoredFragments: string[];
  preservedContradictions: string[];
  finalAssemblyFragments: string[];
}

export interface FinalAssemblyState {
  factSkeletonFlags: string[];
  selectedFragments: string[];
  endingLens?: EndingId;
  complete: boolean;
}

export interface CheckpointState {
  schemaVersion: 3;
  layoutVersion: string;
  chapterId: string;
  anchorId: string;
  position?: [number, number, number];
  yaw?: number;
  memoryId: MemoryId;
  mechanics: MechanicSaveState;
  reconstructionTrace: ReconstructionTraceState;
  finalAssemblyState: FinalAssemblyState;
  earnedFlags: string[];
  contradictions: string[];
  observedBy: Record<string, MemoryId[]>;
  trustDecisions: Record<string, string>;
  nameAnchors: string[];
  chaseProgress: Record<string, "not-started" | "active" | "escaped">;
  activeObjectiveId?: string;
  objectiveStepId?: string;
  objectiveProgress: Record<string, string[]>;
  dialogueProgress?: DialogueProgress;
  seenDialogueLines: string[];
  hintLevels: Record<string, number>;
  pointerLockPending: boolean;
  updatedAt: string;
}

export interface CampaignSave {
  schemaVersion: 3;
  activeCheckpoint: CheckpointState;
  completedChapters: string[];
  unlockedChapters: string[];
  endingIds: EndingId[];
  settings: GameSettings;
  tutorial: {
    controls: {
      seen: boolean;
    };
  };
}

export interface GameSettings {
  quality: "high" | "stable" | "low";
  renderer: "auto" | "webgl";
  stableCamera: boolean;
  subtitles: boolean;
  guidanceAssist: boolean;
  masterVolume: number;
  dialogueSpeed: "slow" | "normal" | "fast" | "instant";
  textScale: "normal" | "large";
}

export interface VoiceAssetManifest {
  id: string;
  speakerId: SpeakerId;
  provider: "azure-speech";
  voiceId: string;
  locale: "zh-CN";
  ssmlPath: string;
  opusPath?: string;
  mp3Path?: string;
  licenseRecord: string;
  integritySha256?: string;
  status: "script-locked" | "credentials-required" | "generated" | "approved";
}

export interface AssetManifest {
  id: string;
  title: string;
  sourceUrl: string;
  author: string;
  version: string;
  license: string;
  webDistribution: "allowed" | "written-permission-required" | "prerender-only" | "pending";
  aiUsage: "allowed" | "prohibited" | "unknown";
  compressedBundle?: string;
  integritySha256?: string;
  status: "candidate" | "approved" | "rejected";
}

export interface ChapterCompletePayload {
  chapterId: string;
  earnedFlags: string[];
  contradictions: string[];
  trustDecision?: string;
  endingId?: EndingId;
}

declare global {
  interface WindowEventMap {
    "garden-of-shadows:chapter-complete": CustomEvent<ChapterCompletePayload>;
  }
}
