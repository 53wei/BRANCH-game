import { describe, expect, it } from "vitest";
import { MechanicsOrchestrator, type MechanicsBindings } from "./MechanicsOrchestrator";
import { createDefaultMechanicSaveState } from "./types";

const sampleCognitionObjects = [
  {
    id: "water-stain",
    defaultState: { visible: true, colliderEnabled: true, interactionEnabled: true },
    states: {
      wife: { visible: true, materialVariant: "dry" },
      gardener: { visible: true, materialVariant: "wet" },
    },
  },
];

const sampleBorrowables = [
  {
    id: "corridor-segment",
    sourceCognition: "gardener" as const,
    runtimePrefabId: "corridor-grey",
    collisionPrefabId: "corridor-collider",
    allowedTargetAnchors: ["west-entry", "loop-exit"],
  },
];

const samplePuzzles = [
  {
    id: "waterline-puzzle",
    inputs: ["stain-wife", "stain-gardener"],
    worldStates: ["dry", "wet"],
    solutions: [{ id: "both-observed", requiredTokens: ["stain-wife", "stain-gardener"], worldStateId: "reversed" }],
    evidenceRewards: ["waterline-direction"],
    resetPolicy: "checkpoint" as const,
  },
];

const sampleEvidence = [
  {
    id: "waterline-direction",
    channel: "space" as const,
    observableFacts: ["水痕朝水榭方向倒流", "砖缝苔藓生长方向"],
    narrativeTags: ["水路异常"],
    interpretations: [
      { id: "default", text: "水痕方向与夫人记忆相反" },
      { id: "reversed", text: "园丁记忆中的水路是倒流的", unlockCondition: "gardener-observed" },
    ],
  },
];

const sampleGates = [
  {
    id: "both-testimonies",
    requiredAll: ["west.contradiction.waterline"],
    unlockBeat: "chase-begin",
  },
];

function createTestBindings(): MechanicsBindings {
  const appliedPresets: string[] = [];

  return {
    cognition: {
      applyObjectState: () => {},
      applyColliderState: () => {},
      applyInteractionState: () => {},
      applyLightPreset: (preset?: string) => { if (preset) appliedPresets.push(preset); },
      applyAudioPreset: () => {},
    },
    borrow: {
      createBorrowedObject: () => {},
      destroyBorrowedObject: () => {},
      setBorrowedObjectAnchored: () => {},
    },
    applyCognitionVisual: () => {},
    restoreCognition: () => {},
  };
}

describe("MechanicsOrchestrator", () => {
  it("creates with default state", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: sampleCognitionObjects,
        borrowables: sampleBorrowables,
        puzzles: samplePuzzles,
        evidence: sampleEvidence,
        narrativeGates: sampleGates,
      },
      bindings,
    );

    expect(orchestrator.currentCognition).toBe("protagonist");
    expect(orchestrator.profile.cognitionUsage["protagonist"]).toBe(0);
    expect(orchestrator.evidence.has("waterline-direction")).toBe(false);
  });

  it("switches cognition and updates profile", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: sampleCognitionObjects,
        borrowables: sampleBorrowables,
        puzzles: samplePuzzles,
        evidence: sampleEvidence,
        narrativeGates: sampleGates,
      },
      bindings,
    );

    orchestrator.switchCognition("wife");
    expect(orchestrator.currentCognition).toBe("wife");
    expect(orchestrator.profile.cognitionUsage["wife"]).toBe(1);
  });

  it("discovers evidence and tracks discovery order", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: sampleCognitionObjects,
        borrowables: sampleBorrowables,
        puzzles: samplePuzzles,
        evidence: sampleEvidence,
        narrativeGates: sampleGates,
      },
      bindings,
    );

    const isNew = orchestrator.discoverEvidence("waterline-direction", ["space"]);
    expect(isNew).toBe(true);
    expect(orchestrator.profile.evidenceDiscoveryOrder).toEqual(["waterline-direction"]);
    expect(orchestrator.profile.evidenceChannelWeights["space"]).toBe(1);

    // Duplicate discovery
    const isDuplicate = orchestrator.discoverEvidence("waterline-direction", ["space"]);
    expect(isDuplicate).toBe(false);
  });

  it("records puzzle tokens and detects solutions", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: sampleCognitionObjects,
        borrowables: sampleBorrowables,
        puzzles: samplePuzzles,
        evidence: sampleEvidence,
        narrativeGates: sampleGates,
      },
      bindings,
    );

    orchestrator.recordPuzzleToken("waterline-puzzle", "stain-wife");
    expect(orchestrator.getPuzzleState("waterline-puzzle").tokens).toEqual(["stain-wife"]);
    expect(orchestrator.getPuzzleState("waterline-puzzle").solved).toBe(false);

    orchestrator.recordPuzzleToken("waterline-puzzle", "stain-gardener");
    expect(orchestrator.getPuzzleState("waterline-puzzle").solved).toBe(true);
    expect(orchestrator.getPuzzleState("waterline-puzzle").worldStateId).toBe("reversed");
  });

  it("evaluates narrative gates", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: sampleCognitionObjects,
        borrowables: sampleBorrowables,
        puzzles: samplePuzzles,
        evidence: sampleEvidence,
        narrativeGates: sampleGates,
      },
      bindings,
    );

    // Gate requires "west.contradiction.waterline" flag
    expect(orchestrator.evaluateNarrativeGates(["west.contradiction.waterline"])).toEqual([
      "both-testimonies",
    ]);
    expect(orchestrator.hasNarrativeGate("both-testimonies")).toBe(true);
  });

  it("serializes mechanic state", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: sampleCognitionObjects,
        borrowables: sampleBorrowables,
        puzzles: samplePuzzles,
        evidence: sampleEvidence,
        narrativeGates: sampleGates,
        saved: {
          ...createDefaultMechanicSaveState(),
          currentCognition: "wife",
          discoveredEvidence: ["waterline-direction"],
        },
      },
      bindings,
    );

    const state = orchestrator.serializeMechanicState();
    expect(state.currentCognition).toBe("wife");
    expect(state.discoveredEvidence).toEqual(["waterline-direction"]);
  });

  it("tracks borrow sources in profile", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: sampleCognitionObjects,
        borrowables: sampleBorrowables,
        puzzles: samplePuzzles,
        evidence: sampleEvidence,
        narrativeGates: sampleGates,
      },
      bindings,
    );

    orchestrator.switchCognition("gardener");
    orchestrator.executeBorrow("corridor-segment", "west-entry");

    expect(orchestrator.profile.borrowSources["gardener"]).toEqual(["corridor-segment"]);
  });

  it("resets loop cooldowns", () => {
    const bindings = createTestBindings();
    const orchestrator = new MechanicsOrchestrator(
      {
        cognitionObjects: [],
        borrowables: [],
        puzzles: [],
        evidence: [],
        narrativeGates: [],
      },
      bindings,
    );

    expect(() => orchestrator.loop.reset()).not.toThrow();
  });
});
