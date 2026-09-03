import { describe, expect, it } from "vitest";
import { createCheckpoint, inheritInvestigationState, normalizeSave } from "../campaign-save";
import type { CheckpointState } from "../types";
import { deriveEndingLens, endingMetricSnapshot } from "./finale-ending";

const checkpointWithUsage = (usage: Partial<CheckpointState["reconstructionTrace"]["cognitionUsage"]>) => {
  const checkpoint = createCheckpoint("fifth-tingyuxuan", "zhaoying");
  checkpoint.reconstructionTrace.cognitionUsage = { ...usage };
  return checkpoint;
};

describe("TASK-013 ending stability metrics", () => {
  it("falls back to Ending E for old/no-metric and balanced investigations", () => {
    expect(deriveEndingLens(checkpointWithUsage({}))).toBe("composite");
    expect(deriveEndingLens(checkpointWithUsage({ wife: 4, gardener: 4, accountant: 4, painter: 4 }))).toBe("composite");
    expect(deriveEndingLens(checkpointWithUsage({ wife: 5, gardener: 4, accountant: 1, painter: 0 }))).toBe("composite");
  });

  it.each([
    ["wife", "domestic"],
    ["gardener", "spatial"],
    ["accountant", "documentary"],
    ["painter", "pictorial"],
  ] as const)("derives %s cognition into %s only with a clear lead", (memory, ending) => {
    const checkpoint = checkpointWithUsage({ wife: 1, gardener: 1, accountant: 1, painter: 1, [memory]: 5 });
    expect(deriveEndingLens(checkpoint)).toBe(ending);
  });

  it("also counts cognition used to solve and observe evidence without counting mandatory flags", () => {
    const checkpoint = checkpointWithUsage({});
    checkpoint.observedBy = { drawing: ["painter", "painter"], ledger: ["accountant"] };
    checkpoint.reconstructionTrace.solvedWithCognition = { angle: ["painter"], ink: ["accountant"] };
    checkpoint.earnedFlags = ["north.evidence.sixth-teacup", "north.evidence.departure-record", "north.evidence.rain-figure"];
    const snapshot = endingMetricSnapshot(checkpoint);
    expect(snapshot.scores.painter).toBeGreaterThan(snapshot.scores.accountant);
    expect(snapshot.scores.wife).toBe(0);
  });

  it("preserves investigation metrics when moving into another chapter", () => {
    const source = checkpointWithUsage({ wife: 3, painter: 1 });
    source.observedBy = { portrait: ["painter"] };
    source.reconstructionTrace.anchoredFragments = ["west.borrowed-step"];
    const target = inheritInvestigationState(source, createCheckpoint("north-tower-ledger", "wife"));
    expect(target.reconstructionTrace.cognitionUsage).toEqual({ wife: 3, painter: 1 });
    expect(target.observedBy).toEqual({ portrait: ["painter"] });
    expect(target.reconstructionTrace.anchoredFragments).toEqual(["west.borrowed-step"]);
  });

  it("normalizes legacy saves that have no cognitionUsage", () => {
    const checkpoint = createCheckpoint("fifth-tingyuxuan", "zhaoying");
    const legacyTrace = checkpoint.reconstructionTrace as Partial<CheckpointState["reconstructionTrace"]>;
    delete legacyTrace.cognitionUsage;
    const normalized = normalizeSave({
      schemaVersion: 2,
      activeCheckpoint: checkpoint,
      completedChapters: [],
      unlockedChapters: ["fifth-tingyuxuan"],
      endingIds: [],
    });
    expect(normalized.activeCheckpoint.reconstructionTrace.cognitionUsage).toEqual({});
    expect(deriveEndingLens(normalized.activeCheckpoint)).toBe("composite");
  });
});
