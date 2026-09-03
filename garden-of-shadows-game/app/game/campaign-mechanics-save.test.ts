import { describe, expect, it } from "vitest";
import { createCheckpoint, createDefaultSave, normalizeSave } from "./campaign-save";

describe("campaign mechanic checkpoint integration", () => {
  it("creates chapter checkpoints with a matching cognition and safe anchor", () => {
    const checkpoint = createCheckpoint("west-corridor-loop", "wife");
    expect(checkpoint.mechanics.currentCognition).toBe("wife");
    expect(checkpoint.anchorId).toBe("ROUTE_02_A_ENTRY");
    expect(checkpoint.mechanics.safeAnchorId).toBe("ROUTE_02_A_ENTRY");
  });

  it("migrates an older v2 checkpoint from its memory projection", () => {
    const source = createDefaultSave() as unknown as Record<string, unknown>;
    const checkpoint = source.activeCheckpoint as Record<string, unknown>;
    checkpoint.memoryId = "gardener";
    delete checkpoint.mechanics;
    expect(normalizeSave(source).activeCheckpoint.mechanics.currentCognition).toBe("gardener");
  });

  it("persists only logical borrow state and normalizes mechanic collections", () => {
    const source = createDefaultSave();
    source.activeCheckpoint.mechanics = {
      ...source.activeCheckpoint.mechanics,
      currentCognition: "gardener",
      discoveredEvidence: ["loop-landmark", "loop-landmark"],
      narrativeGates: ["CH1_ROUTE_CONFIRMED", "CH1_ROUTE_CONFIRMED"],
      anchorSlot: { borrowedObjectId: "source-bridge", sourceCognition: "gardener", targetAnchorId: "gap-anchor" },
      borrowedObject: {
        borrowedObjectId: "source-bridge",
        sourceCognition: "gardener",
        runtimePrefabId: "bridge-segment",
        collisionPrefabId: "bridge-collider",
        targetAnchorId: "gap-anchor",
        anchored: true,
      },
    };
    const checkpoint = normalizeSave(source).activeCheckpoint;
    expect(checkpoint.mechanics.discoveredEvidence).toEqual(["loop-landmark"]);
    expect(checkpoint.mechanics.narrativeGates).toEqual(["CH1_ROUTE_CONFIRMED"]);
    expect(checkpoint.mechanics.borrowedObject?.runtimePrefabId).toBe("bridge-segment");
    expect(JSON.stringify(checkpoint.mechanics)).not.toContain("geometry");
  });
});
