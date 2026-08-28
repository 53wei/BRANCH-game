import { describe, expect, it } from "vitest";
import { createCheckpoint } from "../campaign-save";
import { createChapterCompletePayload, resolveChaseOutcome } from "./chapter-behavior";

describe("west chapter chase and completion", () => {
  it("keeps chasing, fails on contact/timeout, and prioritizes a valid escape", () => {
    expect(resolveChaseOutcome({ reachedExit: false, ownerDistance: 3, elapsedMs: 12_000 })).toBe("active");
    expect(resolveChaseOutcome({ reachedExit: false, ownerDistance: 1.1, elapsedMs: 12_000 })).toBe("failed");
    expect(resolveChaseOutcome({ reachedExit: false, ownerDistance: 3, elapsedMs: 42_001 })).toBe("failed");
    expect(resolveChaseOutcome({ reachedExit: true, ownerDistance: 0.5, elapsedMs: 50_000 })).toBe("escaped");
  });

  it("preserves evidence and trust in the chapter-complete event payload", () => {
    const checkpoint = createCheckpoint("west-corridor-loop", "wife");
    checkpoint.earnedFlags = ["west.chapter.complete", "campaign.witness.wife", "campaign.witness.gardener"];
    checkpoint.contradictions = ["waterline-direction", "corridor-count"];
    checkpoint.trustDecisions["west-water-motive"] = "protect";
    expect(createChapterCompletePayload("west-corridor-loop", checkpoint)).toEqual({
      chapterId: "west-corridor-loop",
      earnedFlags: checkpoint.earnedFlags,
      contradictions: checkpoint.contradictions,
      trustDecision: "protect",
    });
  });
});
